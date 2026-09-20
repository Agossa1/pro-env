/*
 * ============================================================================
 * MIGRATION 02 — Refactoring du module Territoire
 * SIGIE — Découpage administratif du Bénin
 * ============================================================================
 * Exécuter MANUELLEMENT sur la base de données de développement.
 * ATTENTION : Migration destructive — les tables territory_types, territories,
 * territory_sectors seront supprimées avec leurs données.
 * ============================================================================
 */

BEGIN;

-- ============================================================================
-- PHASE 1 : Supprimer les triggers et fonctions dépendants
-- ============================================================================

DROP TRIGGER IF EXISTS trg_mission_organization_territory_check ON missions;
DROP FUNCTION IF EXISTS fn_mission_organization_territory_check();

-- ============================================================================
-- PHASE 2 : Supprimer les FK qui pointent vers territories
-- ============================================================================

ALTER TABLE auth                    DROP CONSTRAINT IF EXISTS fk_auth_territory_id;
ALTER TABLE auth                    DROP CONSTRAINT IF EXISTS auth_territory_id_fkey;
ALTER TABLE missions                DROP CONSTRAINT IF EXISTS fk_mission_territory;
ALTER TABLE reports                 DROP CONSTRAINT IF EXISTS fk_report_territory;
ALTER TABLE organization_territories DROP CONSTRAINT IF EXISTS fk_orgterr_territory;
ALTER TABLE territories             DROP CONSTRAINT IF EXISTS fk_territory_created_by;

-- infrastructures (si présent)
ALTER TABLE infrastructures DROP CONSTRAINT IF EXISTS fk_infrastructure_territory;
ALTER TABLE infrastructures DROP CONSTRAINT IF EXISTS infrastructures_territory_id_fkey;

-- Supprimer les index liés
DROP INDEX IF EXISTS idx_territories_type;
DROP INDEX IF EXISTS idx_territories_parent;
DROP INDEX IF EXISTS idx_territories_organization;
DROP INDEX IF EXISTS idx_territories_geometry;
DROP INDEX IF EXISTS idx_territories_centroid;
DROP INDEX IF EXISTS idx_territories_deleted_at;
DROP INDEX IF EXISTS idx_sectors_territory;
DROP INDEX IF EXISTS idx_sectors_geometry;
DROP INDEX IF EXISTS idx_auth_territory;
DROP INDEX IF EXISTS idx_reports_territory;
DROP INDEX IF EXISTS idx_missions_territory;
DROP INDEX IF EXISTS idx_orgterr_territory;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS set_updated_at_territory_types    ON territory_types;
DROP TRIGGER IF EXISTS set_updated_at_territories        ON territories;
DROP TRIGGER IF EXISTS set_updated_at_territory_sectors  ON territory_sectors;

-- ============================================================================
-- PHASE 3 : Supprimer les colonnes territory_id existantes
-- ============================================================================

ALTER TABLE auth                     DROP COLUMN IF EXISTS territory_id;
ALTER TABLE missions                 DROP COLUMN IF EXISTS territory_id;
ALTER TABLE reports                  DROP COLUMN IF EXISTS territory_id;
ALTER TABLE infrastructures          DROP COLUMN IF EXISTS territory_id;
ALTER TABLE organization_territories DROP COLUMN IF EXISTS territory_id;

-- ============================================================================
-- PHASE 4 : Supprimer les anciennes tables territoire
-- ============================================================================

DROP TABLE IF EXISTS territory_sectors   CASCADE;
DROP TABLE IF EXISTS territories         CASCADE;
DROP TABLE IF EXISTS territory_types     CASCADE;

-- ============================================================================
-- PHASE 5 : Créer les 4 nouvelles tables concrètes
-- ============================================================================

-- Régions (les 12 départements du Bénin)
CREATE TABLE IF NOT EXISTS regions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code       VARCHAR(50) UNIQUE,
    name       VARCHAR(255) NOT NULL UNIQUE,
    geometry   GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE regions IS 'Les 12 départements du Bénin (Atacora, Atlantique, Borgou, Collines, Couffo, Donga, Littoral, Mono, Ouémé, Plateau, Zou, Alibori)';

-- Municipalités / Communes
CREATE TABLE IF NOT EXISTS municipalities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id       UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    code            VARCHAR(50) UNIQUE,
    name            VARCHAR(255) NOT NULL,
    geometry        GEOMETRY(MULTIPOLYGON, 4326),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE municipalities IS '77 communes du Bénin, rattachées à leur département (région)';

-- Arrondissements
CREATE TABLE IF NOT EXISTS districts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    code            VARCHAR(50),
    name            VARCHAR(255) NOT NULL,
    geometry        GEOMETRY(MULTIPOLYGON, 4326),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE districts IS 'Arrondissements, rattachés à leur commune';

