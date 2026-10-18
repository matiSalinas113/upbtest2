# Lienzo: frontend conectado a la API de productos

Next.js con exportación estática para Firebase Hosting (proyecto `upbtest2-cedbe`). El panel de productos consulta Express/PostgreSQL en Render directamente desde el navegador; Firebase sirve el frontend, no almacena los productos.

## Desarrollo local

1. En `backendUpbtest`, configura `.env` según su README y ejecuta `npm.cmd run db:init` y `npm.cmd start` (puerto 3000).
2. En esta carpeta ejecuta `npm.cmd ci` y copia `.env.example` a `.env.local`.
3. Ejecuta `npm.cmd run dev -- --port 3001` y abre http://localhost:3001.

Sin `NEXT_PUBLIC_API_URL`, la app usa `https://backendupbtest.onrender.com`. Para conectar a otra API cambia esa variable y reinicia el servidor de desarrollo. No incluyas `/api` al final de la URL. El primer inicio de Render puede tardar un minuto.

## Operaciones conectadas

| Interacción | Endpoint |
| --- | --- |
| Información y estado de conexión | GET /api/info y GET /api/health |
| Listar y actualizar listado | GET /api/productos |
| Buscar por nombre | GET /api/productos?nombre=texto |
| Ver detalle / cargar edición | GET /api/productos/:id |
| Crear | POST /api/productos |
| Editar | PUT /api/productos/:id |
| Eliminar con confirmación | DELETE /api/productos/:id |

Los errores del backend se muestran en pantalla. El formulario valida nombre, precio y stock; el listado se actualiza después de guardar o eliminar. No se utilizan datos simulados ni almacenamiento local como sustituto de la API.

## Validación y Firebase

Ejecuta `npm.cmd run lint` y `npm.cmd run build`; este último genera `out/`, la carpeta configurada en `firebase.json`.

Para publicar manualmente: `npx firebase-tools deploy --only hosting --project upbtest2-cedbe` después del build. Los workflows existentes generan previews en PR y publican desde `main`; requieren el service account de Firebase ya configurado en los secrets del repositorio.

En GitHub puedes configurar la variable de repositorio `NEXT_PUBLIC_API_URL` para cambiar la URL de Render utilizada al compilar. El valor por defecto ya apunta a Render. Las variables `NEXT_PUBLIC_*` son públicas y quedan incorporadas al build: después de cambiarlas debes recompilar y desplegar. Nunca coloques `DATABASE_URL` en el frontend.

Para verificar el cliente real contra el backend hermano y su PostgreSQL configurado: `npm.cmd run test:integration` (Node 22.18 o superior, ambos repositorios con dependencias instaladas). Crea un producto temporal y lo elimina al finalizar. No se ejecuta en el workflow del frontend, que solo tiene ese repositorio.

## Guion para presentar

1. Abre la app y muestra el estado «Servidor y base de datos conectados».
2. Crea un producto con nombre «Obra de demostración», precio 120 y stock 3.
3. Búscalo por «demostración» y abre «Ver» para consultar el detalle desde la API.
4. Edita el precio o stock y guarda. Usa «Actualizar» para comprobar la persistencia.
5. Recarga la página: el producto sigue guardado en PostgreSQL.
6. Elimina el producto y confirma que desaparece del listado.

Arquitectura: navegador → frontend Next.js servido por Firebase Hosting → API Express en Render → PostgreSQL. El backend y sus pruebas están en [backendUpbtest](https://github.com/matiSalinas113/backendUpbtest).

La conexión se comprueba al abrir la app y al pulsar «Actualizar». Si Render está iniciando o la base falla, el panel presenta el estado y permite reintentar. Para una presentación local usa el backend en el puerto 3000 y el frontend en el 3001 según las instrucciones anteriores.
