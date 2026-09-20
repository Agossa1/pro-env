-- Ajouter infrastructure_id à la table reports
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS infrastructure_id UUID DEFAULT NULL
REFERENCES infrastructures(id) ON DELETE SET NULL;

-- Ajouter infrastructure_id à la table missions
ALTER TABLE missions
ADD COLUMN IF NOT EXISTS infrastructure_id UUID DEFAULT NULL
REFERENCES infrastructures(id) ON DELETE SET NULL;
