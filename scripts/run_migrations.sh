#!/usr/bin/env bash

# Obtiene el directorio donde está el script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Define las rutas a los otros scripts
PSQL_SCRIPT="${SCRIPT_DIR}/psql_exec.sh"
RESET_SCRIPT="${SCRIPT_DIR}/reset_database.sql"
SEED_SCRIPT="${SCRIPT_DIR}/test_rows.sql"

# 1. Vacía los datos de la base de datos (mantiene el schema)
echo "--- 1. Reseteando base de datos (TRUNCATE)... ---"
${PSQL_SCRIPT} ${RESET_SCRIPT}

# 2. Instala dependencias (por si acaso)
echo "--- 2. Instalando dependencias (npm install)... ---"
npm install

# 3. Corre las migraciones de Prisma (aplica cambios de schema)
echo "--- 3. Corriendo migraciones (prisma migrate dev)... ---"
npx prisma migrate dev

# 4. Genera el cliente de Prisma
echo "--- 4. Generando cliente de Prisma (prisma generate)... ---"
npx prisma generate

# 5. Inserta los datos de prueba (seed)
echo "--- 5. Poblando la base de datos (seed.sql)... ---"
${PSQL_SCRIPT} ${SEED_SCRIPT}

echo "--- ¡Proceso completado! ---"