# Guion de Defensa (5-7 minutos)

## 1) Apertura (30-45s)

“He construido una Pokédex fullstack con arquitectura BFF.  
El frontend en Next.js no consume PokéAPI directamente: todo pasa por una API tipada con tRPC/Zod.  
Esto me permite controlar rendimiento, errores, caché y coherencia de datos, además de mantener una UX fluida y responsive.”

---

## 2) Arquitectura (1 min)

“La solución está dividida en monorepo:
- `apps/web`: experiencia de usuario (App Router + UI GBA responsive),
- `apps/api`: orquestación de datos, caché y proveedores IA,
- `packages/shared`: contratos tipados compartidos.

Separé transporte, lógica de negocio y presentación para poder escalar sin acoplamiento.”

---

## 3) Decisiones clave y trade-offs (2-3 min)

### BFF con tRPC en vez de llamadas directas
- **Por qué**: evita N+1 en cliente, centraliza resiliencia, y simplifica frontend.
- **Trade-off**: más backend que mantener.

### Contrato compartido + OpenAPI
- **Por qué**: tRPC para DX interna; OpenAPI para interoperabilidad/versionado.
- **Trade-off**: mantener dos superficies sincronizadas.

### Estado principal en URL
- **Por qué**: filtros/búsqueda/detalle compartibles y navegación natural (back/forward/reload).
- **Trade-off**: más parseo/sincronización.

### Filtro multi-tipo por intersección (AND)
- **Por qué**: precisión funcional (combinaciones reales).
- **Trade-off**: puede mostrar menos resultados que OR.

### IA opcional (none / Ollama / Groq)
- **Por qué**: robustez y control de coste por entorno.
- **Trade-off**: mayor complejidad de configuración.

---

## 4) Rendimiento y resiliencia (1 min)

“En backend añadí caché, warmup configurable y control de concurrencia para reducir latencia.  
También configuré timeout/retry para dependencias externas.  
Si IA no está disponible, hay fallback determinista, así que el flujo nunca se rompe.”

---

## 5) UX/UI y responsive (45s)

“Diseñé mobile-first con breakpoints claros y una matriz de catálogo estable por dispositivo, evitando solapes y recortes.  
También cuidé estados de carga/vacío/error y accesibilidad básica en controles custom.”

---

## 6) Testing y calidad (45s)

“Cubrí varias capas:
- unit (servicios, parsers, stores),
- contract/router (API),
- component/hook (frontend),
- E2E (flujos críticos: filtros, detalle, idioma, persistencia).

Esto me permitió iterar en UI compleja sin degradar comportamiento.”

---

## 7) Cierre (20s)

“La solución prioriza tipado, rendimiento y experiencia real de uso.  
Está preparada para evolucionar: cambiar proveedor IA, ampliar features de negocio o desplegar en entornos reales sin rehacer la arquitectura base.”

---

# Preguntas difíciles (y respuesta corta)

## “¿Por qué no solo frontend contra PokéAPI?”
“Porque perdería control de resiliencia, caché y normalización, y me expondría a N+1 y variabilidad de latencia en cliente.”

## “¿Por qué URL state y no solo store global?”
“Porque el estado de negocio debe ser compartible y navegable; el store lo dejé para preferencias de UI.”

## “¿Por qué tRPC y además OpenAPI?”
“tRPC optimiza desarrollo interno; OpenAPI permite contratos externos y versionado formal.”

## “¿Qué pasa si cae la IA?”
“Hay fallback determinista. La app sigue funcionando y el usuario no pierde el flujo.”

## “¿Cuál es el principal cuello de botella?”
“Dependencias externas (PokéAPI/IA). Está mitigado con caché, warmup y control de red.”

---

# Versión ultra corta (2 minutos)

“Implementé una Pokédex fullstack con BFF tipado (tRPC + Zod) para aislar el frontend de PokéAPI, optimizar rendimiento y manejar resiliencia de forma centralizada.  
Guardé estado funcional en URL para shareability y navegación natural.  
Diseñé un responsive consistente por breakpoints con UX tipo consola y detalle inline con URL dinámica.  
Integré IA opcional por entorno (none/ollama/groq) con fallback para no romper el producto.  
Y lo validé con tests por capas (unit, contract, component y E2E) para iterar rápido sin regresiones.”
