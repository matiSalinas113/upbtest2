export type Producto = { id: number; nombre: string; precio: number; stock: number; createdAt: string };
export type DatosProducto = Pick<Producto, "nombre" | "precio" | "stock">;
export type InfoApi = { nombre: string; version: string; mensaje: string };
export type SaludApi = { status: string; database: string };

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://backendupbtest.onrender.com").replace(/\/+$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
      cache: "no-store",
      signal: options.signal ?? AbortSignal.timeout(90000),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo. El primer inicio puede tardar un minuto.");
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || (response.status === 503 ? "La base de datos no está disponible." : `El servidor respondió con un error (${response.status}).`));
  if (data === null) throw new Error("El servidor devolvió una respuesta inesperada.");
  return data as T;
}

export const api = {
  info: () => request<InfoApi>("/api/info"),
  health: () => request<SaludApi>("/api/health"),
  listar: (nombre = "") => request<Producto[]>(`/api/productos${nombre.trim() ? `?nombre=${encodeURIComponent(nombre.trim())}` : ""}`),
  obtener: (id: number) => request<Producto>(`/api/productos/${id}`),
  crear: (datos: DatosProducto) => request<Producto>("/api/productos", { method: "POST", body: JSON.stringify(datos) }),
  actualizar: (id: number, datos: Partial<DatosProducto>) => request<Producto>(`/api/productos/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
  eliminar: (id: number) => request<void>(`/api/productos/${id}`, { method: "DELETE" }),
};
