"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../../lib/api";
import type { InfoApi, Producto } from "../../lib/api";

const empty = { nombre: "", precio: "", stock: "" };
const message = (error: unknown) => error instanceof Error ? error.message : "Ocurrió un error inesperado.";
const money = (value: number) => new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(value);

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [info, setInfo] = useState<InfoApi | null>(null);
  const [health, setHealth] = useState("Conectando con el servidor…");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(empty);
  const [selected, setSelected] = useState<Producto | null>(null);
  const [detail, setDetail] = useState<Producto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const sequence = useRef(0);
  const nameInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async (nombre: string) => {
    const current = ++sequence.current;
    setLoading(true);
    try {
      const items = await api.listar(nombre);
      if (current === sequence.current) setProductos(items);
    } catch (error) {
      if (current === sequence.current) setError(message(error));
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }, []);

  const check = useCallback(async () => {
    setHealth("Comprobando conexión…");
    const [infoResult, healthResult] = await Promise.allSettled([api.info(), api.health()]);
    setInfo(infoResult.status === "fulfilled" ? infoResult.value : null);
    setHealth(healthResult.status === "fulfilled" && healthResult.value.database === "connected"
      ? "Servidor y base de datos conectados" : "Conexión no disponible. Pulsa actualizar para reintentar.");
  }, []);

  useEffect(() => {
    let active = true;
    const current = ++sequence.current;
    void api.listar().then(items => {
      if (active && current === sequence.current) setProductos(items);
    }).catch(error => {
      if (active && current === sequence.current) setError(message(error));
    }).finally(() => {
      if (active && current === sequence.current) setLoading(false);
    });
    void Promise.allSettled([api.info(), api.health()]).then(([infoResult, healthResult]) => {
      if (!active) return;
      setInfo(infoResult.status === "fulfilled" ? infoResult.value : null);
      setHealth(healthResult.status === "fulfilled" && healthResult.value.database === "connected"
        ? "Servidor y base de datos conectados" : "Conexión no disponible. Pulsa actualizar para reintentar.");
    });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const datos = { nombre: form.nombre.trim(), precio: Number(form.precio), stock: Number(form.stock) };
      if (!datos.nombre || !Number.isFinite(datos.precio) || datos.precio < 0 || !Number.isInteger(datos.stock) || datos.stock < 0) throw new Error("Revisa el nombre, precio y stock del producto.");
      const saved = selected ? await api.actualizar(selected.id, datos) : await api.crear(datos);
      setNotice(selected ? "Producto actualizado." : "Producto creado.");
      if (detail?.id === saved.id) setDetail(saved);
      setForm(empty); setSelected(null);
      await refresh(query);
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  }

  async function show(producto: Producto, edit: boolean) {
    setBusy(true); setError(""); setNotice("");
    try {
      const fresh = await api.obtener(producto.id);
      if (edit) {
        setSelected(fresh);
        setForm({ nombre: fresh.nombre, precio: String(fresh.precio), stock: String(fresh.stock) });
        nameInput.current?.focus();
      } else setDetail(fresh);
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!pendingDelete) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api.eliminar(pendingDelete.id);
      if (selected?.id === pendingDelete.id) { setSelected(null); setForm(empty); }
      if (detail?.id === pendingDelete.id) setDetail(null);
      setPendingDelete(null); setNotice("Producto eliminado.");
      await refresh(query);
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  }

  return (
    <section className="inventory" id="productos" aria-labelledby="productos-title">
      <div className="section-heading"><div><p className="eyebrow">LA COLECCIÓN, EN TUS MANOS</p><h2 id="productos-title">Productos e inventario</h2></div>
        <button type="button" disabled={loading || busy} onClick={() => { setError(""); void refresh(query); void check(); }}>Actualizar</button></div>
      <p className="connection" role="status">{health}{info && ` · ${info.nombre} v${info.version}`}</p>
      {error && <p className="feedback error" role="alert">{error}</p>}
      {notice && <p className="feedback success" role="status">{notice}</p>}
      <div className="inventory-grid">
        <form className="product-form" onSubmit={save}>
          <h3>{selected ? `Editar producto #${selected.id}` : "Nuevo producto"}</h3>
          <fieldset disabled={busy}>
            <label htmlFor="nombre">Nombre</label><input ref={nameInput} id="nombre" required maxLength={100} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del producto" />
            <label htmlFor="precio">Precio (Bs)</label><input id="precio" type="number" min="0" max="99999999.99" step="0.01" required value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0.00" />
            <label htmlFor="stock">Stock</label><input id="stock" type="number" min="0" max="2147483647" step="1" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
            <div className="product-actions"><button className="button" type="submit">{busy ? "Procesando…" : selected ? "Guardar cambios" : "Crear producto"}</button>
              {selected && <button type="button" onClick={() => { setSelected(null); setForm(empty); }}>Cancelar</button>}</div>
          </fieldset>
        </form>
        <div className="product-list" aria-busy={loading}>
          <form className="product-search" onSubmit={e => { e.preventDefault(); setQuery(search.trim()); setError(""); void refresh(search); }}>
            <label className="sr-only" htmlFor="buscar">Buscar productos por nombre</label><input id="buscar" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre…" maxLength={100} />
            <button disabled={loading || busy} type="submit">Buscar</button>
            {query && <button type="button" disabled={busy || loading} onClick={() => { setSearch(""); setQuery(""); setError(""); void refresh(""); }}>Limpiar</button>}
          </form>
          {loading ? <p role="status">Cargando productos… El primer inicio puede tardar un minuto.</p> : <>
            <p className="product-count">{productos.length} producto(s){query && ` · búsqueda: ${query}`}</p>
            {productos.length === 0 ? <p>{error ? "No se pudieron cargar los productos. Reintenta con Actualizar." : query ? "No hay productos con ese nombre." : "Aún no hay productos. Crea el primero."}</p> :
              <div className="table-scroll"><table><caption className="sr-only">Inventario de productos</caption><thead><tr><th>ID</th><th>Producto</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
                <tbody>{productos.map(p => <tr key={p.id}><td>#{p.id}</td><td>{p.nombre}</td><td>{money(p.precio)}</td><td>{p.stock}</td><td><div className="row-actions">
                  <button disabled={busy} onClick={() => void show(p, false)} aria-label={`Ver ${p.nombre}`}>Ver</button><button disabled={busy} onClick={() => void show(p, true)} aria-label={`Editar ${p.nombre}`}>Editar</button><button className="danger" disabled={busy} onClick={() => setPendingDelete(p)} aria-label={`Eliminar ${p.nombre}`}>Eliminar</button>
                </div></td></tr>)}</tbody></table></div>}
          </>}
          {detail && <aside className="product-detail" aria-label="Detalle del producto"><h3>{detail.nombre}</h3><p>Producto #{detail.id} · {money(detail.precio)} · Stock: {detail.stock}</p><p>Creado: {new Date(detail.createdAt).toLocaleString("es-BO")}</p><button type="button" onClick={() => setDetail(null)}>Cerrar detalle</button></aside>}
          {pendingDelete && <div className="delete-confirm" role="alert"><p>¿Eliminar «{pendingDelete.nombre}»? Esta acción elimina el producto de la colección.</p><div className="product-actions"><button className="danger" disabled={busy} onClick={() => void remove()}>Confirmar eliminación</button><button disabled={busy} onClick={() => setPendingDelete(null)}>Cancelar</button></div></div>}
        </div>
      </div>
    </section>
  );
}
