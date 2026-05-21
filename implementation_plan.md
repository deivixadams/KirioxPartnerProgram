# Plan de Implementación: Rename Vendor → Partner + Productos + Validación Clientes

## Descripción General

Se requieren tres cambios principales:

1. **Renombrar "Vendor/Vendedor" → "Partner"** en toda la aplicación (DB, backend, frontend)
2. **Agregar endpoint POST y modal de creación de Productos** (actualmente solo GET existe)
3. **Verificar lógica de Clientes** (asignación temporal, plazo, liberación)

> [!IMPORTANT]
> **No se modifican permisos**: todos los roles siguen teniendo acceso a todas las funciones.

---

## User Review Required

> [!WARNING]
> **Plazo de clientes: ¿30 días o 60 días?**
> El usuario especifica "1 mes" como plazo para concretar la venta. Sin embargo, la implementación actual usa **60 días** en todos los lugares:
> - [clients.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/clients.service.ts#L65-L66): `sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)`
> - [notifications/route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/notifications/route.ts#L9): Alertas a partir del día 50
> - [clients/page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/clients/page.tsx#L93): `const daysRemaining = Math.max(0, 60 - daysSinceAssignment)`
>
> **¿Debe cambiarse a 30 días (1 mes) o se mantienen los 60 días actuales?**

> [!IMPORTANT]
> **Terminología Head Partner vs Partner:**
> - Nivel 1 (sin padre) = **Head Partner**
> - Nivel 2 (con padre) = **Partner**
>
> ¿Es correcta esta interpretación?

---

## Open Questions

1. **¿Cambiar el valor del enum `RoleName` de `VENDEDOR` a `PARTNER` en la base de datos?** Esto requeriría una migración de datos para los usuarios existentes. La alternativa más segura es mantener `VENDEDOR` en la DB pero mostrar "Partner" en la UI.

2. **¿Renombrar las tablas de la base de datos o solo los modelos de Prisma?** Recomendación: usar `@@map()` en Prisma para mantener los nombres de tabla actuales y evitar migraciones complejas de datos, renombrando solo los modelos a nivel de código.

---

## Proposed Changes

### Componente 1: Prisma Schema (Rename Vendor → Partner)

#### [MODIFY] [schema.prisma](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/prisma/schema.prisma)

Renombrar todos los modelos, enums y campos relacionados con "Vendor" a "Partner". Usar `@@map` para preservar los nombres de tabla en la DB y evitar migraciones destructivas.

**Cambios específicos:**

| Actual | Nuevo | Nota |
|--------|-------|------|
| `enum VendorStatus` | `enum PartnerStatus` | Agregar `@@map("VendorStatus")` si se preserva DB |
| `model Vendor` | `model Partner` | Agregar `@@map("Vendor")` |
| `vendor Vendor?` (en User) | `partner Partner?` | |
| `parentVendorId` | `parentPartnerId` | Agregar `@map("parentVendorId")` |
| `parentVendor` | `parentPartner` | |
| `subVendors` | `subPartners` | |
| `ownerVendorId` (en Client) | `ownerPartnerId` | Agregar `@map("ownerVendorId")` |
| `vendorId` (en Deal) | `partnerId` | Agregar `@map("vendorId")` |
| `vendor` (relación en Deal) | `partner` | |
| `vendorId` (en Commission) | `partnerId` | Agregar `@map("vendorId")` |
| `vendor` (relación en Commission) | `partner` | |
| `model VendorRelationshipHistory` | `model PartnerRelationshipHistory` | Agregar `@@map("VendorRelationshipHistory")` |
| `vendorId` (en VRH) | `partnerId` | Agregar `@map("vendorId")` |
| Relación `"VendorHierarchy"` | `"PartnerHierarchy"` | Solo nombre de relación en código |

**Ejemplo de cómo quedaría el modelo Partner:**

```prisma
enum PartnerStatus {
  ACTIVE
  SUSPENDED
  RETIRED

  @@map("VendorStatus")
}

model Partner {
  id                   String        @id @default(uuid())
  name                 String
  userId               String?       @unique
  user                 User?         @relation(fields: [userId], references: [id])
  phone                String?
  status               PartnerStatus @default(ACTIVE)
  parentPartnerId      String?       @map("parentVendorId")
  parentPartner        Partner?      @relation("PartnerHierarchy", fields: [parentPartnerId], references: [id])
  subPartners          Partner[]     @relation("PartnerHierarchy")
  level                Int           @default(1)
  commissionPercentage Float         @default(0)
  createdAt            DateTime      @default(now())

  clients                        Client[]
  deals                          Deal[]
  commissions                    Commission[]
  relationshipHistory            PartnerRelationshipHistory[]
  PartnerRelationshipHistoryOld  PartnerRelationshipHistory[] @relation("OldParent")
  PartnerRelationshipHistoryNew  PartnerRelationshipHistory[] @relation("NewParent")

  @@map("Vendor")
}
```

> [!NOTE]
> - En `User`, cambiar `vendor Vendor?` → `partner Partner?`
> - En `Client`, cambiar `ownerVendorId` → `ownerPartnerId` con `@map("ownerVendorId")`, y `owner Vendor?` → `owner Partner?`
> - En `Deal`, cambiar `vendorId` → `partnerId` con `@map("vendorId")`, y `vendor Vendor` → `partner Partner`
> - En `Commission`, cambiar `vendorId` → `partnerId` con `@map("vendorId")`, y `vendor Vendor` → `partner Partner`
> - En `PartnerRelationshipHistory` (antes VRH), cambiar todos los `vendorId` → `partnerId` con `@map`, y relaciones `Vendor` → `Partner`

---

#### [MODIFY] [seed.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/prisma/seed.ts)

- Cambiar `VendorStatus` → `PartnerStatus` en imports
- Cambiar `prisma.vendor.upsert(...)` → `prisma.partner.upsert(...)`
- Cambiar todas las referencias a campos: `parentVendorId` → `parentPartnerId`, `ownerVendorId` → `ownerPartnerId`
- Cambiar variables: `subVendorX1` → `subPartnerX1`
- Actualizar comentarios en español

---

### Componente 2: Backend Services (Rename)

#### [DELETE] [vendors.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/vendors.service.ts)
#### [NEW] [partners.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/partners.service.ts)

Crear `PartnersService` con la misma lógica de `VendorsService` pero con nomenclatura actualizada:

- Clase: `VendorsService` → `PartnersService`
- Todos los `prisma.vendor.*` → `prisma.partner.*`
- Campos: `parentVendorId` → `parentPartnerId`
- Relaciones incluidas: `parentVendor` → `parentPartner`, `subVendors` → `subPartners`
- Mensajes de error: `'Parent vendor not found'` → `'Parent partner not found'`, etc.
- `roleName: 'VENDEDOR'` — **MANTENER** si se decide no renombrar el enum de BD

---

#### [MODIFY] [clients.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/clients.service.ts)

- Cambiar `ownerVendorId` → `ownerPartnerId` en todas las ocurrencias (líneas 6, 20, 25, 39, 77)
- Mensaje de error: `'assigned to a vendor'` → `'assigned to a partner'`

---

#### [MODIFY] [deals.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/deals.service.ts)

- Cambiar `vendorId` → `partnerId` en destructuring (línea 7) y en queries
- Cambiar `ownerVendorId` → `ownerPartnerId` (líneas 20, 25)
- Cambiar `client.ownerVendorId !== vendorId` → `client.ownerPartnerId !== partnerId`
- Mensajes de error: `'belongs to another vendor'` → `'belongs to another partner'`
- En `findAll()`: include `vendor: true` → `partner: true`

---

#### [MODIFY] [commissions.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/commissions.service.ts)

- `deal.vendor` → `deal.partner`
- `parentVendor` → `parentPartner` en includes
- `vendorId: deal.vendorId` → `partnerId: deal.partnerId`
- `vendorId: parent.id` → `partnerId: parent.id`
- En `findAll()`: include `vendor: true` → `partner: true`

---

#### [MODIFY] [users.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/users.service.ts)

- `vendor: { include: { parentVendor: true } }` → `partner: { include: { parentPartner: true } }`

---

#### [MODIFY] [simple.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/simple.service.ts)

- La clase `ClientsService` aquí incluye `owner: true` — sin cambio necesario ya que `owner` es el nombre de relación, no `vendor`. Sin embargo, verificar que tras renombrar el modelo Prisma la relación siga siendo `owner`.
- **Sin cambios necesarios** en este archivo si los nombres de relación (`owner`) se mantienen.

---

### Componente 3: API Routes (Rename + Products POST)

#### [DELETE] `src/app/api/vendors/route.ts`
#### [NEW] [route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/partners/route.ts)

Crear nueva ruta `/api/partners` con los mismos handlers (GET, POST, PATCH) pero importando `PartnersService`:

```typescript
import { NextResponse } from 'next/server';
import { PartnersService } from '@/lib/services/partners.service';

export async function GET() {
  try {
    const partners = await PartnersService.findAll();
    return NextResponse.json(partners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const partner = await PartnersService.create(body);
    return NextResponse.json(partner);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    const percentage = Number(body.percentage);
    if (!id) return NextResponse.json({ error: 'Missing partner id' }, { status: 400 });
    if (isNaN(percentage)) return NextResponse.json({ error: 'Invalid percentage' }, { status: 400 });
    const partner = await PartnersService.updateCommission(id, percentage);
    return NextResponse.json(partner);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

---

#### [MODIFY] [route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/products/route.ts) — Agregar POST

Agregar el handler POST para crear productos. El servicio `ProductsService.create()` ya existe en [simple.service.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/simple.service.ts#L10-L12).

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validaciones básicas
    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: 'Name and code are required' }, 
        { status: 400 }
      );
    }
    
    const product = await ProductsService.create({
      name: body.name,
      code: body.code,
      description: body.description || null,
      isActive: body.isActive ?? true,
    });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

---

#### [MODIFY] [route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/stats/route.ts)

- Cambiar `prisma.vendor.count()` → `prisma.partner.count()` (línea 19)
- Cambiar `vendorCount` label si se desea (opcional, es una key de JSON interno)

---

#### [MODIFY] [route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/notifications/route.ts)

- Sin cambios directos de "vendor" — usa la relación `owner` que no cambia de nombre.
- **Sin cambios necesarios.**

---

#### [MODIFY] [route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/deals/route.ts)

- Sin importaciones de vendor — usa `DealsService` directamente.
- **Sin cambios necesarios** en el route handler. Los cambios están en el servicio.

---

#### [MODIFY] [route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/commissions/route.ts)

- Verificar si importa algo de vendor. Probablemente no — solo usa `CommissionsService`.
- **Revisar y confirmar**, probablemente sin cambios.

---

### Componente 4: API Client Frontend

#### [MODIFY] [api.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/api.ts)

Cambios:

```diff
-export const VendorsAPI = {
-  getAll: () => api.get('/vendors'),
-  getById: (id: string) => api.get(`/vendors/${id}`),
-  create: (data: any) => api.post('/vendors', data),
-  updateCommission: (id: string, percentage: number) => api.patch('/vendors', { id, percentage }),
-}
+export const PartnersAPI = {
+  getAll: () => api.get('/partners'),
+  getById: (id: string) => api.get(`/partners/${id}`),
+  create: (data: any) => api.post('/partners', data),
+  updateCommission: (id: string, percentage: number) => api.patch('/partners', { id, percentage }),
+}

 export const ProductsAPI = {
   getAll: () => api.get('/products'),
+  create: (data: any) => api.post('/products', data),
 }
```

---

### Componente 5: Frontend Pages (Rename + Products Modal)

#### [DELETE] `src/app/vendors/page.tsx`
#### [NEW] [page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/partners/page.tsx)

Recrear la página de partners con los siguientes cambios de nomenclatura:

| Antes (UI text) | Después |
|-----------------|---------|
| "Red de Vendedores" | "Red de Partners" |
| "Nuevo Vendedor" | "Nuevo Partner" |
| "Buscar por nombre o email de usuario..." | "Buscar por nombre o email..." |
| "Configurar Nuevo Canal" | "Configurar Nuevo Partner" |
| "Nombre del Vendedor" | "Nombre del Partner" |
| "Jerarquía (Vendedor Padre)" | "Jerarquía (Head Partner)" |
| "Independiente (Nivel 1)" | "Head Partner (Nivel 1)" |
| "Nivel 1" badge | "Head Partner" badge |
| "Nivel 2" badge | "Partner" badge |
| Componente `VendorCard` | `PartnerCard` |
| Componente `AddVendorModal` | `AddPartnerModal` |
| Imports `VendorsAPI` | `PartnersAPI` |
| Variables `vendors` | `partners` |
| `formData.parentVendorId` | `formData.parentPartnerId` |
| "Error al crear vendedor" | "Error al crear partner" |

---

#### [MODIFY] [page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/products/page.tsx) — Agregar modal de creación

Agregar un modal funcional al hacer clic en "Añadir Producto" con los campos:
- **Nombre** (requerido)
- **Código** (requerido, ej. "KR-04")
- **Descripción** (opcional)

El modal debe seguir el mismo estilo glassmorphism que los modals existentes (ver [AddClientModal en clients/page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/clients/page.tsx#L197-L387) como referencia).

Debe:
1. Agregar estado `isModalOpen`
2. Conectar el botón "Añadir Producto" al `onClick`
3. Crear componente `AddProductModal` con form y validación
4. Llamar a `ProductsAPI.create(data)` al enviar
5. Refrescar la lista tras éxito

---

#### [MODIFY] [page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/page.tsx) — Dashboard

Cambios de nomenclatura:

| Antes | Después |
|-------|---------|
| "Vendedores Activos" | "Partners Activos" |
| `vendorCount` | `partnerCount` (key interna, coordinar con stats API) |
| `topVendors` state | `topPartners` |
| `VendorsAPI.getAll()` | `PartnersAPI.getAll()` |
| `VendorsAPI` import | `PartnersAPI` |
| "Vendedores Destacados" | "Partners Destacados" |
| Componente `VendorRank` | `PartnerRank` |
| `vendor` prop en `DealItem` | `partner` |
| `deal.vendor?.name` | `deal.partner?.name` |
| "Vendedor" fallback text | "Partner" |

---

#### [MODIFY] [page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/clients/page.tsx) — Clientes

Cambios de nomenclatura:

| Antes | Después |
|-------|---------|
| `VendorsAPI` import | `PartnersAPI` |
| `vendors` state + fetch | `partners` |
| "Vendedor Responsable" label | "Partner Responsable" |
| "Seleccionar Vendedor..." | "Seleccionar Partner..." |
| `formData.ownerVendorId` | `formData.ownerPartnerId` |
| `vendorId: formData.ownerVendorId` en DealsAPI.create | `partnerId: formData.ownerPartnerId` |
| "Vendedor" label en card footer | "Partner" |
| `'Ya registrado por: ${exists.owner?.name || 'otro vendedor'}'` | `'...otro partner'` |

---

#### [MODIFY] [page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/pipeline/page.tsx) — Pipeline

- `deal.vendor.name` → `deal.partner.name` (línea 152)
- Sin import de VendorsAPI — **solo cambio de acceso a datos**.

---

#### [MODIFY] [page.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/commissions/page.tsx) — Comisiones

- Columna de tabla "Vendedor" → "Partner" (línea 105)
- `comm.vendor.name` → `comm.partner.name` (líneas 120, 122)

---

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/components/Sidebar.tsx)

Cambio en la navegación (línea 23):

```diff
-  { name: 'Vendedores', href: '/vendors', icon: Users },
+  { name: 'Partners', href: '/partners', icon: Users },
```

---

### Componente 6: Verificación de Lógica de Clientes

#### Estado actual de las funciones de clientes:

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| Cliente asociado al Partner que lo registra | ✅ Implementado | `ownerVendorId` se asigna al crear en [clients.service.ts:L39](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/clients.service.ts#L39) |
| Plazo para concretar venta | ⚠️ Parcial | Implementado con **60 días** en lugar de 1 mes (30 días). Ver pregunta arriba. |
| Cliente pasa a "Libre" al vencer plazo | ✅ Implementado | `releaseStaleClients()` en [clients.service.ts:L64-L81](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/clients.service.ts#L64-L81) |
| Cliente Libre puede ser gestionado por otro Partner | ✅ Implementado | Re-asignación en [clients.service.ts:L17-L29](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/clients.service.ts#L17-L29) y captura en [deals.service.ts:L15-L24](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/deals.service.ts#L15-L24) |
| Liberación automática al perder deal | ✅ Implementado | En [deals.service.ts:L89-L98](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/lib/services/deals.service.ts#L89-L98) |
| Notificaciones de expiración próxima | ✅ Implementado | En [notifications/route.ts](file:///c:/Users/Enmanuel/Downloads/Kiriox/KirioxPartnerProgram/src/app/api/notifications/route.ts) (alertas a partir del día 50) |
| Ejecución automática de `releaseStaleClients()` | ❌ No implementado | El método existe pero no hay cron/scheduler que lo ejecute automáticamente |

> [!WARNING]
> **`releaseStaleClients()` no se ejecuta automáticamente.** Actualmente es un método estático que nadie invoca. Se debería:
> - Agregar una llamada al inicio de cada request GET de clientes, O
> - Crear un endpoint API `/api/cron/release-clients` que pueda ser llamado por un cron externo, O
> - Ejecutarlo inline en el GET de `/api/clients` antes de devolver resultados
>
> **Recomendación**: Ejecutar `releaseStaleClients()` al inicio del handler GET en `/api/clients/route.ts` y `/api/notifications/route.ts` para que la liberación sea "lazy" pero efectiva.

---

## Resumen de Archivos Afectados

### Archivos a CREAR (nuevos)
| Archivo | Propósito |
|---------|-----------|
| `src/app/api/partners/route.ts` | Nueva ruta API de partners |
| `src/app/partners/page.tsx` | Nueva página frontend de partners |
| `src/lib/services/partners.service.ts` | Nuevo servicio de partners |

### Archivos a ELIMINAR
| Archivo | Razón |
|---------|-------|
| `src/app/api/vendors/route.ts` | Reemplazado por `/api/partners` |
| `src/app/vendors/page.tsx` | Reemplazado por `/partners` |
| `src/lib/services/vendors.service.ts` | Reemplazado por `partners.service.ts` |

### Archivos a MODIFICAR
| Archivo | Tipo de cambio |
|---------|---------------|
| `prisma/schema.prisma` | Rename modelos + `@@map` |
| `prisma/seed.ts` | Actualizar referencias |
| `src/lib/api.ts` | `VendorsAPI` → `PartnersAPI` + `ProductsAPI.create` |
| `src/lib/services/clients.service.ts` | Rename campos vendor → partner |
| `src/lib/services/deals.service.ts` | Rename campos vendor → partner |
| `src/lib/services/commissions.service.ts` | Rename campos vendor → partner |
| `src/lib/services/users.service.ts` | Rename includes |
| `src/app/api/products/route.ts` | Agregar handler POST |
| `src/app/api/stats/route.ts` | `prisma.vendor` → `prisma.partner` |
| `src/app/page.tsx` | Rename UI labels + variables |
| `src/app/clients/page.tsx` | Rename UI labels + variables |
| `src/app/pipeline/page.tsx` | Rename `deal.vendor` → `deal.partner` |
| `src/app/commissions/page.tsx` | Rename UI labels |
| `src/app/products/page.tsx` | Agregar modal de creación |
| `src/components/Sidebar.tsx` | Rename nav link |

### Archivos que probablemente NO necesitan cambios
| Archivo | Razón |
|---------|-------|
| `src/lib/services/simple.service.ts` | No referencia "vendor" directamente |
| `src/app/api/deals/route.ts` | Solo usa DealsService |
| `src/app/api/deals/[id]/route.ts` | Solo usa DealsService |
| `src/app/api/notifications/route.ts` | Usa relación `owner` (sin cambio) |
| `src/components/Modal.tsx` | Componente genérico |
| `src/components/ClientLayout.tsx` | Sin referencias vendor |
| `src/middleware.ts` | Sin referencias vendor |

---

## Verification Plan

### Automated Tests

1. **Prisma schema válido**:
   ```bash
   npx prisma validate
   npx prisma generate
   ```

2. **Migración exitosa**:
   ```bash
   npx prisma migrate dev --name rename-vendor-to-partner
   ```

3. **Seed funciona**:
   ```bash
   npx prisma db seed
   ```

4. **Build sin errores de TypeScript**:
   ```bash
   npm run build
   ```

5. **Verificación de endpoints**:
   - `GET /api/partners` → devuelve lista
   - `POST /api/partners` → crea partner
   - `GET /api/products` → devuelve lista
   - `POST /api/products` → crea producto
   - `GET /api/clients` → devuelve lista con campo `ownerPartnerId`

### Manual Verification

1. Navegar a `/partners` — verificar que se carga la lista y se puede crear un partner
2. Navegar a `/products` — verificar que el botón "Añadir Producto" abre el modal y crea correctamente
3. Verificar sidebar muestra "Partners" en lugar de "Vendedores"
4. Dashboard muestra "Partners Activos" y "Partners Destacados"
5. Pipeline muestra nombre del partner en cada deal card
6. Comisiones muestra "Partner" en la columna de la tabla

---

## Orden de Ejecución Recomendado

1. **Prisma schema** → migrar y generar cliente
2. **Seed** → actualizar y re-sembrar
3. **Services** (backend) → crear partners.service, modificar los demás
4. **API routes** → crear /partners, modificar /products, /stats
5. **API client** (frontend) → actualizar api.ts
6. **Frontend pages** → crear /partners, modificar todas las páginas
7. **Eliminar archivos obsoletos** → vendors.*
8. **Build + Test**
