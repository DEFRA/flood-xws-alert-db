# XWS DB

This project currently contains the database scripts for all the XWS subsystems.

These subsystems are mapped to individual postgres schema: `xws_alert`, `xws_area`, `xws_notification`, `xws_contact`. Eventually, this repo may get split into a number of separate db repos per each subsystem. Also, they may eventually be installed to separate databases.


## Getting started

***Creating Target Area insert SQL from shape files***

After cloning the repo or when the zip files in `area/flood-areas` containing the Flood Alert or Warning Areas are updated then the SQL files which insert the target areas need to be regenerated. The script `scripts/generate-area-data.sh` will need to be re-run from the repo root directory. The generated SQL files are too large to commit to Github and so are ignored by git.

The shape zip files come from:

* https://data.gov.uk/dataset/0d901c4a-6e1a-4f9a-9408-73e0c1f49dd3/flood-warning-areas
* https://data.gov.uk/dataset/7749e0a6-08fb-4ad8-8232-4e41da74a248/flood-alert-areas

***Docker***

It is recommended to run postgres in a docker container. The instructions for running a populated DB and all three XWS applications are found in the [flood-xws-development](https://github.com/DEFRA/flood-xws-development) repository. The database will be populated with the alert and warning target area as well as all the schema definitions and data for each subsystem.

***Local Install***

Pre-requisites: Postgres v12, Plugins -  PostGIS, uuid-ossp

```
  psql -Atx postgresql://postgres:postgres@localhost -f run.sql
```

***PaaS service DB***

To populate the PaaS service DB run the following command:

`docker build --file DockerfileCF . -t cf-db && docker run --env-file ./cf.env cf-db`

Note: cf env vars are populated using an env file which you will need to create (see cf.env.sample for the env vars which need populationg)
