# Guía de instalación de Question Pro

Esta guía está pensada para publicar la aplicación sin usar una terminal ni escribir código.

## Resultado final

Al terminar vas a tener:

- El código guardado en un repositorio privado de GitHub.
- Una dirección pública de Vercel para abrir desde computadora o celular.
- Una base Supabase que mantiene los cambios después de actualizar.
- Datos ficticios para probar sin comprometer información real.

## Parte 1 · Preparar GitHub

### 1. Crear el repositorio

1. Ingresá en `https://github.com`.
2. Presioná el signo `+` de la esquina superior derecha.
3. Elegí `New repository`.
4. Nombre: `question-pro`.
5. Elegí `Private`.
6. Marcá `Add a README file`.
7. Presioná `Create repository`.

### 2. Instalar GitHub Desktop

1. Ingresá en `https://desktop.github.com`.
2. Descargá e instalá GitHub Desktop.
3. Iniciá sesión con tu cuenta de GitHub.

No subas las carpetas manualmente desde el navegador. GitHub Desktop conserva toda la estructura del proyecto y evita que los archivos queden en lugares incorrectos.

### 3. Clonar el repositorio

1. En GitHub Desktop elegí `File`.
2. Presioná `Clone repository`.
3. Seleccioná `question-pro`.
4. Elegí una carpeta de tu computadora.
5. Presioná `Clone`.

### 4. Copiar el proyecto

1. Descomprimí `question-pro-vercel.zip`.
2. Entrá en la carpeta descomprimida.
3. Seleccioná todo lo que contiene.
4. Copialo dentro de la carpeta que clonó GitHub Desktop.
5. Aceptá reemplazar `README.md` si Windows lo consulta.

La raíz tiene que mostrar directamente `app`, `components`, `public`, `supabase` y `package.json`. Si todos aparecen dentro de otra carpeta intermedia, movelos un nivel hacia arriba.

### 5. Enviar los archivos a GitHub

1. Volvé a GitHub Desktop.
2. En `Summary` escribí `Primera versión de Question Pro`.
3. Presioná `Commit to main`.
4. Presioná `Push origin`.
5. Abrí GitHub en el navegador y verificá que aparezcan los archivos.

## Parte 2 · Publicar en Vercel

### 6. Importar el repositorio

1. Ingresá en `https://vercel.com`.
2. Presioná `Add New`.
3. Elegí `Project`.
4. Buscá `question-pro`.
5. Presioná `Import`.

Verificá:

- Framework Preset: `Next.js`.
- Root Directory: `./`.
- Build Command: automático.
- Output Directory: vacío.
- Install Command: automático.

Presioná `Deploy`.

La primera publicación mostrará datos ficticios locales aunque Supabase todavía no esté conectado.

## Parte 3 · Conectar Supabase

### 7. Instalar Supabase desde Vercel

1. Entrá al proyecto `question-pro` en Vercel.
2. Buscá `Storage`, `Integrations` o `Marketplace`.
3. Buscá `Supabase`.
4. Presioná `Install`.
5. Elegí crear un proyecto nuevo.
6. Nombre: `question-pro-db`.
7. Elegí la región sudamericana disponible más cercana.
8. Vinculalo solamente al proyecto `question-pro`.

Vercel agregará automáticamente las variables de conexión. No copies ninguna clave dentro de GitHub.

### 8. Crear las tablas

1. Desde la integración presioná `Open in Supabase`.
2. En el menú izquierdo elegí `SQL Editor`.
3. Presioná `New query`.
4. En tu computadora abrí `supabase/schema.sql` con el Bloc de notas.
5. Copiá todo el contenido.
6. Pegalo en el SQL Editor.
7. Presioná `Run`.

Debería aparecer un mensaje indicando que la consulta terminó correctamente.

### 9. Volver a publicar

1. Regresá a Vercel.
2. Entrá en `Deployments`.
3. En la última publicación presioná los tres puntos.
4. Elegí `Redeploy`.
5. Confirmá.

## Parte 4 · Comprobar que funciona

Abrí la dirección que entrega Vercel y probá:

1. Elegí `Administrador Question`.
2. Entrá en `Venta asistida`.
3. Seleccioná Peluquería Griselda.
4. Agregá productos y confirmá la venta.
5. Revisá `Pedidos y entregas`.
6. Marcá el pedido como entregado.
7. Revisá el stock.
8. Entrá en Peluquerías y registrá un pago.
9. Cambiá al perfil `Peluquería` y creá un turno.
10. Cambiá a `Cliente final` y reservá otro turno.
11. Realizá una compra domiciliaria de prueba.
12. Actualizá la página.

Si los pedidos y turnos continúan visibles, Supabase está funcionando.

## Parte 5 · Probar desde el celular

1. Abrí el enlace de Vercel desde Chrome o Safari.
2. Ingresá al menú del navegador.
3. Elegí `Agregar a pantalla de inicio` o `Instalar aplicación`.
4. Abrí Question Pro desde el nuevo ícono.

## Qué hacer si Vercel muestra un error

No cambies archivos al azar. Abrí el error, sacá una captura donde se vea el mensaje completo y enviala en este chat. Con esa captura podremos identificar el paso exacto que falló.

## Importante durante el piloto

- No cargues datos reales de clientes todavía.
- No publiques claves o contraseñas en GitHub.
- Mantené el repositorio como privado.
- Mercado Pago y WhatsApp pueden probarse en modo demostración.
- La autenticación definitiva se agrega después de validar los recorridos.
