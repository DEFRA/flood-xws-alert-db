# XWS DB

This project currently contains the database scripts for all the XWS subsystems.

These subsystems are mapped to individual postgres schema: `xws_alert`, `xws_area`, `xws_notification`, `xws_contact`. Eventually, this repo may get split into a number of separate db repos per each subsystem. Also, they may eventually be installed to separate databases.


## Getting started

***Docker***

It is recommended to run postgres in a docker container. The instructions for running a populated DB and all three XWS applications are found in the [flood-xws-development](https://github.com/DEFRA/flood-xws-development) repository.

***Local Install***

Pre-requisites: Postgres v12, Plugins -  uuid-ossp

```
  psql -Atx postgresql://postgres:postgres@localhost -f run.sql
```

***PaaS service DB***

To populate the PaaS service DB run the following command:

`docker build --file DockerfileCF . -t cf-db && docker run --env-file ./cf.env cf-db`

Note: cf env vars are populated using an env file which you will need to create (see cf.env.sample for the env vars which need populationg)
