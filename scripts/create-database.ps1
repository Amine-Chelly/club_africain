# Creates PostgreSQL database `clubafricain` for this project.
# Usage:
#   $env:PGPASSWORD = "your_postgres_password"
#   .\scripts\create-database.ps1
#
# Optional: -Port 5432 -User postgres -Host localhost

param(
  [string]$Host = "localhost",
  [int]$Port = 5432,
  [string]$User = "postgres"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$sql = Join-Path $root "prisma\create_database.sql"
if (-not (Test-Path $sql)) {
  Write-Error "Missing $sql"
}

$psql = $null
foreach ($ver in @(18, 17, 16, 15, 14)) {
  $c = "C:\Program Files\PostgreSQL\$ver\bin\psql.exe"
  if (Test-Path $c) { $psql = $c; break }
}
if (-not $psql) {
  $psql = "psql"
}

Write-Host "Using: $psql"
Write-Host "Creating database clubafricain on ${User}@${Host}:${Port} ..."
& $psql -U $User -h $Host -p $Port -d postgres -f $sql
if ($LASTEXITCODE -ne 0) {
  if ($LASTEXITCODE -eq 1) {
    Write-Host "If the error says the database already exists, you can continue with: npm run db:push"
  }
  exit $LASTEXITCODE
}
Write-Host "Done. Next: npm run db:push && npm run db:seed"
