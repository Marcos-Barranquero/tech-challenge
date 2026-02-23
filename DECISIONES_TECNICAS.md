# Decisiones Técnicas y Trade-offs

Este documento resume las decisiones clave del proyecto, por qué se tomaron y qué coste/compromiso implican. Está alineado con la evolución reflejada en `/CHANGELOG.md`.

## 1) BFF con tRPC + Fastify (en lugar de consumir PokéAPI desde el frontend)

**Decisión**
- Centralizar en backend toda interacción con PokéAPI y exponer al frontend un contrato tipado (`tRPC` + `Zod`).

**Por qué**
- Evitar cascadas de peticiones y lógica N+1 en cliente.
- Homogeneizar errores, normalización de datos y timeouts/retries.
- Mantener tipado end-to-end en monorepo (`packages/shared`).

**Trade-offs**
- Más complejidad backend y coste de mantenimiento.
- Necesidad de diseñar bien contratos para no acoplar frontend y backend en exceso.

---

## 2) Contrato compartido y versionado (tRPC + REST/OpenAPI)

**Decisión**
- Mantener contratos tipados compartidos para uso interno y exponer además endpoints REST documentados (OpenAPI/Swagger).

**Por qué**
- `tRPC` optimiza DX del equipo frontend/backend.
- OpenAPI permite interoperabilidad externa y versionado explícito de API.

**Trade-offs**
- Doble superficie de integración (tRPC + REST) que hay que mantener coherente.

---

## 3) Caché backend + warmup configurable

**Decisión**
- Introducir caché en servicios del BFF y precarga al arranque (`initial`/`full`) con concurrencia limitada.

**Por qué**
- Reducir latencia percibida en consultas frecuentes.
- Evitar recalcular/consultar constantemente PokéAPI.

**Trade-offs**
- Invalidación y observabilidad de caché.
- Riesgo de sobrecarga si warmup no se controla (mitigado con límites de concurrencia).

---

## 4) Resiliencia de red (timeouts, retries, backoff)

**Decisión**
- Blindar llamadas a APIs externas (PokéAPI y proveedores IA) con timeouts y reintentos controlados.

**Por qué**
- Las dependencias externas son inestables por naturaleza; la app debe degradar de forma segura.

**Trade-offs**
- Mayor complejidad en el cliente HTTP.
- Posible incremento de tiempo total en errores persistentes.

---

## 5) Estado de negocio en URL (filtros, búsqueda, detalle)

**Decisión**
- El estado funcional principal vive en query params (`search`, `generation`, `types`, `pokemon`).

**Por qué**
- Navegación shareable (copiar URL), soporte back/forward y recarga sin perder contexto.
- Menor dependencia de estado local para lógica de negocio.

**Trade-offs**
- Más lógica de parseo/sincronización.
- URL más extensa en escenarios de filtros múltiples.

---

## 6) Filtro multi-tipo restrictivo (intersección AND)

**Decisión**
- Si se seleccionan varios tipos, se devuelve la intersección (el Pokémon debe tener todos los tipos seleccionados).

**Por qué**
- Resultado más preciso para usuarios avanzados.
- Coherencia con intención “filtrar por combinación”.

**Trade-offs**
- Puede devolver pocos resultados (UX más “estricta” que OR).
- Requiere comunicación clara en interfaz.

---

## 7) SPA con URL dinámica para el detalle

**Decisión**
- Navegación inline dentro de la “pantalla GBA” sin recarga completa, manteniendo URL actualizada.

**Por qué**
- UX fluida, estilo app interactiva.
- Conserva deep-linking y posibilidad de compartir estado concreto.

**Trade-offs**
- Mayor complejidad de transiciones y sincronización estado/UI.

---

## 8) IA opcional por proveedor (none / Ollama / Groq)

**Decisión**
- Estrategia de proveedor seleccionada por entorno/script, no por el usuario final desde UI.

**Por qué**
- Control de coste y seguridad en backend.
- Evitar que clientes fuerzen proveedores de pago.
- Facilitar despliegue real (entornos distintos con misma base de código).

**Trade-offs**
- Configuración operativa más compleja.
- Diferencias de latencia/calidad entre proveedores.

---

## 9) Fallback determinista cuando no hay IA

**Decisión**
- Si IA falla o está deshabilitada, se entrega texto determinista local.

**Por qué**
- Evitar dependencia dura de IA en flujo principal.
- Garantizar continuidad funcional.

**Trade-offs**
- Menor riqueza narrativa frente a contenido generado.

---

## 10) Internacionalización (EN/ES/IT/PT/DE)

**Decisión**
- Soporte multiidioma en UI y textos de detalle, incluyendo tipos y estados vacíos.

**Por qué**
- Mejor experiencia para audiencia internacional y diferenciación del entregable.

**Trade-offs**
- Mayor coste de mantenimiento de mensajes, pruebas y consistencia terminológica.

---

## 11) Persistencia de preferencias de UI (tema, idioma)

**Decisión**
- Persistir preferencias visuales en cliente.

**Por qué**
- Mejora UX: el usuario recupera su configuración al volver.

**Trade-offs**
- Gestión de estado adicional y casos edge entre SSR/CSR.

---

## 12) Diseño responsive por matriz fija de catálogo

**Decisión**
- Densidad controlada por breakpoint en la vista colección:
  - desktop: `6 x 2`
  - tablet: `3 x 2`
  - mobile: `2 x 2`

**Por qué**
- Evitar solapes, recortes y comportamientos erráticos en tamaños intermedios.
- UX más predecible tipo “slot/page”.

**Trade-offs**
- Menos flexibilidad “fluida”.
- Lógica de layout más sofisticada (mediciones y ajuste dinámico).

---

## 13) Testing por capas

**Decisión**
- Cobertura combinada: unit, contract, component y E2E.

**Por qué**
- Detectar regresiones en lógica de negocio, contratos y UX real.
- Seguridad al iterar en una interfaz muy custom.

**Trade-offs**
- Mayor tiempo de CI y mantenimiento de tests.

---

## 14) Docker/Compose por perfiles y script unificado

**Decisión**
- Perfiles explícitos (`none`, `ollama`, `groq`) + script `pokedex-stack.sh`.

**Por qué**
- Reproducibilidad local y facilidad de demo.
- Cambio de modo de IA sin tocar código.

**Trade-offs**
- Complejidad de configuración y documentación de entornos.

---

## Resumen ejecutivo

La arquitectura prioriza **tipado fuerte, resiliencia, UX consistente y capacidad de evolución** frente a la simplicidad inicial. Se asumió complejidad adicional (BFF, perfiles IA, responsive avanzado) para ganar control operativo, calidad percibida y defendibilidad técnica en un contexto de prueba fullstack.
