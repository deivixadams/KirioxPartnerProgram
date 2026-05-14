# Integración Docker + PostgreSQL para Kiriox Partner Program

Este documento describe los cambios realizados para que la base de datos PostgreSQL se ejecute en Docker Desktop y se cree automáticamente al iniciar el proyecto con `npm run dev`.

## Archivos añadidos

### `docker-compose.yml`
- Define un servicio `db` que usa `postgres:15-alpine`.
- Setea variables de entorno para:
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`
- Expone el puerto local configurado por `POSTGRES_PORT` hacia el contenedor `5432`.
- Mantiene un volumen persistente `db_data` para los datos de PostgreSQL.
- Incluye un `healthcheck` que valida la disponibilidad de PostgreSQL usando `pg_isready`.

### `.env.example`
- Incluye la configuración de conexión de ejemplo para Docker:
  - `POSTGRES_USER=postgres`
  - `POSTGRES_PASSWORD=postgres`
  - `POSTGRES_DB=kiriox_dev`
  - `POSTGRES_PORT=5432`
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kiriox_dev?schema=public`

### `.env`
- Contiene la misma configuración que `.env.example` para uso local.
- Está ignorado en el repositorio por la entrada `/.env` en `.gitignore`.

## Cambios en el proyecto

### `package.json`
Se agregaron nuevos scripts y se ajustó el flujo de desarrollo:
- `docker:up`: levanta solo el servicio `db` con `docker compose up -d db`.
- `docker:down`: detiene el servicio con `docker compose down`.
- `prisma:ensure`: ejecuta `prisma generate`, `prisma db push` y `prisma db seed`.
- `predev`: corre antes de `dev` y garantiza que Docker y Prisma estén listos.
- `dev`: ahora ejecuta `predev` antes de `next dev`, de modo que la base de datos se inicia y el esquema se aplica automáticamente antes de iniciar la app.

### `README.md`
- Se actualizó la sección de ejecución para explicar claramente el nuevo flujo.
- Se agregó documentación sobre cómo integrar y levantar PostgreSQL en Docker Desktop.
- Se detallaron los pasos para copiar `.env.example` a `.env` y ejecutar `npm run dev`.

## Comportamiento actual

Al ejecutar `npm run dev`:
1. Se inicia el contenedor Docker de PostgreSQL.
2. Se genera el cliente Prisma (`prisma generate`).
3. Se crea el esquema en la base de datos con `prisma db push`.
4. Se ejecuta el seed inicial con `prisma db seed`.
5. Se inicia la aplicación Next.js en `http://localhost:3000`.

## Notas adicionales

- Docker Desktop debe estar instalado y ejecutándose antes de usar estos comandos.
- Si necesitas reiniciar la base de datos, puedes usar:
  ```bash
  npm run docker:down
  docker compose up -d db
  npm run prisma:ensure
  ```
- El `.env` local no debe subirse a Git porque contiene credenciales y está protegido por `.gitignore`.

## Archivos modificados

- `docker-compose.yml`
- `.env.example`
- `.env`
- `package.json`
- `README.md`
