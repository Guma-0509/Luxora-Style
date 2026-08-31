# 📖 Wally Commerce — Documentación Oficial de la API REST

Documentación técnica y referencia de todos los endpoints de la API de Wally Commerce.

* **Base URL**: `http://localhost:4000/api/v1`
* **Swagger UI Interactivo**: `http://localhost:4000/api/docs`
* **Formato de Respuesta Estándar**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": { ... },
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
  ```

---

## 1. Módulo de Autenticación & RBAC (`/auth`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Público | Registro de nuevo cliente |
| `POST` | `/auth/login` | Público | Inicio de sesión con emisión de par de tokens (Access + Refresh) |
| `POST` | `/auth/admin/login` | Público | Inicio de sesión exclusivo para administradores |
| `POST` | `/auth/refresh` | Público | Rotación atómica de Refresh Token y emisión de nuevo Access Token |
| `GET` | `/auth/profile` | Autenticado | Obtener perfil del usuario activo |
| `PUT` | `/auth/profile` | Autenticado | Actualizar nombre, apellido, teléfono o avatar |
| `POST` | `/auth/change-password` | Autenticado | Cambio de contraseña con validación de contraseña actual |
| `POST` | `/auth/logout` | Autenticado | Revocación de refresh tokens y cierre de sesión seguro |

---

## 2. Módulo de Catálogo & Productos (`/products`, `/categories`, `/brands`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Público | Catálogo con búsqueda facetada, filtros de categoría, marca, precio y stock |
| `GET` | `/products/featured` | Público | Obtener productos destacados |
| `GET` | `/products/offers` | Público | Obtener productos con ofertas relámpago |
| `GET` | `/products/new-arrivals` | Público | Obtener productos recién llegados |
| `GET` | `/products/slug/:slug` | Público | Detalle completo de producto por slug con variantes y especificaciones |
| `GET` | `/categories` | Público | Árbol jerárquico de categorías |
| `GET` | `/categories/:id` | Público | Detalle de categoría |
| `GET` | `/brands` | Público | Listado de marcas con conteo de productos |
| `POST` | `/admin/products` | Admin (`products:create`) | Crear nuevo producto maestro con especificaciones e imágenes |
| `PUT` | `/admin/products/:id` | Admin (`products:update`) | Actualizar producto maestro |
| `DELETE` | `/admin/products/:id` | Admin (`products:delete`) | Soft delete (archivado) de producto |
| `POST` | `/admin/products/:id/duplicate` | Admin (`products:create`) | Duplicar producto y variantes a estado borrador |
| `PATCH` | `/admin/products/:id/status` | Admin (`products:update`) | Cambiar estado (`DRAFT`, `PUBLISHED`, `ARCHIVED`) |

---

## 3. Módulo de Inventario & Almacén (`/admin/inventory`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/inventory` | Admin (`inventory:read`) | Resumen de inventario, stock por variante, alertas de stock bajo y métricas |
| `GET` | `/admin/inventory/variants/:variantId/movements` | Admin (`inventory:read`) | Historial de movimientos (Kardex) de una variante |
| `POST` | `/admin/inventory/variants/:id/adjust` | Admin (`inventory:adjust`) | Ajuste transaccional de stock (`PURCHASE`, `RESTOCK`, `RETURN`, `DAMAGED`, `ADJUSTMENT`) con auditoría |
| `POST` | `/admin/inventory/variants` | Admin (`inventory:create`) | Crear nueva variante con SKU, atributos y stock inicial |
| `PUT` | `/admin/inventory/variants/:id` | Admin (`inventory:update`) | Actualizar datos y precios de una variante |
| `DELETE` | `/admin/inventory/variants/:id` | Admin (`inventory:delete`) | Eliminar o desactivar variante |

---

## 4. Módulo de Cupones & Descuentos (`/coupons`, `/admin/coupons`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/coupons/validate` | Público | Valida código de cupón y calcula monto exacto de descuento para el carrito |
| `GET` | `/admin/coupons` | Admin (`coupons:read`) | Listado de todos los cupones configurados |
| `POST` | `/admin/coupons` | Admin (`coupons:create`) | Crear cupón con reglas (% o fijo, fecha inicio/fin, minSpend, maxUsage) |
| `PUT` | `/admin/coupons/:id` | Admin (`coupons:update`) | Modificar cupón existente |
| `DELETE` | `/admin/coupons/:id` | Admin (`coupons:delete`) | Eliminar cupón |

---

## 5. Módulo de Carrito & Checkout (`/cart`, `/checkout`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Público / User | Obtener items y subtotales del carrito (soporta `sessionId` de invitado) |
| `POST` | `/cart/items` | Público / User | Agregar producto/variante al carrito con validación de stock |
| `PATCH` | `/cart/items/:itemId` | Público / User | Modificar cantidad de un item |
| `DELETE` | `/cart/items/:itemId` | Público / User | Eliminar item del carrito |
| `DELETE` | `/cart` | Público / User | Vaciar carrito |
| `POST` | `/checkout/calculate` | Público / User | Cálculo atómico del checkout (subtotal, cupón, envío e impuestos) |

---

## 6. Módulo de Pedidos & Seguimiento (`/orders`, `/admin/orders`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Cliente | Crear pedido con deducción atómica de inventario y snapshot histórico |
| `GET` | `/orders/my-orders` | Cliente | Historial de compras del cliente |
| `GET` | `/orders/my-orders/:id` | Cliente | Detalle y seguimiento del pedido con trazabilidad de despacho |
| `GET` | `/admin/orders` | Admin (`orders:read`) | Listado de órdenes con filtros de estado, cliente y fechas |
| `GET` | `/admin/orders/:id` | Admin (`orders:read`) | Detalle administrativo de una orden |
| `PATCH` | `/admin/orders/:id/status` | Admin (`orders:update`) | Transición de estados (`PENDING` $\rightarrow$ `PAID` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED` / `CANCELLED`), transportista y número de guía |

---

## 7. Módulo de Analítica & Auditoría Administrativa (`/admin`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/metrics/overview` | Admin (`audit:read`) | KPIs del dashboard (Ventas totales, del día, del mes, órdenes, stock crítico) |
| `GET` | `/admin/metrics/sales-chart` | Admin (`audit:read`) | Serie de tiempo de ventas agrupadas por día para gráficas |
| `GET` | `/admin/metrics/top-products` | Admin (`audit:read`) | Ranking de productos más vendidos |
| `GET` | `/admin/metrics/recent-orders` | Admin (`orders:read`) | Últimas órdenes recibidas |
| `GET` | `/admin/audit-logs` | Admin (`audit:read`) | Bitácora de auditoría con payloads JSON de mutaciones |
