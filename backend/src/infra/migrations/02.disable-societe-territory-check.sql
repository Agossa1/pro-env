-- Les societes sont des prestataires pouvant travailler avec toutes les mairies.
-- On neutralise le controle de competence territoriale pour les missions.

CREATE OR REPLACE FUNCTION fn_mission_organization_territory_check()
RETURNS TRIGGER AS $fn$
BEGIN
    RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;
