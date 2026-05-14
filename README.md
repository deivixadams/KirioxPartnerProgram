# Kiriox Partner Program

Sistema web completo para gestión de vendedores multinivel, productos y comisiones.

## Stack Tecnológico
- **Frontend**: Next.js (App Router) + Tailwind CSS (Glassmorphism)
- **Backend**: NestJS + Prisma ORM
- **DB**: PostgreSQL

---

## 🚀 Inicio Rápido

He configurado un script unificado en la raíz para que no tengas que abrir múltiples terminales.

### 1. Instalación inicial (solo la primera vez)
```bash
npm run install:all
```

### 2. Ejecución completa (DB + Frontend)
```bash
npm run dev
```

Este comando:
1. Levanta la base de datos PostgreSQL en Docker.
2. Ejecuta `prisma generate`.
3. Ejecuta `prisma db push` para crear el esquema en Docker.
4. Ejecuta `prisma db seed` para cargar datos iniciales.
5. Inicia el frontend Next.js en `http://localhost:3000`.

---

## 🐳 Integración Docker + PostgreSQL
Para que la base de datos se ejecute dentro de Docker Desktop:

1. Asegúrate de que Docker Desktop esté instalado y ejecutándose.
2. Copia `.env.example` a `.env` si aún no existe:
   ```bash
   cp .env.example .env
   ```
3. Ejecuta:
   ```bash
   npm run dev
   ```

El archivo `docker-compose.yml` define un servicio `db` con PostgreSQL y un volumen persistente.

---

## 🔑 Credenciales
- **Panel de control**: Accede a `http://localhost:3000`
- **Usuario**: `admin@kiriox.com`
- **Password**: `kiriox123`

---

## 🛠 Estructura del Proyecto
- `/backend`: Lógica de negocio, servicios Prisma, cálculos de comisiones.
- `/frontend`: Interfaz de usuario premium con estética Glassmorphism.
- `docker-compose.yml`: Configuración de base de datos local.
