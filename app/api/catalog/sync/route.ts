import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  throwIfSupabaseError,
} from "@/lib/supabase/admin";

type StoreTerm = { id: number; name: string; slug: string };
type StoreAttribute = {
  id: number;
  name: string;
  taxonomy: string | null;
  terms: StoreTerm[];
};
type StoreVariation = {
  id: number;
  attributes: Array<{ name: string; value: string }>;
};
type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  short_description?: string;
  prices?: { price?: string };
  categories?: Array<{ name: string }>;
  images?: Array<{ src: string }>;
  attributes?: StoreAttribute[];
  variations?: StoreVariation[];
};

const STORE_API = "https://questioncolor.com.ar/wp-json/wc/store/v1/products";

function plainText(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isHomeUse(category: string, name: string) {
  const value = `${category} ${name}`.toLowerCase();
  const professionalOnly = [
    "coloración",
    "coloracion",
    "oxidante",
    "decolor",
    "técnico",
    "tecnico",
    "1500",
    "1.500",
  ];
  return !professionalOnly.some((term) => value.includes(term));
}

function variantLabel(product: StoreProduct, variation: StoreVariation) {
  const termNames = new Map<string, string>();
  for (const attribute of product.attributes ?? []) {
    for (const term of attribute.terms ?? [])
      termNames.set(term.slug, term.name);
  }
  return variation.attributes
    .map(
      (attribute) =>
        termNames.get(attribute.value) ?? attribute.value.replace(/-/g, " "),
    )
    .filter(Boolean)
    .join(" · ");
}

export async function POST() {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "Primero conectá Supabase desde Vercel" },
      { status: 503 },
    );
  }

  try {
    const all: StoreProduct[] = [];
    for (let page = 1; page <= 20; page += 1) {
      const response = await fetch(`${STORE_API}?per_page=10&page=${page}`, {
        headers: { "User-Agent": "Question-Pro-Catalog-Sync/1.0" },
        cache: "no-store",
      });
      if (!response.ok) {
        if (response.status === 400) break;
        throw new Error(`El catálogo respondió ${response.status}`);
      }
      const rows = (await response.json()) as StoreProduct[];
      if (!rows.length) break;
      all.push(...rows);
      if (rows.length < 10) break;
    }

    const supabase = getSupabaseAdmin();
    const currentResult = await supabase
      .from("products")
      .select("id,professional_price,physical_stock,reserved_stock");
    throwIfSupabaseError(
      currentResult.error,
      "No se pudo leer el catálogo actual",
    );
    const existing = new Map(
      (currentResult.data ?? []).map((row) => [row.id, row]),
    );

    const values = all.flatMap((product) => {
      const category = product.categories?.[0]?.name ?? "Otros";
      const imageUrl = product.images?.[0]?.src ?? "";
      const publicPrice = Number(product.prices?.price ?? 0);
      const variants = product.variations?.length
        ? product.variations.map((variation) => ({
            id: `q-${variation.id}`,
            variant: variantLabel(product, variation),
          }))
        : [{ id: `q-${product.id}`, variant: "" }];

      return variants.map((variant) => {
        const previous = existing.get(variant.id);
        return {
          id: variant.id,
          source_product_id: product.id,
          name: plainText(product.name),
          variant: variant.variant,
          sku: product.sku || "N/A",
          slug: product.slug,
          category,
          image_url: imageUrl,
          description: plainText(
            product.short_description || product.description,
          ),
          public_price: publicPrice,
          professional_price:
            previous?.professional_price ?? Math.round(publicPrice * 0.72),
          b2c_enabled: isHomeUse(
            category,
            `${product.name} ${variant.variant}`,
          ),
          physical_stock: previous?.physical_stock ?? 0,
          reserved_stock: previous?.reserved_stock ?? 0,
          active: true,
          updated_at: new Date().toISOString(),
        };
      });
    });

    const upsert = await supabase
      .from("products")
      .upsert(values, { onConflict: "id" });
    throwIfSupabaseError(upsert.error, "No se pudo guardar el catálogo");

    return Response.json({
      ok: true,
      sourceProducts: all.length,
      variants: values.length,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo sincronizar el catálogo",
      },
      { status: 502 },
    );
  }
}
