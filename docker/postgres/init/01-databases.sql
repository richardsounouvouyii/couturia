-- Bases séparées par service (pas de tables partagées entre microservices).
-- Sprint 1 : auth_db. Les autres seront activées au fur et à mesure.

CREATE DATABASE auth_db OWNER couturia;
CREATE DATABASE atelier_db OWNER couturia;
CREATE DATABASE catalogue_db OWNER couturia;
CREATE DATABASE demande_db OWNER couturia;
CREATE DATABASE commande_db OWNER couturia;
CREATE DATABASE client_db OWNER couturia;
CREATE DATABASE notification_db OWNER couturia;

\c auth_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
