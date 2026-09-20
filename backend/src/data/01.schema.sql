/*
 * FILE: 01.schema.sql
 * SIGIE — Schéma complet (extensions + auth + territoire)
 * Toutes les définitions sont uniques, sans doublon.
 * Ordre de création respectant les dépendances FK.
 */

-- ============================================================================
-- Extensions PostgreSQL
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================================================
-- Types & Enums partagés
-- ============================================================================

-- Enum des rôles applicatifs (conservé pour compatibilité éventuelle)
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin_ministere',
    'admin_mairie',
    'technicien',
    'prefecture',
    'societe',
    'citoyen'
);

-- Enum statut générique (utilisé dans territories, territory_sectors, etc.)
CREATE TYPE enum_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- Module organizations
CREATE TYPE organization_type_enum AS ENUM (
    'PUBLIC_COMPANY',   -- Entreprise publique
    'PRIVATE_COMPANY',  -- Entreprise privée
    'UTILITY',          -- Concessionnaire (eau, électricité, télécoms)
    'NGO'               -- Organisation non gouvernementale
);

-- Module 08 — field_reports
CREATE TYPE issue_category_enum AS ENUM (
    'drainage', 'road', 'waste', 'biodiversity', 'environment', 'other'
);
CREATE TYPE priority_level_enum AS ENUM (
    'low', 'medium', 'high', 'urgent', 'critical'
);
CREATE TYPE risk_level_enum AS ENUM (
    'low', 'medium', 'high', 'critical'
);
CREATE TYPE field_report_status_enum AS ENUM (
    'draft', 'submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'archived', 'assigned', 'rejected'
);
CREATE TYPE water_flow_status_enum AS ENUM (
    'free', 'restricted', 'blocked'
);

-- Module 09 — missions
CREATE TYPE mission_type_enum AS ENUM (
    'repair', 'maintenance', 'inspection', 'cleaning', 'construction', 'other'
);
CREATE TYPE mission_status_enum AS ENUM (
    'draft', 'planned', 'assigned', 'accepted', 'rejected',
    'in_progress', 'suspended', 'completed', 'cancelled', 'closed'
);

