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

### 2. Ejecución completa (DB + Backend + Frontend)
```bash
npm run dev
```

Este comando:
1. Levanta la base de datos en Docker.
2. Inicia el servidor NestJS en `http://localhost:3001`.
3. Inicia el frontend Next.js en `http://localhost:3000`.

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
