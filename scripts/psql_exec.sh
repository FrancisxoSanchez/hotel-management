#!/usr/bin/env bash

# La contraseña que definiste en tu docker-compose.yml
export PGPASSWORD='mysecretpassword'

# $1 es el primer argumento que le pases al script (el archivo .sql)
if [[ -n "${1}" ]]; then
  cat "${1}" | docker exec -i hotel-postgres psql -U postgres -d hotel_db
else
  # Si no pasas argumentos, abre una consola interactiva
  docker exec -it hotel-postgres psql -U postgres -d hotel_db
fi