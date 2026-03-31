-- Creates the application database for Club Africain.
-- Run as a superuser (usually `postgres`), connected to database `postgres`.
--
-- Windows (PowerShell), example:
--   $env:PGPASSWORD = "your_postgres_password"
--   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d postgres -f prisma/create_database.sql
--
-- If the database already exists, you will see: ERROR: database "clubafricain" already exists — that is safe to ignore.

CREATE DATABASE clubafricain
  WITH OWNER = postgres
  ENCODING = 'UTF8'
  TEMPLATE = template0;
