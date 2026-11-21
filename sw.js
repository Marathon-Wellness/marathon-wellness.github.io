// Service worker de la app de clientes: la red manda (siempre la version publicada) y, sin conexion, se abre la ultima copia vista.
// No guarda nada de la nube (las llamadas a Supabase no pasan por aqui): solo la propia pagina y sus iconos.
const V = "mw-v1";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ca => ca.put(r, c)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match("./"))));
});
