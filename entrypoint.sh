#!/bin/bash
set -e

if [ "$USE_MYSQL" = "True" ] || [ "$USE_MYSQL" = "true" ] || [ "$USE_MYSQL" = "1" ]; then
    echo "Aguardando o banco de dados MySQL em $DB_HOST:$DB_PORT..."
    while ! python -c "import socket; s = socket.socket(); s.settimeout(1); s.connect(('${DB_HOST:-db}', int('${DB_PORT:-3306}')))" 2>/dev/null; do
        sleep 1
    done
    echo "MySQL pronto e acessível!"
fi

echo "Executando migrações..."
python manage.py migrate --noinput

if [ "$RUN_SEED" = "True" ] || [ "$RUN_SEED" = "true" ] || [ "$RUN_SEED" = "1" ]; then
    echo "Executando seed de dados..."
    python seed_data.py
fi

echo "Iniciando aplicação: $@"
exec "$@"
