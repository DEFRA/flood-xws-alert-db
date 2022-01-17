TRUNCATE xws_area.area RESTART IDENTITY CASCADE;

-- Insert the faa into the area table
INSERT INTO xws_area.area(code, region, name, description, area_type_ref, geom)
SELECT fws_tacode AS code,
       area,
       ta_name AS name,
       descrip AS description,
       'faa' AS area_type_ref,
       geom
FROM xws_area.faa;

-- Insert the fwa into the area table
INSERT INTO xws_area.area(code, region, name, description, area_type_ref, parent_area_code, geom)
SELECT fws_tacode AS code,
       area,
       ta_name AS name,
       descrip AS description,
       'fwa' AS area_type_ref,

  (SELECT fws_tacode as code
   FROM xws_area.area
   WHERE area_type_ref = 'fwa'
     AND xws_area.area.code = parent) AS parent_area_code,
       geom
FROM xws_area.fwa;

-- Clean up the temporary "faa" and "fwa" tables
DROP TABLE xws_area.faa;
DROP TABLE xws_area.fwa;