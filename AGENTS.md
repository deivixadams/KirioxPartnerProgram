Actúa como arquitecto senior de software y construye un sistema web completo (backend + frontend) para gestión de vendedores con red multinivel (máximo 2 niveles), productos, seguimiento comercial básico y cálculo de comisiones por producto.


1. Load and follow:
- `C:\Users\donde\.agents\skills\_KIRIOX\vercel-react-best-practices\SKILL.md` (when task touches React/Next.js UI/performance)


## Estilo
Glassmorphism

Stack preferido:
- Backend: Node.js + NestJS
- Base de datos: PostgreSQL
- ORM: Prisma
- Frontend: Next.js + Tailwind
- Autenticación: JWT

El sistema debe ser minimalista, robusto y enfocado en red comercial + productos + comisiones. No construir un CRM complejo.

---

## 1. Modelo de negocio (obligatorio)

### Red de vendedores
- Un vendedor puede existir sin padre → nivel 1
- Un vendedor puede tener un padre → nivel 2
- Un vendedor nivel 1 puede tener múltiples subvendedores
- Un vendedor nivel 2 NO puede tener subvendedores
- Profundidad máxima: 2 niveles
- No permitir ciclos

### Relación vendedores-productos (CRÍTICO)
- Un vendedor puede vender múltiples productos
- Un producto puede ser vendido por múltiples vendedores
- Relación muchos-a-muchos obligatoria
- Un vendedor debe tener al menos un producto asignado al crearse
- Un vendedor NO puede vender productos no asignados

### Clientes
- Cada cliente pertenece a un vendedor
- No permitir duplicados (email o teléfono)

### Workflow de ventas
Estados:
- PROSPECT
- CONTACTED
- NEGOTIATION
- WON
- LOST

### Deals (ventas)
- Un deal SIEMPRE debe estar asociado a:
  - cliente
  - vendedor
  - producto

### Comisiones
- Comisión directa: vendedor que cierra
- Comisión override: vendedor padre (si existe)
- Comisiones dependen del producto
- No recalcular histórico si cambia jerarquía

---

## 2. Modelo de datos (Prisma)

### Vendor
- id
- name
- email
- phone
- status (ACTIVE, SUSPENDED, RETIRED)
- parentVendorId (nullable)
- level (1 o 2)
- createdAt

### Product
- id
- name
- code
- description
- isActive
- createdAt

### VendorProduct (relación muchos-a-muchos + reglas comerciales)
- id
- vendorId
- productId
- commissionDirectPercentage
- commissionOverridePercentage
- isActive
- createdAt

### Client
- id
- name
- email
- phone
- company
- ownerVendorId
- createdAt

### Deal
- id
- clientId
- vendorId
- productId
- title
- amount
- stage
- closedAt
- result

### DealHistory
- id
- dealId
- fromStage
- toStage
- note
- changedBy
- createdAt

### Commission
- id
- dealId
- vendorId
- type (DIRECT, OVERRIDE)
- percentage
- amount
- status (PENDING, APPROVED, PAID)
- createdAt

### VendorRelationshipHistory
- id
- vendorId
- oldParentId
- newParentId
- effectiveDate
- changedBy
- reason

---

## 3. Lógica de negocio (backend)

### Crear vendedor
- Debe incluir lista de productos
- Validar que tenga al menos 1 producto
- Si tiene padre:
  - validar que padre sea nivel 1
  - asignar nivel 2
- Si no tiene padre:
  - nivel 1

### Asignar productos a vendedor
- Permitir múltiples productos
- Permitir configurar comisión por producto
- No eliminar productos si existen deals históricos

### Validación clave
- Un vendedor NO puede crear deals con productos que no tiene asignados

### Crear cliente
- Validar duplicados
- Asignar ownerVendorId

### Crear deal
- Validar:
  - cliente existe
  - vendedor existe
  - producto existe
  - vendedor tiene ese producto asignado

### Cambiar estado de deal
- Registrar en DealHistory

### Cerrar deal (WON)
- Obtener configuración VendorProduct
- Crear comisión directa:
  - porcentaje desde VendorProduct
- Si existe padre:
  - buscar si el padre también tiene ese producto
  - aplicar comisión override
- Guardar ambas comisiones

---

## 4. Jerarquía y control

### Independizar vendedor
- parentVendorId = null
- level = 1
- registrar en historial
- no afecta comisiones pasadas

### Cambiar padre
- validar:
  - nuevo padre nivel 1
  - no crear tercer nivel
  - no ciclos
- registrar historial
- aplicar cambios solo hacia futuro

---

## 5. API REST

### Vendors
- POST /vendors
- PATCH /vendors/:id/assign-parent
- PATCH /vendors/:id/remove-parent
- PATCH /vendors/:id/products
- GET /vendors

### Products
- POST /products
- GET /products

### Clients
- POST /clients
- GET /clients

### Deals
- POST /deals
- PATCH /deals/:id/stage
- GET /deals

### Commissions
- GET /commissions
- PATCH /commissions/:id/pay

---

## 6. Frontend (Next.js)

### Dashboard
- ventas totales
- comisiones

### Vendedores
- lista
- crear
- asignar padre
- gestionar productos

### Productos
- crear
- listar

### Clientes
- lista
- crear
- detalle

### Pipeline
- kanban simple
- mover estados

### Comisiones
- listado por vendedor
- estado

---

## 7. Reglas de calidad

- Arquitectura modular
- Validaciones estrictas
- Manejo de errores consistente
- Seed inicial
- README con instrucciones

---

## 8. Entregables

Generar:

1. Estructura del proyecto
2. Schema Prisma completo
3. Servicios backend
4. Endpoints funcionales
5. Frontend básico
6. Ejemplos de requests
7. Instrucciones de ejecución

NO simplificar lógica.
Implementar validaciones reales.