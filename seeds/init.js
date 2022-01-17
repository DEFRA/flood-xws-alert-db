
exports.seed = async function (knex) {
  await knex('xws_area.area_type').insert([
    { ref: 'faa', name: 'Flood alert area' },
    { ref: 'fwa', name: 'Flood warning area' }
  ])

  await knex('xws_alert.cap_category').insert([
    { name: 'Geo' },
    { name: 'Met' },
    { name: 'Safety' },
    { name: 'Security' },
    { name: 'Rescue' },
    { name: 'Fire' },
    { name: 'Health' },
    { name: 'Env' },
    { name: 'Transport' },
    { name: 'Infra' },
    { name: 'CBRNE' },
    { name: 'Other' }
  ])

  await knex('xws_alert.cap_response_type').insert([
    { name: 'Shelter' },
    { name: 'Evacuate' },
    { name: 'Prepare' },
    { name: 'Execute' },
    { name: 'Avoid' },
    { name: 'Monitor' },
    { name: 'Assess' },
    { name: 'AllClear' },
    { name: 'None' }
  ])

  await knex('xws_alert.cap_urgency').insert([
    { name: 'Immediate' },
    { name: 'Expected' },
    { name: 'Future' },
    { name: 'Past' },
    { name: 'Unknown' }
  ])

  await knex('xws_alert.cap_severity').insert([
    { name: 'Extreme' },
    { name: 'Severe' },
    { name: 'Moderate' },
    { name: 'Minor' },
    { name: 'Unknown' }
  ])

  await knex('xws_alert.cap_certainty').insert([
    { name: 'Observed' },
    { name: 'Likely' },
    { name: 'Possible' },
    { name: 'Unlikely' },
    { name: 'Unknown' }
  ])

  await knex('xws_alert.cap_status').insert([
    { name: 'Actual' },
    { name: 'Exercise' },
    { name: 'System' },
    { name: 'Test' },
    { name: 'Draft' }
  ])

  await knex('xws_alert.cap_msg_type').insert([
    { name: 'Alert' },
    { name: 'Update' },
    { name: 'Cancel' },
    { name: 'Ack' },
    { name: 'Error' }
  ])

  await knex('xws_alert.cap_scope').insert([
    { name: 'Public' },
    { name: 'Restricted' },
    { name: 'Private' }
  ])

  const [{ id: publisherId }] = await knex('xws_alert.publisher').insert({
    id: '92895119-cb53-4012-8eb9-173a22f2db7a',
    name: 'Environment Agency',
    url: 'www.gov.uk/environment-agency'
  }, ['id'])

  console.log(publisherId)

  const [{ id: serviceId }] = await knex('xws_alert.service').insert({
    id: 'ecbb79cc-47f5-4bb0-ad0c-ca803b671cfb',
    name: 'XWS',
    description: 'Flood warning service',
    publisher_id: publisherId
  }, ['id'])

  await knex('xws_alert.alert_template').insert([
    {
      ref: 'sfw',
      name: 'Severe flood warning',
      description: 'Severe flooding - danger to life',
      service_id: serviceId,
      cap_msg_type_name: 'Alert',
      cap_urgency_name: 'Immediate',
      cap_severity_name: 'Severe',
      cap_certainty_name: 'Observed'
    },
    {
      ref: 'fw',
      name: 'Flood warning',
      description: 'Flooding is expected - immediate action required',
      service_id: serviceId,
      cap_msg_type_name: 'Alert',
      cap_urgency_name: 'Expected',
      cap_severity_name: 'Moderate',
      cap_certainty_name: 'Likely'
    },
    {
      ref: 'fa',
      name: 'Flood alert',
      description: 'Flooding is possible - be prepared',
      service_id: serviceId,
      cap_msg_type_name: 'Alert',
      cap_urgency_name: 'Expected',
      cap_severity_name: 'Minor',
      cap_certainty_name: 'Likely'
    },
    {
      ref: 'wnlif',
      name: 'Warning no longer in force',
      description: 'The warning is no longer in force',
      service_id: serviceId,
      cap_msg_type_name: 'Cancel',
      cap_urgency_name: 'Past',
      cap_severity_name: 'Unknown',
      cap_certainty_name: 'Unknown'
    }
  ])
}
