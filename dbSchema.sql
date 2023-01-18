/* Designed with: https://dbdiagram.io/ */

DROP TYPE IF EXISTS room_scope CASCADE;
DROP TABLE IF EXISTS users, rooms, members, messages, "sessions" CASCADE;

CREATE TYPE "room_scope" AS ENUM (
  'public',
  'private'
);

CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "name" varchar(40) UNIQUE NOT NULL,
  "email" varchar(254) UNIQUE NOT NULL,
  "image" text
);

CREATE TABLE "rooms" (
  "id" serial PRIMARY KEY,
  "subject" varchar(150) NOT NULL,
  "scope" room_scope NOT NULL,
  "creator_id" integer NOT NULL
);

CREATE TABLE "members" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "room_id" integer NOT NULL,
	"banned" boolean NOT NULL DEFAULT false
);

CREATE TABLE "messages" (
  "id" serial PRIMARY KEY,
  "room_id" integer NOT NULL,
  "author_id" integer NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "text" text,
  "images" text[],
  "videos" text[]
);

ALTER TABLE "rooms" ADD FOREIGN KEY ("creator_id") REFERENCES "users" ("id");

ALTER TABLE "members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "members" ADD FOREIGN KEY ("room_id") REFERENCES "rooms" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("room_id") REFERENCES "rooms" ("id");

/* node-connect-pg-simple */

CREATE TABLE "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
	"token" text
)
WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_sessions_expire" ON "sessions" ("expire");
