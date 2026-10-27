// Service worker de la app de los clientes: guarda SOLO la carcasa de la propia pagina (HTML, iconos y marca) para abrirla sin conexion.
// Primero busca siempre la version nueva en la red (para no quedarse con una app vieja) y solo si no hay red usa la copia.
// NUNCA toca nada de otros dominios: las llamadas a la nube (datos de salud) no pasan por aqui ni se guardan.
const V = "mw-v1";
const CARCASA = ["./", "icono-180.png", "icono-192.png", "icono-512.png", "manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CARCASA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;      // otros dominios (Supabase) y todo lo que no sea GET: directo a la red
  e.respondWith(
    fetch(r.mode === "navigate" ? r.url : r, { cache: "no-cache" })
      .then(resp => { if (resp.ok) { const copia = resp.clone(); caches.open(V).then(c => c.put(r, copia)); } return resp; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === "navigate" ? caches.match("./", { ignoreSearch: true }) : Response.error())))
  );
});
