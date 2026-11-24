# Ensayo de separación de ImpulsaSueños Sorteos

Base de producción: a73e807c7d767aa1cf90303427e23a002dfe3bc3. Esta rama es un candidato de extracción. El middleware de ensayo restringe operaciones y el backend de compilación es deliberadamente inerte.

## Antes de una prueba transaccional

Provisionar Supabase de ensayo con esquema, RPC, Auth, permisos, buckets y datos ficticios. Configurar Flow de pruebas con confirmación y retorno propios y un destino de correo de pruebas. Revisar los dominios absolutos del panel de afiliados y de los correos. Adaptar el middleware de ensayo solo para ese entorno. Restaurar la navegación administrativa específica de Sorteos y verificar los guardias de cada ruta. Contrastar las rutas del build con el inventario de producción.

## Ensayo y corte

Probar compra directa y con afiliado, packs, tickets, comisión única, notificaciones repetidas de Flow, pago pendiente, vencimiento, OTP y descarga privada. Registrar el despliegue estable y las órdenes pendientes antes del cambio. Mantener un solo receptor operativo de confirmaciones por orden y conciliar tickets, pagos y ledger antes y después. Revertir el alias a la versión estable si la conciliación falla. La migración de base de datos se ensaya por separado.