-- Module 10 — interventions
CREATE TYPE field_assignment_status_enum AS ENUM (
    'not_started', 'started', 'paused', 'resumed', 'completed', 'failed', 'cancelled'
);
CREATE TYPE team_member_role_enum AS ENUM ('COMMAND_LEAD', 'OPS_OPERATOR', 'LOG_OFFICER', 'SAFETY_OFFICER');
CREATE TYPE team_type_enum AS ENUM ('institution', 'provider');
CREATE TYPE role_tier_enum AS ENUM ('platform', 'territorial', 'field');
CREATE TYPE otp_type_enum AS ENUM ('EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'TWO_FACTOR');
CREATE TYPE audit_action_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ============================================================================
-- Fonction trigger updated_at (doit exister avant les triggers)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- Rôles (table pilotée — remplace l'enum, permet métadonnées UI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL CHECK (length(trim(code)) > 0),
    name VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    tier role_tier_enum,
    route_prefix VARCHAR(100),
    dashboard_path VARCHAR(255),
    page_ids TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    can_manage_users BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_roles BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE roles IS 'super_admin/admin_ministere → tier platform ; admin_mairie/prefecture → tier territorial ; technicien → tier field ; citoyen → aucun tier';


-- ============================================================================
-- Organisations — Prestataires uniquement
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type organization_type_enum NOT NULL,
    registration_number VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE organizations IS 'Prestataires exécutant missions/interventions (BTP, concessionnaires eau/électricité, ONG...)';


-- ============================================================================
-- Territoire — Hiérarchie administrative récursive du Bénin
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
COMMENT ON TABLE regions IS 'Les 12 départements du Bénin';

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
COMMENT ON TABLE municipalities IS '77 communes du Bénin';

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


-- ============================================================================
-- Auth — identité de base (dépend de: roles, organizations, territories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL UNIQUE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    region_id UUID NULL REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID NULL REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID NULL REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID NULL REFERENCES neighborhoods(id) ON DELETE SET NULL,
    organization_id UUID NULL REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN auth.region_id IS 'Requis pour: prefecture, admin_mairie, technicien';
COMMENT ON COLUMN auth.municipality_id IS 'Requis pour: admin_mairie, technicien';
COMMENT ON COLUMN auth.district_id IS 'Optionnel pour: technicien';
COMMENT ON COLUMN auth.neighborhood_id IS 'Optionnel pour: technicien';
COMMENT ON COLUMN auth.organization_id IS 'Renseigné uniquement pour les techniciens rattachés à un prestataire';




-- ============================================================================
-- Credentials — mot de passe hashé (bcrypt)
-- ============================================================================
CREATE TABLE IF NOT EXISTS credentials (
    auth_id UUID PRIMARY KEY REFERENCES auth(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL
);


-- ============================================================================
-- Permissions granulaires (module + action)
-- ============================================================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(100) NOT NULL CHECK (length(trim(module)) > 0),
    action VARCHAR(100) NOT NULL CHECK (length(trim(action)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (module, action)
);


-- ============================================================================
-- Role <-> Permissions (N:N)
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (role_id, permission_id)
);


-- ============================================================================
-- Sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL REFERENCES auth(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- Statut du compte
-- ============================================================================
CREATE TABLE IF NOT EXISTS account_status (
    auth_id UUID PRIMARY KEY REFERENCES auth(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- Codes OTP
-- ============================================================================
CREATE TABLE IF NOT EXISTS otp_codes (
    auth_id UUID PRIMARY KEY REFERENCES auth(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL, -- stocké sous forme de hash
    type otp_type_enum NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- Index (FK + GIST — Partie VII / XI.2)
-- ============================================================================

-- Territories
CREATE INDEX IF NOT EXISTS idx_regions_code           ON regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_geometry       ON regions USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_municipalities_region  ON municipalities(region_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_code    ON municipalities(code);
CREATE INDEX IF NOT EXISTS idx_municipalities_geometry ON municipalities USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_districts_municipality ON districts(municipality_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_district ON neighborhoods(district_id);

-- Auth
CREATE INDEX IF NOT EXISTS idx_auth_role                   ON auth(role_id);
CREATE INDEX IF NOT EXISTS idx_auth_region                 ON auth(region_id);
CREATE INDEX IF NOT EXISTS idx_auth_municipality           ON auth(municipality_id);
CREATE INDEX IF NOT EXISTS idx_auth_district               ON auth(district_id);
CREATE INDEX IF NOT EXISTS idx_auth_organization           ON auth(organization_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role       ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);


-- ============================================================================
-- Triggers updated_at
-- ============================================================================

CREATE TRIGGER set_updated_at_roles
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_organizations
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

CREATE TRIGGER set_updated_at_auth
    BEFORE UPDATE ON auth
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_sessions
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_account_status
    BEFORE UPDATE ON account_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_otp_codes
    BEFORE UPDATE ON otp_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SIGIE — 08_field_reports.sql
-- Opérations terrain : rapports des techniciens (signalement)
-- ============================================================================



-- ---------------------------------------------------------------------
-- Rapport principal de technicien
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    municipality_id     UUID NOT NULL,
    district_id         UUID NULL,

    -- Références optionnelles
    infrastructure_id   UUID,
    mapped_area_id      UUID,

    -- Contenu
    title               VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
    description         TEXT,
    issue_category      issue_category_enum NOT NULL,
    priority            priority_level_enum NOT NULL DEFAULT 'medium',
    risk_level          risk_level_enum NOT NULL DEFAULT 'medium',
    status              field_report_status_enum NOT NULL DEFAULT 'submitted',

    -- Géolocalisation (double stockage — Partie I.3)
    location            GEOMETRY(Point, 4326),
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,

    -- Traçabilité
    created_by          UUID NOT NULL,
    reported_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Assignation & SLA
    assigned_to         UUID,
    resolved_at         TIMESTAMPTZ,
    sla_hours           INTEGER NOT NULL DEFAULT 48 CHECK (sla_hours > 0),

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT fk_report_municipality FOREIGN KEY (municipality_id)
        REFERENCES municipalities(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_report_district FOREIGN KEY (district_id)
        REFERENCES districts(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_report_created_by FOREIGN KEY (created_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_report_assigned_to FOREIGN KEY (assigned_to)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_report_resolved_after_reported CHECK (resolved_at IS NULL OR resolved_at >= reported_at),
    CONSTRAINT chk_report_latitude  CHECK (latitude  IS NULL OR latitude  BETWEEN -90  AND 90),
    CONSTRAINT chk_report_longitude CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);
COMMENT ON TABLE reports IS 'Signalement terrain créé par un technicien (créateur toujours interne → origine vérifiable de facto)';


-- ---------------------------------------------------------------------
-- Index (FK + GIST obligatoires)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_reports_municipality   ON reports(municipality_id);
CREATE INDEX IF NOT EXISTS idx_reports_infrastructure ON reports(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_reports_mapped_area    ON reports(mapped_area_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_by     ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to    ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_status         ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_location       ON reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_reports_deleted_at     ON reports(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_reports
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8b. EXTENSIONS DE RAPPORTS (Class Table Inheritance, 1:1)
-- ============================================================================

-- Détails drainage
CREATE TABLE IF NOT EXISTS report_details_drainage (
    report_id           UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    blockage_level_pct  NUMERIC(5,2) CHECK (blockage_level_pct BETWEEN 0 AND 100),
    water_level_cm      NUMERIC(8,2) CHECK (water_level_cm >= 0),
    flow_status         water_flow_status_enum,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE report_details_drainage IS 'Extension 1:1 — renseignée uniquement si reports.issue_category = ''drainage''';

-- Détails route
CREATE TABLE IF NOT EXISTS report_details_road (
    report_id           UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    damage_surface_m2   NUMERIC(8,2) CHECK (damage_surface_m2 >= 0),
    pothole_depth_cm    NUMERIC(5,2) CHECK (pothole_depth_cm >= 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Détails déchets
CREATE TABLE IF NOT EXISTS report_details_waste (
    report_id            UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    estimated_volume_m3  NUMERIC(8,2) CHECK (estimated_volume_m3 >= 0),
    waste_type           VARCHAR(100),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Détails biodiversité
CREATE TABLE IF NOT EXISTS report_details_biodiversity (
    report_id          UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    species_name       VARCHAR(255),
    observation_type   VARCHAR(50),
    count              INTEGER CHECK (count IS NULL OR count >= 0),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Détails environnement (capteurs)
CREATE TABLE IF NOT EXISTS report_details_environment (
    report_id        UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    sensor_id        UUID,
    measured_value   NUMERIC(12,4),
    unit             VARCHAR(20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_details_environment_sensor ON report_details_environment(sensor_id);

-- ============================================================================
-- SIGIE — 09_missions.sql
-- Missions créées par l'administration (mairie/DST) et assignées à un
-- prestataire (organizations) pour intervention.
-- ============================================================================



-- ---------------------------------------------------------------------
-- Missions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS missions (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    municipality_id          UUID NOT NULL,

    -- Lien vers le signalement d'origine (optionnel)
    report_id                UUID,

    -- Contenu
    mission_type             mission_type_enum NOT NULL,
    priority_level           priority_level_enum NOT NULL DEFAULT 'medium',
    title                    VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
    description              TEXT,
    status                   mission_status_enum NOT NULL DEFAULT 'draft',

    -- Assignation prestataire + équipe interne
    assigned_organization_id UUID,
    assigned_team_id         UUID,

    -- Refus (justification obligatoire — chk_mission_acceptance)
    rejected_reason          TEXT,

    -- Planification & suivi temps
    scheduled_at             TIMESTAMPTZ,
    due_date                 TIMESTAMPTZ,
    completed_at             TIMESTAMPTZ,
    estimated_hours          NUMERIC(6,2) CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
    actual_hours             NUMERIC(6,2) CHECK (actual_hours IS NULL OR actual_hours >= 0),

    -- Géolocalisation
    location                 GEOMETRY(Point, 4326),

    -- Traçabilité
    created_by               UUID NOT NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at               TIMESTAMPTZ,

    CONSTRAINT fk_mission_municipality FOREIGN KEY (municipality_id)
        REFERENCES municipalities(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_mission_report FOREIGN KEY (report_id)
        REFERENCES reports(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_mission_organization FOREIGN KEY (assigned_organization_id)
        REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    -- fk_mission_team ajoutée via ALTER TABLE dans le module 10 (après création de field_teams)
    CONSTRAINT fk_mission_created_by FOREIGN KEY (created_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT chk_mission_acceptance CHECK (
        status <> 'rejected' OR (rejected_reason IS NOT NULL AND length(trim(rejected_reason)) > 0)
    ),
    CONSTRAINT chk_mission_dates CHECK (
        (due_date IS NULL OR scheduled_at IS NULL OR due_date >= scheduled_at)
        AND (completed_at IS NULL OR scheduled_at IS NULL OR completed_at >= scheduled_at)
    ),
    CONSTRAINT chk_mission_team_requires_org CHECK (
        assigned_team_id IS NULL OR assigned_organization_id IS NOT NULL
    )
);
COMMENT ON TABLE missions IS 'Créée par l''administration (mairie/DST), assignée à un prestataire (organizations) pour intervention';
COMMENT ON COLUMN missions.assigned_organization_id IS 'Prestataire retenu pour l''intervention. L''équipe précise (assigned_team_id) est choisie après acceptation par le prestataire';

CREATE INDEX IF NOT EXISTS idx_missions_municipality  ON missions(municipality_id);
CREATE INDEX IF NOT EXISTS idx_missions_report        ON missions(report_id);
CREATE INDEX IF NOT EXISTS idx_missions_organization  ON missions(assigned_organization_id);
CREATE INDEX IF NOT EXISTS idx_missions_team          ON missions(assigned_team_id);
CREATE INDEX IF NOT EXISTS idx_missions_created_by   ON missions(created_by);
CREATE INDEX IF NOT EXISTS idx_missions_status        ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_location      ON missions USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_missions_deleted_at    ON missions(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_missions
    BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- Checklist de mission (sous-tâches)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_checklist (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id  UUID NOT NULL,
    label       TEXT NOT NULL CHECK (length(trim(label)) > 0),
    done        BOOLEAN NOT NULL DEFAULT FALSE,
    done_by     UUID,
    done_at     TIMESTAMPTZ,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_checklist_mission FOREIGN KEY (mission_id)
        REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_checklist_done_by FOREIGN KEY (done_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_checklist_done_consistency CHECK (
        (done = FALSE AND done_at IS NULL) OR (done = TRUE)
    )
);
CREATE INDEX IF NOT EXISTS idx_checklist_mission ON mission_checklist(mission_id);

-- ---------------------------------------------------------------------
-- Assignations de mission aux utilisateurs (au sein du prestataire)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_assignments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id    UUID NOT NULL,
    user_id       UUID NOT NULL,
    assigned_by   UUID,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,

    CONSTRAINT fk_assignment_mission FOREIGN KEY (mission_id)
        REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_assignment_assigned_by FOREIGN KEY (assigned_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT uq_mission_user UNIQUE (mission_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_assignments_mission ON mission_assignments(mission_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user    ON mission_assignments(user_id);

-- ---------------------------------------------------------------------
-- Rapports de mission
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_reports (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id            UUID NOT NULL,
    submitted_by          UUID NOT NULL,
    report                TEXT,
    completion_percentage INTEGER CHECK (completion_percentage IS NULL OR completion_percentage BETWEEN 0 AND 100),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_mreport_mission FOREIGN KEY (mission_id)
        REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_mreport_submitted_by FOREIGN KEY (submitted_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_mreports_mission ON mission_reports(mission_id);

-- ---------------------------------------------------------------------
-- Historique des statuts de mission
-- Alimentée par trigger AFTER INSERT OR UPDATE OF status sur missions —
-- jamais d'INSERT manuel depuis l'application (Partie V.1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id  UUID NOT NULL,
    old_status  mission_status_enum,
    new_status  mission_status_enum NOT NULL,
    changed_by  UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_mstatus_mission FOREIGN KEY (mission_id)
        REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_mstatus_changed_by FOREIGN KEY (changed_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_mstatus_mission ON mission_status_history(mission_id);

-- ============================================================================
-- SIGIE — 10_interventions.sql
-- Interventions réalisées par les organisations (prestataires) pour exécuter
-- les missions. Équipes terrain hiérarchisées (field_teams) et périmètre
-- territorial contrôlé (organization_territories).
-- ============================================================================

-- ---------------------------------------------------------------------
-- Zone de compétence territoriale d'une organisation
-- ("reçoit les missions de sa commune")
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_territories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    municipality_id UUID NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orgterr_organization FOREIGN KEY (organization_id)
        REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_orgterr_municipality FOREIGN KEY (municipality_id)
        REFERENCES municipalities(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_org_municipality UNIQUE (organization_id, municipality_id)
);
COMMENT ON TABLE organization_territories IS 'Communes sur lesquelles une organisation est autorisée à intervenir';

CREATE INDEX IF NOT EXISTS idx_orgterr_organization ON organization_territories(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgterr_municipality ON organization_territories(municipality_id);

-- ---------------------------------------------------------------------
-- Équipes terrain (hiérarchisées) au sein d'une organisation
-- NOTE: référencée en FK depuis missions(assigned_team_id) — créée ici,
-- la FK sera ajoutée via ALTER TABLE ci-dessous.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS field_teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- provider = société prestataire (SONEB, SBEE, SGDS...) ; institution = équipe publique (mairie, ministère)
    team_type       team_type_enum NOT NULL DEFAULT 'provider',
    organization_id UUID,
    name            VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT fk_team_organization FOREIGN KEY (organization_id)
        REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_teams_organization ON field_teams(organization_id);

CREATE TRIGGER set_updated_at_field_teams
    BEFORE UPDATE ON field_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activation de la FK différée missions → field_teams
ALTER TABLE missions
    ADD CONSTRAINT fk_mission_team FOREIGN KEY (assigned_team_id)
        REFERENCES field_teams(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- Membres d'équipe (hiérarchie : 1 chef + N membres)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS field_team_members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id      UUID NOT NULL,
    user_id      UUID NOT NULL,
    role_in_team team_member_role_enum NOT NULL DEFAULT 'OPS_OPERATOR',
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at      TIMESTAMPTZ,

    CONSTRAINT fk_teammember_team FOREIGN KEY (team_id)
        REFERENCES field_teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_teammember_user FOREIGN KEY (user_id)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_team_user UNIQUE (team_id, user_id),
    CONSTRAINT chk_teammember_dates CHECK (left_at IS NULL OR left_at >= joined_at)
);
CREATE INDEX IF NOT EXISTS idx_teammembers_team ON field_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_teammembers_user ON field_team_members(user_id);

-- Un seul chef actif par équipe
CREATE UNIQUE INDEX IF NOT EXISTS uq_one_active_leader_per_team
    ON field_team_members(team_id)
    WHERE role_in_team = 'COMMAND_LEAD' AND is_active = TRUE;
COMMENT ON INDEX uq_one_active_leader_per_team IS 'Garantit un seul chef actif par équipe';

-- ---------------------------------------------------------------------
-- Interventions — exécution terrain d'une mission par une société prestataire
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interventions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id          UUID NOT NULL,
    assigned_societe_id UUID NOT NULL,
    assigned_to_user_id UUID,  -- référent/technicien pilote (optionnel)

    intervention_type   VARCHAR(100) NOT NULL CHECK (length(trim(intervention_type)) > 0),
    status              field_assignment_status_enum NOT NULL DEFAULT 'not_started',

    vehicle_notes       TEXT,
    equipment_notes     TEXT,

    started_at          TIMESTAMPTZ,
    ended_at            TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT fk_intervention_mission FOREIGN KEY (mission_id)
        REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_intervention_societe FOREIGN KEY (assigned_societe_id)
        REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_intervention_user FOREIGN KEY (assigned_to_user_id)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_intervention_dates CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);
COMMENT ON TABLE interventions IS 'Réalisée par une société prestataire (organizations) assignée à la mission';

CREATE INDEX IF NOT EXISTS idx_interventions_mission    ON interventions(mission_id);
CREATE INDEX IF NOT EXISTS idx_interventions_societe    ON interventions(assigned_societe_id);
CREATE INDEX IF NOT EXISTS idx_interventions_user       ON interventions(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status     ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_deleted_at ON interventions(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_interventions
    BEFORE UPDATE ON interventions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ---------------------------------------------------------------------
-- Rapports d'intervention terrain
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS field_intervention_reports (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id        UUID NOT NULL,
    report_id              UUID,
    created_by             UUID NOT NULL,

    work_done              TEXT,
    blockage_removed_pct   NUMERIC(5,2) CHECK (blockage_removed_pct IS NULL OR blockage_removed_pct BETWEEN 0 AND 100),
    final_condition_score  NUMERIC(5,2) CHECK (final_condition_score IS NULL OR final_condition_score BETWEEN 0 AND 100),
    recommendations        TEXT,
    completed              BOOLEAN NOT NULL DEFAULT FALSE,

    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at             TIMESTAMPTZ,

    CONSTRAINT fk_fireport_intervention FOREIGN KEY (intervention_id)
        REFERENCES interventions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_fireport_report FOREIGN KEY (report_id)
        REFERENCES reports(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_fireport_created_by FOREIGN KEY (created_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE RESTRICT
);
COMMENT ON COLUMN field_intervention_reports.created_by IS 'Doit être membre actif de l''équipe assignée à l''intervention (contrôlé par trigger trg_fireport_author_in_team)';

CREATE INDEX IF NOT EXISTS idx_fireports_intervention ON field_intervention_reports(intervention_id);
CREATE INDEX IF NOT EXISTS idx_fireports_report       ON field_intervention_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_fireports_created_by  ON field_intervention_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_fireports_deleted_at  ON field_intervention_reports(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_field_intervention_reports
    BEFORE UPDATE ON field_intervention_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cohérence : l'auteur du rapport doit être membre de l'équipe de l'intervention
CREATE OR REPLACE FUNCTION fn_fireport_author_in_team()
RETURNS TRIGGER AS $$
DECLARE
    v_team_id UUID;
BEGIN
    SELECT assigned_team_id INTO v_team_id
    FROM interventions WHERE id = NEW.intervention_id;

    IF NOT EXISTS (
        SELECT 1 FROM field_team_members
        WHERE team_id  = v_team_id
          AND user_id  = NEW.created_by
          AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'created_by doit être membre actif de l''équipe assignée à l''intervention';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fireport_author_in_team
    BEFORE INSERT OR UPDATE OF intervention_id, created_by ON field_intervention_reports
    FOR EACH ROW EXECUTE FUNCTION fn_fireport_author_in_team();

-- ---------------------------------------------------------------------
-- Contrôle de compétence territoriale
-- Une mission ne peut être assignée qu'à une organisation opérant sur
-- le territoire de la mission ou un territoire ancêtre.
-- ---------------------------------------------------------------------
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

-- ============================================================================
-- SIGIE — 12_infrastructures.sql
-- Équipements physiques urbains inspectés, signalés et entretenus via
-- les rapports techniciens et les missions d'intervention.
-- ============================================================================

-- ---------------------------------------------------------------------
-- Enums du module (ajoutés ici, à déplacer en section centrale si souhaité)
-- ---------------------------------------------------------------------
CREATE TYPE infrastructure_type_enum AS ENUM (
    'drain',          -- Caniveau / fossé de drainage
    'road',           -- Route / chaussée
    'bridge',         -- Pont / ouvrage d'art
    'water_pipe',     -- Canalisation d'eau potable
    'sewer_pipe',     -- Collecteur d'eaux usées
    'streetlight',    -- Éclairage public
    'waste_bin',      -- Bac à ordures / point de collecte
    'well',           -- Puits / forage
    'market',         -- Infrastructure de marché
    'school',         -- Équipement scolaire
    'health_center',  -- Centre de santé
    'public_toilet',  -- Latrines / toilettes publiques
    'park',           -- Espace vert / parc
    'other'           -- Autre équipement
);

CREATE TYPE infrastructure_condition_enum AS ENUM (
    'new',          -- Neuf / récemment installé
    'good',         -- Bon état
    'fair',         -- État acceptable, surveillance requise
    'poor',         -- Mauvais état, intervention recommandée
    'critical',     -- État critique, intervention urgente
    'destroyed'     -- Hors service / à remplacer
);

-- ---------------------------------------------------------------------
-- Mapped areas — zones cartographiées (quartiers informels, bassins
-- versants, zones d'activité) non couvertes par territories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mapped_areas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL,
    name            VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
    area_type       VARCHAR(100),   -- ex: 'informal_settlement', 'watershed', 'commercial_zone'
    geometry        GEOMETRY(MultiPolygon, 4326),
    centroid        GEOMETRY(Point, 4326),
    status          enum_status NOT NULL DEFAULT 'ACTIVE',
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT fk_mappedarea_municipality FOREIGN KEY (municipality_id)
        REFERENCES municipalities(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_mappedarea_created_by FOREIGN KEY (created_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL
);
COMMENT ON TABLE mapped_areas IS 'Zones cartographiées hors hiérarchie administrative : bassins versants, quartiers informels, zones commerciales...';

CREATE INDEX IF NOT EXISTS idx_mappedareas_municipality ON mapped_areas(municipality_id);
CREATE INDEX IF NOT EXISTS idx_mappedareas_geometry  ON mapped_areas USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_mappedareas_deleted_at ON mapped_areas(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_mapped_areas
    BEFORE UPDATE ON mapped_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- Infrastructures — équipements physiques urbains
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS infrastructures (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Localisation
    municipality_id   UUID NOT NULL,
    mapped_area_id    UUID,              -- zone cartographiée optionnelle (ex: bassin versant)

    -- Identification
    name              VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
    reference_code    VARCHAR(100) UNIQUE,   -- ex: 'DRN-COT-0045' (numérotation interne)
    type              infrastructure_type_enum NOT NULL,
    condition         infrastructure_condition_enum NOT NULL DEFAULT 'good',
    status            enum_status NOT NULL DEFAULT 'ACTIVE',

    -- Description
    description       TEXT,
    material          VARCHAR(100),     -- ex: 'béton', 'bitume', 'PVC', 'acier galvanisé'
    dimensions        JSONB DEFAULT '{}'::jsonb,  -- ex: {"length_m": 45, "width_m": 1.2, "depth_m": 0.8}
    installation_date DATE,
    last_maintained_at TIMESTAMPTZ,

    -- Géolocalisation (double stockage — cohérence avec reports)
    location          GEOMETRY(Point, 4326),
    geometry          GEOMETRY(MultiLineString, 4326), -- pour routes, caniveaux linéaires
    latitude          DOUBLE PRECISION CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    longitude         DOUBLE PRECISION CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),

    -- Métadonnées extensibles (attributs spécifiques au type)
    metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Traçabilité
    created_by        UUID,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ,

    CONSTRAINT fk_infra_municipality FOREIGN KEY (municipality_id)
        REFERENCES municipalities(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_infra_mapped_area FOREIGN KEY (mapped_area_id)
        REFERENCES mapped_areas(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_infra_created_by FOREIGN KEY (created_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL
);
COMMENT ON TABLE infrastructures IS 'Équipements physiques urbains : caniveaux, routes, ponts, forages, éclairage public... — point de rattachement des signalements techniciens et missions';
COMMENT ON COLUMN infrastructures.reference_code IS 'Code interne unique — ex: DRN-COT-0045 (type-ville-numéro)';
COMMENT ON COLUMN infrastructures.dimensions IS 'JSONB libre : length_m, width_m, depth_m, capacity_m3 selon le type';
COMMENT ON COLUMN infrastructures.geometry IS 'Géométrie linéaire pour caniveaux et routes ; utiliser location (Point) pour équipements ponctuels';

CREATE INDEX IF NOT EXISTS idx_infra_municipality  ON infrastructures(municipality_id);
CREATE INDEX IF NOT EXISTS idx_infra_mapped_area   ON infrastructures(mapped_area_id);
CREATE INDEX IF NOT EXISTS idx_infra_type          ON infrastructures(type);
CREATE INDEX IF NOT EXISTS idx_infra_status        ON infrastructures(status);
CREATE INDEX IF NOT EXISTS idx_infra_condition     ON infrastructures(condition);
CREATE INDEX IF NOT EXISTS idx_infra_location      ON infrastructures USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_infra_geometry      ON infrastructures USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_infra_deleted_at    ON infrastructures(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_infrastructures
    BEFORE UPDATE ON infrastructures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mise à jour automatique de la condition de l'infrastructure
-- quand un rapport technicien est clôturé (résolu → bon état présumé)
CREATE OR REPLACE FUNCTION fn_update_infra_condition_on_resolve()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status <> 'resolved'
       AND NEW.infrastructure_id IS NOT NULL THEN
        UPDATE infrastructures
        SET last_maintained_at = NOW(),
            condition = CASE
                WHEN condition IN ('critical', 'poor') THEN 'fair'
                WHEN condition = 'fair'               THEN 'good'
                ELSE condition
            END
        WHERE id = NEW.infrastructure_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_infra_condition_on_resolve
    AFTER UPDATE OF status ON reports
    FOR EACH ROW EXECUTE FUNCTION fn_update_infra_condition_on_resolve();

-- ---------------------------------------------------------------------
-- Capteurs environnementaux — rattachés à une infrastructure ou un territoire
-- ---------------------------------------------------------------------
CREATE TYPE sensor_type_enum AS ENUM (
    'water_level',    -- Niveau d'eau (pluviométrie, crues)
    'water_quality',  -- Qualité de l'eau
    'air_quality',    -- Qualité de l'air (PM2.5, CO2...)
    'noise',          -- Niveau sonore
    'soil_moisture',  -- Humidité des sols
    'flow_rate',      -- Débit (caniveaux, tuyaux)
    'temperature',    -- Température ambiante
    'other'
);

CREATE TABLE IF NOT EXISTS environmental_sensors (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id   UUID,
    infrastructure_id UUID,               -- capteur rattaché à une infrastructure précise
    mapped_area_id    UUID,

    serial_number     VARCHAR(100) NOT NULL UNIQUE,
    name              VARCHAR(255),
    type              sensor_type_enum NOT NULL,
    manufacturer      VARCHAR(100),
    model             VARCHAR(100),

    location          GEOMETRY(Point, 4326),
    latitude          DOUBLE PRECISION CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    longitude         DOUBLE PRECISION CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),

    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    installed_at      TIMESTAMPTZ,
    last_reading_at   TIMESTAMPTZ,
    metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_by        UUID,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sensor_municipality FOREIGN KEY (municipality_id)
        REFERENCES municipalities(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_sensor_infrastructure FOREIGN KEY (infrastructure_id)
        REFERENCES infrastructures(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_sensor_mapped_area FOREIGN KEY (mapped_area_id)
        REFERENCES mapped_areas(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_sensor_created_by FOREIGN KEY (created_by)
        REFERENCES auth(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_sensor_has_location CHECK (
        municipality_id IS NOT NULL OR infrastructure_id IS NOT NULL OR mapped_area_id IS NOT NULL
    )
);
COMMENT ON TABLE environmental_sensors IS 'Capteurs IoT terrain : niveau d''eau, qualité air, débit caniveau...';
COMMENT ON CONSTRAINT chk_sensor_has_location ON environmental_sensors IS 'Un capteur doit être rattaché à au moins une entité spatiale';

CREATE INDEX IF NOT EXISTS idx_sensors_municipality   ON environmental_sensors(municipality_id);
CREATE INDEX IF NOT EXISTS idx_sensors_infrastructure ON environmental_sensors(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_sensors_mapped_area    ON environmental_sensors(mapped_area_id);
CREATE INDEX IF NOT EXISTS idx_sensors_type           ON environmental_sensors(type);
CREATE INDEX IF NOT EXISTS idx_sensors_active         ON environmental_sensors(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sensors_location       ON environmental_sensors USING GIST (location);

CREATE TRIGGER set_updated_at_environmental_sensors
    BEFORE UPDATE ON environmental_sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FK différées (tables créées avant leurs cibles respectives)
-- ============================================================================

ALTER TABLE reports
    ADD CONSTRAINT fk_report_infrastructure FOREIGN KEY (infrastructure_id)
        REFERENCES infrastructures(id) ON UPDATE CASCADE ON DELETE SET NULL,
    ADD CONSTRAINT fk_report_mapped_area FOREIGN KEY (mapped_area_id)
        REFERENCES mapped_areas(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE report_details_environment
    ADD CONSTRAINT fk_report_details_environment_sensor FOREIGN KEY (sensor_id)
        REFERENCES environmental_sensors(id) ON DELETE SET NULL;

-- ============================================================================
-- Triggers P2 manquants (identifiés dans l'analyse)
-- ============================================================================

-- T2 — Alimentation de mission_status_history (table existante, trigger absent)
CREATE OR REPLACE FUNCTION fn_track_mission_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO mission_status_history(mission_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_track_mission_status
    AFTER UPDATE OF status ON missions
    FOR EACH ROW EXECUTE FUNCTION fn_track_mission_status();

-- T3 — Auto-complétion mission quand toutes ses interventions sont terminées
CREATE OR REPLACE FUNCTION fn_auto_complete_mission()
RETURNS TRIGGER AS $$
DECLARE
    v_total INT;
    v_done  INT;
BEGIN
    IF NEW.status = 'completed' THEN
        SELECT COUNT(*)                                  INTO v_total FROM interventions WHERE mission_id = NEW.mission_id AND deleted_at IS NULL;
        SELECT COUNT(*) FILTER (WHERE status = 'completed') INTO v_done  FROM interventions WHERE mission_id = NEW.mission_id AND deleted_at IS NULL;
        IF v_total > 0 AND v_total = v_done THEN
            UPDATE missions
            SET status       = 'completed',
                completed_at = NOW()
            WHERE id = NEW.mission_id
              AND status NOT IN ('completed', 'cancelled', 'closed');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_complete_mission
    AFTER UPDATE OF status ON interventions
    FOR EACH ROW EXECUTE FUNCTION fn_auto_complete_mission();

-- T4 — Initialisation automatique account_status à la création d'un auth
CREATE OR REPLACE FUNCTION fn_init_account_status()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO account_status(auth_id, is_active, is_verified)
    VALUES (NEW.id, TRUE, FALSE)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_init_account_status
    AFTER INSERT ON auth
    FOR EACH ROW EXECUTE FUNCTION fn_init_account_status();

-- T5 — Révocation des sessions actives à la désactivation du compte
CREATE OR REPLACE FUNCTION fn_revoke_sessions_on_deactivation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        DELETE FROM sessions WHERE auth_id = NEW.auth_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_revoke_sessions_on_deactivation
    AFTER UPDATE OF is_active ON account_status
    FOR EACH ROW EXECUTE FUNCTION fn_revoke_sessions_on_deactivation();

-- T1 — Historique des statuts de reports
CREATE TABLE IF NOT EXISTS report_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    old_status  field_report_status_enum,
    new_status  field_report_status_enum NOT NULL,
    changed_by  UUID REFERENCES auth(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_report_status_history_report ON report_status_history(report_id);

CREATE OR REPLACE FUNCTION fn_track_report_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO report_status_history(report_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.assigned_to);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_track_report_status
    AFTER UPDATE OF status ON reports
    FOR EACH ROW EXECUTE FUNCTION fn_track_report_status();

-- ============================================================================
-- SLA — fonction à planifier via pg_cron ou job applicatif
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_mark_sla_breached()
RETURNS void AS $$
BEGIN
    -- Passe en 'under_review' tout signalement soumis dont le SLA est dépassé
    UPDATE reports
    SET status = 'under_review'
    WHERE status = 'submitted'
      AND (reported_at + (sla_hours || ' hours')::INTERVAL) < NOW()
      AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION fn_mark_sla_breached() IS 'À planifier via pg_cron : SELECT cron.schedule(''0 * * * *'', ''SELECT fn_mark_sla_breached()'')';

-- ============================================================================
-- SIGIE — 99_audit_log.sql
-- Traçabilité globale (Conformité P4)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES auth(id) ON DELETE SET NULL,
    action      audit_action_enum NOT NULL,
    table_name  VARCHAR(100) NOT NULL,
    record_id   UUID NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor        ON audit_log(actor_id);

CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_record_id UUID;
BEGIN
    -- Tentative de récupération de l'acteur courant (ex: via session / set_config)
    -- current_setting('request.jwt.claim.sub', true) pour Supabase / PostgREST
    BEGIN
        v_actor_id := current_setting('request.jwt.claim.sub', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_actor_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        v_new_data := row_to_json(NEW)::JSONB;
        v_record_id := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := row_to_json(OLD)::JSONB;
        v_new_data := row_to_json(NEW)::JSONB;
        v_record_id := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        v_old_data := row_to_json(OLD)::JSONB;
        v_record_id := OLD.id;
    END IF;

    INSERT INTO audit_log (actor_id, action, table_name, record_id, old_data, new_data)
    VALUES (v_actor_id, TG_OP::audit_action_enum, TG_TABLE_NAME, v_record_id, v_old_data, v_new_data);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Exemples d'activation de l'audit log sur des tables critiques (auth, roles)
CREATE TRIGGER trg_audit_auth
    AFTER INSERT OR UPDATE OR DELETE ON auth
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER trg_audit_roles
    AFTER INSERT OR UPDATE OR DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ============================================================================
-- MODULE MEDIA — fichiers uploadés (Cloudinary)
-- ============================================================================
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(50),
    entity_id UUID,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    uploaded_by UUID REFERENCES auth(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_module     ON media(module);
CREATE INDEX IF NOT EXISTS idx_media_entity     ON media(entity_id);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
