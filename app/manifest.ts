import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Question Pro",
    short_name: "Question Pro",
    description:
      "Gestión para peluquerías y distribución Question Professional",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f3ed",
    theme_color: "#11120f",
    lang: "es-AR",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
