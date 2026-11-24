# Identidad visual Raffles — Quinto / Propuesta 4
Estado: BASE PREPARADA EN RAMA DE DESARROLLO; despliegue pendiente de validación.

## Alcance
Brandbook aprobado de Quinto: colores, tipografías y elementos (pp. 6–11).
Logo aprobado expresamente: captura de PROPUESTA 4. El PDF no sustituye esa elección.
No modificar textos comerciales ni contenido de la web durante cambio visual.

- Sitio: /raffles/**
- Afiliados: /raffles/partners/**
- Administración de Sorteos: /admin/raffles/**
- NO intervenir Campañas ni sus API.

## Tokens (Brandbook)
- Púrpura: #7048E8 (primario / CTA)
- Verde noche: #002314 (texto / fondos oscuros)
- Lima: #A8C63A (acento)
- Crema: #FAF9F5 (fondo claro)
- Lavanda: #EDE8FD (superficies de apoyo)

## Tipografías
- Urbanist para títulos (500/700/900).
- Roboto para párrafos y UI (300/400/500/700).
- Fuentes: lib/raffles/brand/fonts.ts.
- CSS scoped: lib/raffles/brand/raffles-brand.css.
- Layouts exclusivos: app/raffles/layout.tsx y app/admin/raffles/layout.tsx.
- No tocar app/layout.tsx ni app/globals.css compartidos con Campañas.

## Logo aprobado
La captura PROPUESTA 4 es la referencia oficial, pero no es un archivo maestro:
contiene un encabezado de presentación y tiene resolución limitada.
Obtener de Quinto/archivo aprobado la versión SVG o PNG transparente de alta resolución
y sus variantes claro/oscuro. Guardarlas en public/raffles/brand.
No sobrescribir public/logo.png, public/logo-email.png o favicon compartidos.

## Orden de migración
1. Confirmar compilación y alcance de tokens/fuentes.
2. Navbar y footer de Raffles; luego portada, tarjetas y componentes compartidos.
3. Página del sorteo, checkout, tickets, login y resultados; no cambiar lógica.
4. Partners: layout, navegación, dashboard, recursos, perfil y retiros.
5. Administración Raffles: layouts y componentes, después páginas.
6. Sidebar padre admin compartido: cambiar SOLO de modo condicional cuando
   pathname.startsWith('/admin/raffles'); validar /admin/campaigns sin cambios.
7. QA visual móvil/escritorio: tablas, formularios, errores, contraste, foco y legibilidad.

## Reglas de seguridad
No tocar SQL/RPC, Flow, webhooks, idempotencia, tickets, ledgers, OTP o retiros.
Desplegar solo el proyecto Sorteos después de compilar y revisar diffs.
No fusionar main: Campañas se despliega desde esa rama.
