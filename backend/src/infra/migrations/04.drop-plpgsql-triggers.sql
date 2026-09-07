-- ============================================================
-- Migration 04 : Suppression des triggers plpgsql auto-updated_at
-- ============================================================
-- Raison : Sur macOS avec PostgreSQL Homebrew connecté via TCP (localhost),
-- les triggers plpgsql échouent avec :
--   ERROR 58P01: could not access file "$libdir/plpgsql"
-- La mise à jour de updated_at est déjà gérée explicitement dans les
-- repositories (updated_at = NOW()), les triggers sont donc redondants.
-- ============================================================

-- Supprimer les triggers auto-updated_at (ils utilisent plpgsql, incompatible TCP Homebrew)
DROP TRIGGER IF EXISTS set_updated_at_sessions              ON sessions;
DROP TRIGGER IF EXISTS set_updated_at_auth                  ON auth;
DROP TRIGGER IF EXISTS set_updated_at_reports               ON reports;
DROP TRIGGER IF EXISTS set_updated_at_missions              ON missions;
DROP TRIGGER IF EXISTS set_updated_at_interventions         ON interventions;
DROP TRIGGER IF EXISTS set_updated_at_organizations         ON organizations;
DROP TRIGGER IF EXISTS set_updated_at_roles                 ON roles;
DROP TRIGGER IF EXISTS set_updated_at_territories           ON territories;
DROP TRIGGER IF EXISTS set_updated_at_territory_types       ON territory_types;
DROP TRIGGER IF EXISTS set_updated_at_territory_sectors     ON territory_sectors;
DROP TRIGGER IF EXISTS set_updated_at_otp_codes             ON otp_codes;
DROP TRIGGER IF EXISTS set_updated_at_account_status        ON account_status;
DROP TRIGGER IF EXISTS set_updated_at_environmental_sensors ON environmental_sensors;
DROP TRIGGER IF EXISTS set_updated_at_field_intervention_reports ON field_intervention_reports;
DROP TRIGGER IF EXISTS set_updated_at_field_teams           ON field_teams;
DROP TRIGGER IF EXISTS set_updated_at_infrastructures       ON infrastructures;
DROP TRIGGER IF EXISTS set_updated_at_mapped_areas          ON mapped_areas;
