drop table if exists facts;
CREATE TABLE facts (
	id integer primary key autoincrement,
	activity_id integer,
	start_time timestamp,
	end_time timestamp,
	description varchar2
);

drop table if exists categories;
CREATE TABLE categories(
	id integer primary key,
	name varchar2(500),
	color_code varchar2(50),
	category_order integer, search_name varchar2
);

drop table if exists tags;
CREATE TABLE tags (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	name TEXT NOT NULL,
	autocomplete BOOL DEFAULT true
);

CREATE TABLE fact_tags(
	fact_id integer, 
	tag_id integer
);

drop table if exists activities;
CREATE TABLE activities(
	id integer primary key, 
	name varchar2(500), 
	work integer, 
	activity_order integer, 
	deleted integer, 
	category_id integer, 
	search_name varchar2
);