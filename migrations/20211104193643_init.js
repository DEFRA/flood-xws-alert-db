const {
  AREA_SCHEMA_NAME,
  ALERT_SCHEMA_NAME
} = require('../constants')

function addTimestamps (knex, table) {
  table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
}

exports.up = function (knex) {
  return knex
    .raw(`
      CREATE SCHEMA ${AREA_SCHEMA_NAME};
      CREATE SCHEMA ${ALERT_SCHEMA_NAME};
      CREATE EXTENSION IF NOT EXISTS postgis;
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `)
    .then(() => {
      return knex.schema.withSchema(AREA_SCHEMA_NAME)
        // Create the xws_area.area_type table
        .createTable('area_type', t => {
          // Add columns
          t.string('ref', 25).notNullable().primary()
          t.string('name', 100).notNullable().unique()
          addTimestamps(knex, t)
        })
        // Create the xws_area.area table
        .createTable('area', t => {
          // Columns
          t.string('code', 40).notNullable().primary()
          t.string('region', 60).notNullable()
          t.string('name', 100).notNullable()
          t.string('description', 255).notNullable()
          t.string('area_type_ref', 25).references('ref')
            .inTable(`${AREA_SCHEMA_NAME}.area_type`).notNullable()
            .index(null, 'btree')
          t.string('parent_area_code', 40).references('code')
            .inTable(`${AREA_SCHEMA_NAME}.area`).nullable()
          t.string('properties').nullable()
          t.specificType('geom', 'geometry').notNullable().index(null, 'gist')
          t.specificType('centroid', 'geometry').nullable()
          t.specificType('bounding_box', 'geometry').nullable()
          addTimestamps(knex, t)
        })
        // Create xws_area views
        .raw(`
          CREATE VIEW xws_area.area_vw_summary AS
          SELECT ar.code, ar.name, ar.region, ar.description, ar.area_type_ref, art.name as "area_type_name"
          FROM xws_area.area ar
          JOIN xws_area.area_type art ON art.ref = ar.area_type_ref;
        `)
    })
    .then(() => {
      // Create the CAP tables
      return knex.schema.withSchema(ALERT_SCHEMA_NAME)
        // Create the xws_area.cap_category table
        .createTable('cap_category', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
        // Create the xws_area.cap_response_type table
        .createTable('cap_response_type', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
        // Create the xws_area.cap_urgency table
        .createTable('cap_urgency', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
        // Create the xws_area.cap_severity table
        .createTable('cap_severity', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
        // Create the xws_area.cap_certainty table
        .createTable('cap_certainty', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
        // Create the xws_area.cap_status table
        .createTable('cap_status', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
        // Create the xws_area.cap_msg_type table
        .createTable('cap_msg_type', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
        // Create the xws_area.cap_scope table
        .createTable('cap_scope', t => {
          // Add columns
          t.string('name', 60).notNullable().primary()
          addTimestamps(knex, t)
        })
    })
    .then(() => {
      return knex.schema.withSchema(ALERT_SCHEMA_NAME)
        // Create the xws_area.area_type table
        .createTable('user', t => {
          // Add columns
          t.specificType('id', 'uuid').notNullable().primary()
          t.string('first_name', 255).notNullable()
          t.string('last_name', 255).notNullable()
          t.string('email', 255).notNullable().unique()
          t.boolean('active').notNullable().defaultTo(true)
          addTimestamps(knex, t)
        })
        // Create the xws_area.publisher table
        .createTable('publisher', t => {
          // Add columns
          t.specificType('id', 'uuid').notNullable()
            .primary().defaultTo(knex.raw('uuid_generate_v4()'))
          t.string('name', 100).notNullable().unique()
          t.string('url', 255).notNullable().unique()
          addTimestamps(knex, t)
        })
        // Create the xws_area.service table
        .createTable('service', t => {
          // Add columns
          t.specificType('id', 'uuid').notNullable()
            .primary().defaultTo(knex.raw('uuid_generate_v4()'))
          t.string('name', 100).notNullable().unique()
          t.string('description', 255).notNullable()
          t.specificType('publisher_id', 'uuid').references('id')
            .inTable(`${ALERT_SCHEMA_NAME}.publisher`).notNullable()
          addTimestamps(knex, t)
        })
        // Create the xws_area.alert_template table
        .createTable('alert_template', t => {
          // Add columns
          t.string('ref', 50).notNullable().primary()
          t.string('name', 100).notNullable()
          t.string('description', 255).notNullable()
          t.specificType('service_id', 'uuid').references('id')
            .inTable(`${ALERT_SCHEMA_NAME}.service`).notNullable()
          t.string('cap_msg_type_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_msg_type`).notNullable()
          t.string('cap_urgency_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_urgency`).notNullable()
          t.string('cap_severity_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_severity`).notNullable()
          t.string('cap_certainty_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_certainty`).notNullable()
          addTimestamps(knex, t)
        })
        // Create the xws_area.alert table
        .createTable('alert', t => {
          // Add columns
          t.specificType('id', 'uuid').notNullable()
            .primary().defaultTo(knex.raw('uuid_generate_v4()'))
          t.string('area_code', 40).notNullable().references('code')
            .inTable(`${AREA_SCHEMA_NAME}.area`).notNullable()
          t.specificType('service_id', 'uuid').references('id')
            .inTable(`${ALERT_SCHEMA_NAME}.service`).notNullable()
          t.string('alert_template_ref', 50).notNullable().references('ref')
            .inTable(`${ALERT_SCHEMA_NAME}.alert_template`).notNullable()
          t.string('cap_msg_type_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_msg_type`).notNullable()
          t.string('cap_urgency_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_urgency`).notNullable()
          t.string('cap_severity_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_severity`).notNullable()
          t.string('cap_certainty_name', 60).references('name')
            .inTable(`${ALERT_SCHEMA_NAME}.cap_certainty`).notNullable()
          t.specificType('parent_alert_id', 'uuid').references('id')
            .inTable(`${ALERT_SCHEMA_NAME}.alert`).notNullable()
          t.string('headline', 90).notNullable()
          t.string('body', 990).notNullable()
          t.boolean('active').nullable()
          t.timestamp('approved_at').nullable()
          t.specificType('approved_by_id', 'uuid').references('id')
            .inTable(`${ALERT_SCHEMA_NAME}.user`).nullable()
          t.timestamp('expired_at').nullable()
          t.specificType('created_by_id', 'uuid').references('id')
            .inTable(`${ALERT_SCHEMA_NAME}.user`).notNullable()
          t.specificType('updated_by_id', 'uuid').references('id')
            .inTable(`${ALERT_SCHEMA_NAME}.user`).notNullable()
          addTimestamps(knex, t)

          // By default, B-tree indexes store their entries in ascending order with nulls last
          // https://www.postgresql.org/docs/9.2/indexes-ordering.html
          // https://stackoverflow.com/questions/28166915/postgresql-constraint-only-one-row-can-have-flag-set
          // CREATE UNIQUE INDEX area_code_active_idx ON xws_alert.alert USING btree (area_code, active nulls LAST);
          t.unique(['area_code', 'active'])
        })
        // Create xws_alert trigger function
        .raw(`
        CREATE OR REPLACE FUNCTION xws_alert.ensure_only_one_active_area_trigger()
        RETURNS trigger
        AS $function$
        BEGIN
            -- Nothing to do if updating the row currently enabled
            IF (TG_OP = 'UPDATE' AND OLD.active = true) THEN
              RETURN NEW;
            END IF;

            -- Disable the currently active row
            UPDATE xws_alert.alert
            SET active = null, expired_at = CURRENT_TIMESTAMP
            WHERE active = TRUE
            AND area_code = NEW.area_code;

            -- Activate new row
            -- NEW.active := true;
            RETURN NEW;
        END;
        $function$
        LANGUAGE plpgsql;

        CREATE TRIGGER alert_only_one_active_area_code
        BEFORE INSERT OR UPDATE OF active ON xws_alert.alert
        FOR EACH ROW WHEN (NEW.active = true)
        EXECUTE PROCEDURE xws_alert.ensure_only_one_active_area_trigger();
        `)
        // Create xws_alert views
        .raw(`
        -- View of the user table showing active users
        CREATE VIEW xws_alert.user_vw_active AS
          SELECT *
          FROM xws_alert.user
          WHERE active = TRUE;

        -- View of the alert table showing active alerts
        CREATE VIEW xws_alert.alert_vw_active AS
          SELECT *
          FROM xws_alert.alert
          WHERE active = TRUE;
        `)
    })
}

exports.down = function (knex) {
  return knex.raw(`
    DROP SCHEMA ${AREA_SCHEMA_NAME} CASCADE;
    DROP SCHEMA ${ALERT_SCHEMA_NAME} CASCADE;
    DROP EXTENSION IF EXISTS postgis;
    DROP EXTENSION IF EXISTS "uuid-ossp";
  `)
}
