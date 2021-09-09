CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/********* 
 * Tables
 *********/

-------------
-- User table
-------------
CREATE TABLE xws_alert.user (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE xws_alert.user ENABLE ROW LEVEL SECURITY;

-- Alert tables
CREATE TABLE xws_alert.publisher (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name varchar(100) NOT NULL UNIQUE,
	url varchar(255) NOT NULL UNIQUE,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE xws_alert.service (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name varchar(100) NOT NULL UNIQUE,
	description varchar(255) NOT NULL,
  publisher_id uuid NOT NULL REFERENCES xws_alert.publisher (id),
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE xws_alert.alert_template (
	ref varchar(50) NOT NULL PRIMARY KEY,
	name varchar(100) NOT NULL,
	description varchar(255) NOT NULL,
  service_id uuid NOT NULL REFERENCES xws_alert.service (id),
  cap_msg_type varchar(60) NOT NULL REFERENCES xws_alert.cap_msg_type (name),
  cap_urgency_name varchar(60) NOT NULL REFERENCES xws_alert.cap_urgency (name),
  cap_severity_name varchar(60) NOT NULL REFERENCES xws_alert.cap_severity (name),
  cap_certainty_name varchar(60) NOT NULL REFERENCES xws_alert.cap_certainty (name),
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE xws_alert.alert (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_code varchar(40) NOT NULL REFERENCES xws_area.area (code),
  service_id uuid NOT NULL REFERENCES xws_alert.service (id),
  alert_template_ref varchar(50) NOT NULL REFERENCES xws_alert.alert_template (ref),
  cap_msg_type varchar(60) NOT NULL REFERENCES xws_alert.cap_msg_type (name),
  cap_urgency_name varchar(60) NOT NULL REFERENCES xws_alert.cap_urgency (name),
  cap_severity_name varchar(60) NOT NULL REFERENCES xws_alert.cap_severity (name),
  cap_certainty_name varchar(60) NOT NULL REFERENCES xws_alert.cap_certainty (name),
  parent_alert_id uuid NULL REFERENCES xws_alert.alert (id),
  headline varchar(90) NOT NULL,
  body varchar(990) NOT NULL,
  active boolean NULL,
  approved_at timestamptz NULL,
  approved_by_id uuid NULL REFERENCES xws_alert.user (id),
  expired_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by_id uuid NOT NULL REFERENCES xws_alert.user (id),
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by_id uuid NOT NULL REFERENCES xws_alert.user (id)
);

-- https://stackoverflow.com/questions/28166915/postgresql-constraint-only-one-row-can-have-flag-set
CREATE UNIQUE INDEX area_code_active_idx ON xws_alert.alert USING btree (area_code, active nulls LAST);

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

-- CREATE RULE prohibit_delete AS
-- ON DELETE TO xws_alert.alert
-- WHERE OLD.active = TRUE OR OLD.active = FALSE DO INSTEAD NOTHING;

-- CREATE RULE prohibit_insert_active AS
-- ON INSERT TO xws_alert.alert
-- WHERE NEW.active = TRUE OR NEW.active = FALSE DO INSTEAD UPDATE NEW set active = null;

-- CREATE RULE prohibit_insert_active AS
--   ON INSERT TO xws_alert.alert DO INSTEAD
--   INSERT INTO xws_alert.alert VALUES (NEW.a, NEW.b)
--   RETURNING xws_alert.alert.*;


/******* 
 * Views
 *******/

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