-- Quartiers / Villages
CREATE TABLE IF NOT EXISTS neighborhoods (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    code        VARCHAR(50),
    name        VARCHAR(255) NOT NULL,
    geometry    GEOMETRY(MULTIPOLYGON, 4326),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE neighborhoods IS 'Quartiers et villages, rattachés à leur arrondissement';

-- ============================================================================
-- PHASE 6 : Ajouter les colonnes territoire dans auth
-- ============================================================================

ALTER TABLE auth
    ADD COLUMN region_id       UUID NULL,
    ADD COLUMN municipality_id UUID NULL,
    ADD COLUMN district_id     UUID NULL,
    ADD COLUMN neighborhood_id UUID NULL;

ALTER TABLE auth
    ADD CONSTRAINT fk_auth_region       FOREIGN KEY (region_id)       REFERENCES regions(id)       ON DELETE SET NULL,
    ADD CONSTRAINT fk_auth_municipality FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_auth_district     FOREIGN KEY (district_id)     REFERENCES districts(id)     ON DELETE SET NULL,
    ADD CONSTRAINT fk_auth_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL;

COMMENT ON COLUMN auth.region_id       IS 'Requis pour: prefecture, admin_mairie, technicien';
COMMENT ON COLUMN auth.municipality_id IS 'Requis pour: admin_mairie, technicien';
COMMENT ON COLUMN auth.district_id     IS 'Optionnel pour: technicien';
COMMENT ON COLUMN auth.neighborhood_id IS 'Optionnel pour: technicien';

-- ============================================================================
-- PHASE 7 : Ajouter municipality_id dans les tables opérationnelles
-- ============================================================================

-- Missions
ALTER TABLE missions ADD COLUMN municipality_id UUID NULL;
ALTER TABLE missions ADD CONSTRAINT fk_mission_municipality
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE RESTRICT;

-- Reports
ALTER TABLE reports ADD COLUMN municipality_id UUID NULL;
ALTER TABLE reports ADD COLUMN district_id     UUID NULL;
ALTER TABLE reports ADD CONSTRAINT fk_report_municipality
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE RESTRICT;
ALTER TABLE reports ADD CONSTRAINT fk_report_district
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL;

-- Infrastructures
ALTER TABLE infrastructures ADD COLUMN municipality_id UUID NULL;
ALTER TABLE infrastructures ADD CONSTRAINT fk_infrastructure_municipality
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE RESTRICT;

-- Organization territories
ALTER TABLE organization_territories ADD COLUMN municipality_id UUID NULL;
ALTER TABLE organization_territories
    ADD CONSTRAINT fk_orgterr_municipality FOREIGN KEY (municipality_id)
        REFERENCES municipalities(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE organization_territories
    ADD CONSTRAINT uq_org_municipality UNIQUE (organization_id, municipality_id);

-- ============================================================================
-- PHASE 8 : Index
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_regions_code           ON regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_geometry       ON regions USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_municipalities_region  ON municipalities(region_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_code    ON municipalities(code);
CREATE INDEX IF NOT EXISTS idx_municipalities_geometry ON municipalities USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_districts_municipality ON districts(municipality_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_district ON neighborhoods(district_id);

CREATE INDEX IF NOT EXISTS idx_auth_region            ON auth(region_id);
CREATE INDEX IF NOT EXISTS idx_auth_municipality      ON auth(municipality_id);
CREATE INDEX IF NOT EXISTS idx_auth_district          ON auth(district_id);

CREATE INDEX IF NOT EXISTS idx_missions_municipality  ON missions(municipality_id);
CREATE INDEX IF NOT EXISTS idx_reports_municipality   ON reports(municipality_id);
CREATE INDEX IF NOT EXISTS idx_infra_municipality     ON infrastructures(municipality_id);
CREATE INDEX IF NOT EXISTS idx_orgterr_municipality   ON organization_territories(municipality_id);

-- ============================================================================
-- PHASE 9 : Triggers updated_at pour les nouvelles tables
-- ============================================================================

CREATE TRIGGER set_updated_at_regions
    BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_municipalities
    BEFORE UPDATE ON municipalities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_districts
    BEFORE UPDATE ON districts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_neighborhoods
    BEFORE UPDATE ON neighborhoods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PHASE 10 : Réécrire le trigger de contrôle territorial des missions
-- (remplace la CTE récursive sur territories)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_mission_organization_municipality_check()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_organization_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.municipality_id IS NULL THEN
        RETURN NEW; -- Pas de vérification si pas de commune définie
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM organization_territories ot
        WHERE ot.organization_id = NEW.assigned_organization_id
          AND ot.municipality_id = NEW.municipality_id
          AND ot.is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'L''organisation % n''est pas habilitée sur la commune de cette mission',
            NEW.assigned_organization_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mission_organization_municipality_check
    BEFORE INSERT OR UPDATE OF assigned_organization_id, municipality_id ON missions
    FOR EACH ROW EXECUTE FUNCTION fn_mission_organization_municipality_check();

COMMIT;
