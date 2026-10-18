# Credenciales y archivos locales

Los logs `firebase-debug*.log`, la cache `.firebase/` y `.env.local` no se versionan. Las credenciales privadas de Firebase se configuran en GitHub Actions Secrets y nunca se colocan en el frontend ni en archivos JSON versionados.

`NEXT_PUBLIC_API_URL` y el identificador del proyecto Firebase son publicos. Ningun valor `NEXT_PUBLIC_*` debe contener un secreto: se incorpora al JavaScript descargado por el navegador. `.env.example` solo documenta configuracion publica y valores de ejemplo.

`npm run security:check` busca tokens de GitHub/Google, claves privadas, cuentas de servicio y archivos sensibles en los archivos versionados. El CI lo ejecuta antes del build. Es una comprobacion de patrones, no una garantia de detectar cualquier secreto.

Si una credencial fue expuesta, debe revocarse o rotarse en el proveedor y retirarse del historial. Cifrar el archivo despues de publicarlo no invalida la credencial filtrada.

Despues de una limpieza del historial, las otras copias del repositorio deben volver a clonarse o sincronizarse con cuidado para no reintroducir commits antiguos. Las copias, forks y vistas de commits antiguos fuera de las ramas actuales pueden requerir limpieza adicional por parte del proveedor.
