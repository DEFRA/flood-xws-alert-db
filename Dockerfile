FROM postgis/postgis
ENV PATH=${PATH}:/scripts
COPY scripts/populate-db /docker-entrypoint-initdb.d/populate-db.sh
WORKDIR /db-init-scripts
COPY scripts/before.sql .
COPY alert/scripts ./alert
