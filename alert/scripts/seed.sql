-- CAP Data
INSERT INTO xws_alert.cap_category(name)
		values
      ('Geo'),('Met'),('Safety'),('Security'),('Rescue'),('Fire'),
      ('Health'),('Env'),('Transport'),('Infra'),('CBRNE'),('Other');

INSERT INTO xws_alert.cap_response_type(name)
		values
      ('Shelter'),('Evacuate'),('Prepare'),
      ('Execute'),('Avoid'),('Monitor'),
      ('Assess'),('AllClear'),('None');

INSERT INTO xws_alert.cap_urgency(name)
		values
      ('Immediate'),('Expected'),('Future'),('Past'),('Unknown');

INSERT INTO xws_alert.cap_severity(name)
		values
      ('Extreme'),('Severe'),('Moderate'),('Minor'),('Unknown');

INSERT INTO xws_alert.cap_certainty(name)
		values
      ('Observed'),('Likely'),('Possible'),('Unlikely'),('Unknown');

INSERT INTO xws_alert.cap_status(name)
		values
      ('Actual'),('Exercise'),('System'),('Test'),('Draft');

INSERT INTO xws_alert.cap_msg_type(name)
		values
      ('Alert'),('Update'),('Cancel'),('Ack'),('Error');

INSERT INTO xws_alert.cap_scope(name)
		values
      ('Public'),('Restricted'),('Private');



-- Alert publishers, services and templates
DO $$
DECLARE publisher_id uuid;
DECLARE service_id uuid;
BEGIN
   -- Insert the publishers
  INSERT INTO xws_alert.publisher(id, name, url)
		values
      ('92895119-cb53-4012-8eb9-173a22f2db7a', 'Environment Agency', 'www.gov.uk/environment-agency')
      RETURNING id INTO publisher_id;

   -- Insert the services
  INSERT INTO xws_alert.service(id, name, description, publisher_id)
		values
      ('ecbb79cc-47f5-4bb0-ad0c-ca803b671cfb', 'XWS', 'Flood warning service', publisher_id)
      RETURNING id INTO service_id;

   -- Insert the templates
   INSERT INTO xws_alert.alert_template(ref, name, description, service_id, cap_msg_type, cap_urgency_name, cap_severity_name, cap_certainty_name)
		values
      ('sfw', 'Severe flood warning', 'Severe flooding - danger to life', service_id, 'Alert', 'Immediate', 'Severe', 'Observed'),
      ('fw', 'Flood warning', 'Flooding is expected - immediate action required', service_id, 'Alert', 'Expected', 'Moderate', 'Likely'),
      ('fa', 'Flood alert', 'Flooding is possible - be prepared', service_id, 'Alert', 'Expected', 'Minor', 'Likely'),
      ('wnlif', 'Warning no longer in force', 'The warning is no longer in force', service_id, 'Cancel', 'Past', 'Unknown', 'Unknown');
END $$;
