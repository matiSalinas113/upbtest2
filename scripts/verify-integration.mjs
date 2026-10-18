// Ejecuta el cliente real contra Express y PostgreSQL; elimina solo el registro creado por esta prueba.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { once } from 'node:events';
const backendRequire = createRequire(new URL('../../backendUpbtest/package.json', import.meta.url));
const app = backendRequire('./src/app.js');
const pool = backendRequire('./src/config/db.js');
const server = app.listen(0, '127.0.0.1');
let id;
try {
  await once(server, 'listening');
  process.env.NEXT_PUBLIC_API_URL = `http://127.0.0.1:${server.address().port}`;
  const { api } = await import('../lib/api.ts');
  assert.equal((await api.info()).nombre, 'backendupb');
  assert.equal((await api.health()).database, 'connected');
  assert.ok(Array.isArray(await api.listar()));
  const nombre = `Integracion_${Date.now()}_%`;
  const created = await api.crear({ nombre, precio: 12.5, stock: 3 });
  id = created.id;
  assert.equal(created.nombre, nombre);
  assert.equal(created.precio, 12.5);
  assert.equal((await api.obtener(id)).stock, 3);
  const filtered = await api.listar(nombre.toLowerCase());
  assert.deepEqual(filtered.map(p => p.id), [id]);
  assert.deepEqual(await api.listar(`${nombre}_inexistente`), []);
  const updated = await api.actualizar(id, { precio: 0, stock: 0 });
  assert.equal(updated.nombre, nombre);
  assert.equal(updated.precio, 0);
  assert.equal(updated.stock, 0);
  assert.equal((await api.obtener(id)).precio, 0);
  await assert.rejects(api.crear({ nombre: '', precio: -1, stock: 0 }), /nombre|precio/);
  const preflight = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productos/${id}`, { method: 'OPTIONS', headers: { Origin: 'https://upbtest2-cedbe.web.app', 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'content-type' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), '*');
  assert.match(preflight.headers.get('access-control-allow-methods'), /PUT/);
  await api.eliminar(id);
  const removed = id;
  id = undefined;
  await assert.rejects(api.obtener(removed), /Producto no encontrado/);
  console.log('OK: cliente frontend -> HTTP -> Express -> PostgreSQL: info, health, listado, busqueda, detalle, POST, PUT parcial, DELETE, validacion 400, 404 y CORS Firebase. Registro temporal eliminado.');
} finally {
  if (id) await pool.query('DELETE FROM productos WHERE id = $1', [id]);
  await new Promise(resolve => server.close(resolve));
  await pool.end();
}
