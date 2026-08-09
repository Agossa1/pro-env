/*
 * SEED TERRITOIRES — Bénin (4 niveaux administratifs)
 * ─────────────────────────────────────────────────────────────────────
 * 1) Attributs + hiérarchie depuis `location_data_bj` (12 depts, 77
 *    communes, 546 arrondissements, 5303 quartiers/villages).
 * 2) Géométries depuis GeoBoundaries (ADM1/ADM2/ADM3), sources :
 *    - locale : backend/src/data/geoBoundaries-BEN-ADMn.geojson
 *    - sinon téléchargement + cache dans backend/src/infra/seed/data/
 *
 * Matching intelligent des noms (les fichiers ADM3 contiennent des accents
 * remplacés par '?' dans le source) : exact → wildcard → fuzzy (≤ 2).
 *
 * Codes préfixés : BJ-DEP-, BJ-TWN-, BJ-DIS-, BJ-NGH-
 * Idempotent (ON CONFLICT DO UPDATE). Usage : npm run seed:territory
 */
import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import {
  departmentList,
  townsList,
  districtList,
  neighborhoodList,
} from 'location_data_bj';

const TERRITORY_TYPES = [
  { code: 'PAYS', name: 'Pays', hierarchyLevel: 0 },
  { code: 'DEPARTMENT', name: 'Département', hierarchyLevel: 1 },
  { code: 'COMMUNE', name: 'Commune', hierarchyLevel: 2 },
  { code: 'ARRONDISSEMENT', name: 'Arrondissement', hierarchyLevel: 3 },
  { code: 'QUARTIER', name: 'Quartier/Village', hierarchyLevel: 4 },
] as const;

const CODE_PREFIX = {
  PAYS: 'BJ-PAYS',
  DEPARTMENT: 'BJ-DEP',
  COMMUNE: 'BJ-TWN',
  ARRONDISSEMENT: 'BJ-DIS',
  QUARTIER: 'BJ-NGH',
} as const;

// ── Sources GeoBoundaries ─────────────────────────────────────────────────────
const LOCAL_DATA_DIR = path.join(__dirname, '..', '..', 'data');
const GEOJSON_CACHE_DIR = path.join(__dirname, 'data');

const GEOBOUNDARIES_URLS = {
  PAYS:
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BEN/ADM0/geoBoundaries-BEN-ADM0.geojson',
  DEPARTMENT:
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BEN/ADM1/geoBoundaries-BEN-ADM1.geojson',
  COMMUNE:
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BEN/ADM2/geoBoundaries-BEN-ADM2.geojson',
  ARRONDISSEMENT:
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BEN/ADM3/geoBoundaries-BEN-ADM3.geojson',
} as const;

const LOCAL_FILE_NAMES = {
  PAYS: 'geoBoundaries-BEN-ADM0.geojson',
  DEPARTMENT: 'geoBoundaries-BEN-ADM1.geojson',
  COMMUNE: 'geoBoundaries-BEN-ADM2.geojson',
  ARRONDISSEMENT: 'geoBoundaries-BEN-ADM3.geojson',
} as const;

// Corrections manuelles : nom source exact → nom exact (location_data_bj)
// NB: les '?' sont encodés en \u003F pour éviter les conflits de parsing TS.
const NAME_FIXES: Record<string, string> = {
  // ADM0
  'The Republic of Benin': 'BENIN',
  // ADM1
  Atakora: 'ATACORA',
  Kouffo: 'COUFFO',
  Atlanique: 'ATLANTIQUE',
  // ADM2
  'Akpo-Misserete': 'AKPRO-MISSERETE',
  Boukombe: 'BOUKOUMBE',
  Klouekanme: 'KLOUEKANMEY',
  Pehunco: 'OUASSA-PEHUNCO',
  'Seme-Kpodji': 'SEME-PODJI',
  // ADM3 (accents remplacés par '?' dans la source)
  'Tangbo-Dj\u003Fvi\u003F': 'TANGBO',
  'S\u003Fdj\u003F-D\u003Fnou': 'SEDJE-DENOU',
  'S\u003Fdj\u003F-Hou\u003Fgoudo': 'SEDJE-HOUEGOUDO',
  'Kpomass\u003F': 'KPOMASSE CENTRE',
  Bossito: 'TORI-BOSSITO',
  'Bemb\u003Fr\u003Fk\u003F': 'BEMBEREKE',
  'S\u003Fr\u003Fkal\u003F': 'SEREKALI',
  Djidja: 'DJIDJA CENTRE',
  Zagnanado: 'ZAGNANADO CENTRE',
  Zogbodomey: 'ZOGBODOMEY CENTRE',
  Totchangni: 'TOTCHANGNI CENTRE',
  'Ou\u003Fd\u003Fm\u003F-Adja': 'OUEDEME-ADJA',
  'Akpro-Miss\u003Fr\u003Ft\u003F': 'AKPRO-MISSERETE',
};

interface NamedGeometry {
  norm: string; // nom normalisé (avec ? conservés si présents)
  clean: string; // nom normalisé sans ?
  geometry: any;
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9?]/g, '');
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

// Wildcard : '?' dans le pattern matche n'importe quelle lettre
function wildcardMatch(pattern: string, str: string): boolean {
  if (pattern.length !== str.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== '?' && pattern[i] !== str[i]) return false;
  }
  return true;
}

function getFixtureName(p: any): string {
  const raw = p?.shapeName ?? p?.name ?? '';
  const fixed = NAME_FIXES[raw] ?? raw;
  return normalizeForMatch(fixed);
}

/**
 * Construit une structure de recherche de géométrie par nom.
 * Matching en cascade : exact → wildcard → fuzzy (Levenshtein ≤ 2).
 */
function buildGeometryLookup(
  geojson: any,
  bjNames: string[]
): { matches: number; get: (bjName: string) => any | undefined } {
  const items: NamedGeometry[] = (geojson?.features ?? [])
    .map((f: any) => {
      const norm = getFixtureName(f.properties);
      return {
        norm,
        clean: norm.replace(/\?/g, ''),
        geometry: f.geometry,
      };
    })
    .filter((it: NamedGeometry) => it.clean.length > 0);

  const exactMap = new Map<string, any>();
  for (const it of items) exactMap.set(it.clean, it.geometry);

  const bjClean = bjNames.map((n) => normalizeForMatch(n).replace(/\?/g, ''));
  const exactSet = new Set(bjClean);

  let matches = 0;

  function get(bjName: string): any | undefined {
    const n = normalizeForMatch(bjName);
    const clean = n.replace(/\?/g, '');

    // 1. Exact
    const exact = exactMap.get(clean);
    if (exact) return exact;

    // 2. Wildcard (un seul item source avec ? correspond à ce nom BJ)
    let wild: any;
    for (const it of items) {
      if (it.norm.includes('?') && wildcardMatch(it.norm, clean)) {
        wild = it.geometry;
        break;
      }
    }
    if (wild) return wild;

    // 3. Fuzzy (Levenshtein ≤ 2) — pour les accents manquants
    let bestDist = Infinity;
    let best: any;
    for (const it of items) {
      if (Math.abs(it.clean.length - clean.length) > 3) continue;
      const d = levenshtein(it.clean, clean);
      if (d < bestDist) {
        bestDist = d;
        best = it.geometry;
      }
    }
    if (best && bestDist <= 2) return best;

    return undefined;
  }

  // Compte les objets BJ qui trouveront une géométrie (approx)
  for (const n of bjClean) {
    if (exactSet.has(n)) matches++;
    else {
      const norm = n;
      const hasWild = items.some(
        (it) => it.norm.includes('?') && wildcardMatch(it.norm, norm)
      );
      if (hasWild) matches++;
      else {
        const found = items.some(
          (it) =>
            Math.abs(it.clean.length - norm.length) <= 3 &&
            levenshtein(it.clean, norm) <= 2
        );
        if (found) matches++;
      }
    }
  }

  return { matches, get };
}

async function loadGeoJson(level: keyof typeof GEOBOUNDARIES_URLS): Promise<any> {
  // 1. Source locale préférée (dossier src/data fourni par l'utilisateur)
  const localFile = path.join(LOCAL_DATA_DIR, LOCAL_FILE_NAMES[level]);
  if (fs.existsSync(localFile)) {
    console.log(`   📂 Source locale : ${LOCAL_FILE_NAMES[level]}`);
    return JSON.parse(fs.readFileSync(localFile, 'utf8'));
  }

  // 2. Cache
  const cacheFile = path.join(GEOJSON_CACHE_DIR, LOCAL_FILE_NAMES[level]);
  if (fs.existsSync(cacheFile)) {
    console.log(`   💾 Cache local : ${LOCAL_FILE_NAMES[level]}`);
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  // 3. Téléchargement
  const url = GEOBOUNDARIES_URLS[level];
  console.log(`   ⬇️  Téléchargement : ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  const json = await res.json();
  fs.mkdirSync(GEOJSON_CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(json));
  return json;
}

// Pas d'alias dans SELECT : syntaxe PostgreSQL stricte.
const GEOM_EXPR_DEP = `
  ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($5)), 4326),
  ST_PointOnSurface(ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($5)), 4326)),
  ST_Envelope(ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($5)), 4326))
`;

const GEOM_EXPR_TERR = `
  ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($6)), 4326),
  ST_PointOnSurface(ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($6)), 4326)),
  ST_Envelope(ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($6)), 4326))
`;

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Types de territoires (idempotent) ──────────────────────────────
    console.log('1. Types de territoires...');
    for (const tt of TERRITORY_TYPES) {
      await client.query(
        `INSERT INTO territory_types (code, name, hierarchy_level)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, hierarchy_level = EXCLUDED.hierarchy_level`,
        [tt.code, tt.name, tt.hierarchyLevel]
      );
    }
    const typeRes = await client.query<{ id: string; code: string }>(
      `SELECT id, code FROM territory_types WHERE code = ANY($1)`,
      [TERRITORY_TYPES.map((t) => t.code)]
    );
    const typeIds: Record<string, string> = {};
    for (const row of typeRes.rows) typeIds[row.code] = row.id;

    // ── 2. Charger attributs location_data_bj ─────────────────────────────
    const departments = departmentList();
    const towns = townsList();
    const districts = districtList();
    const neighborhoods = neighborhoodList();
    console.log(
      `2. Données location_data_bj : ${departments.length} depts, ${towns.length} communes, ${districts.length} arrondissements, ${neighborhoods.length} quartiers`
    );

    // ── 3. Charger les shapes GeoBoundaries (local → cache → download) ────
    console.log('3. Chargement des shapes GeoBoundaries...');
    const shapeADM0 = await loadGeoJson('PAYS');
    const shapeADM1 = await loadGeoJson('DEPARTMENT');
    const shapeADM2 = await loadGeoJson('COMMUNE');
    const shapeADM3 = await loadGeoJson('ARRONDISSEMENT');

    const geomByType = {
      PAYS: buildGeometryLookup(shapeADM0, ['BENIN']),
      DEPARTMENT: buildGeometryLookup(shapeADM1, departments.map((d) => d.name)),
      COMMUNE: buildGeometryLookup(shapeADM2, towns.map((t) => t.name)),
      ARRONDISSEMENT: buildGeometryLookup(shapeADM3, districts.map((d) => d.name)),
    };
    console.log(
      `   Shapes : ${shapeADM0.features.length} ADM0, ${shapeADM1.features.length} ADM1, ${shapeADM2.features.length} ADM2, ${shapeADM3.features.length} ADM3`
    );
    console.log(
      `   Matching : ${geomByType.PAYS.matches}/1 pays, ${geomByType.DEPARTMENT.matches}/${departments.length} depts, ${geomByType.COMMUNE.matches}/${towns.length} communes, ${geomByType.ARRONDISSEMENT.matches}/${districts.length} arrondissements`
    );

    // ── 4. Pays (racine unique) ────────────────────────────────────────────
    console.log('4. Insertion du pays (Bénin)...');
    const bjGeometry = geomByType.PAYS.get('BENIN');
    const paysRes = await client.query<{ id: string }>(
      `INSERT INTO territories (territory_type_id, parent_territory_id, code, name, status, metadata,
                                geometry, centroid, bbox)
       SELECT $1, NULL, $2, $3, 'ACTIVE', $4,
              ${bjGeometry ? GEOM_EXPR_DEP : 'NULL, NULL, NULL'}
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name,
         geometry = COALESCE(EXCLUDED.geometry, territories.geometry),
         centroid = COALESCE(EXCLUDED.centroid, territories.centroid),
         bbox = COALESCE(EXCLUDED.bbox, territories.bbox)
       RETURNING id`,
      [
        typeIds['PAYS'],
        `${CODE_PREFIX.PAYS}-BJ`,
        'BENIN',
        JSON.stringify({ source: 'geoboundaries', level: 'PAYS' }),
        ...(bjGeometry ? [JSON.stringify(bjGeometry)] : []),
      ]
    );
    const bjId = paysRes.rows[0].id;
    console.log(`   ${bjGeometry ? 1 : 0}/1 pays avec géométrie (id ${bjId})`);

    // ── 5. Départements (parent = Bénin) ───────────────────────────────────
    console.log('5. Insertion des départements...');
    const departmentIds = new Map<string, string>();
    let depGeom = 0;
    for (const dept of departments) {
      const geometry = geomByType.DEPARTMENT.get(dept.name);
      const res = await client.query<{ id: string }>(
        `INSERT INTO territories (territory_type_id, parent_territory_id, code, name, status, metadata,
                                  geometry, centroid, bbox)
         SELECT $1, $2, $3, $4, 'ACTIVE', $5,
                ${geometry ? GEOM_EXPR_TERR : 'NULL, NULL, NULL'}
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, parent_territory_id = EXCLUDED.parent_territory_id,
           geometry = COALESCE(EXCLUDED.geometry, territories.geometry),
           centroid = COALESCE(EXCLUDED.centroid, territories.centroid),
           bbox = COALESCE(EXCLUDED.bbox, territories.bbox)
         RETURNING id`,
        [
          typeIds['DEPARTMENT'],
          bjId,
          `${CODE_PREFIX.DEPARTMENT}-${dept.code}`,
          dept.name,
          JSON.stringify({ source: 'location_data_bj + geoboundaries', level: 'DEPARTMENT' }),
          ...(geometry ? [JSON.stringify(geometry)] : []),
        ]
      );
      departmentIds.set(dept.code, res.rows[0].id);
      if (geometry) depGeom++;
    }
    console.log(`   ${depGeom}/${departments.length} départements avec géométrie`);

    // ── 6. Communes (parent = département) ─────────────────────────────────
    console.log('6. Insertion des communes...');
    const townIds = new Map<string, string>();
    let townGeom = 0;
    for (const town of towns) {
      const parentId = departmentIds.get(town.department_code);
      if (!parentId) {
        console.warn(`   ⚠️  Commune "${town.name}" : département "${town.department_code}" introuvable`);
        continue;
      }
      const geometry = geomByType.COMMUNE.get(town.name);
      const res = await client.query<{ id: string }>(
        `INSERT INTO territories (territory_type_id, parent_territory_id, code, name, status, metadata,
                                  geometry, centroid, bbox)
         SELECT $1, $2, $3, $4, 'ACTIVE', $5,
                ${geometry ? GEOM_EXPR_TERR : 'NULL, NULL, NULL'}
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, parent_territory_id = EXCLUDED.parent_territory_id,
           geometry = COALESCE(EXCLUDED.geometry, territories.geometry),
           centroid = COALESCE(EXCLUDED.centroid, territories.centroid),
           bbox = COALESCE(EXCLUDED.bbox, territories.bbox)
         RETURNING id`,
        [
          typeIds['COMMUNE'],
          parentId,
          `${CODE_PREFIX.COMMUNE}-${town.code}`,
          town.name,
          JSON.stringify({ source: 'location_data_bj + geoboundaries', level: 'COMMUNE' }),
          ...(geometry ? [JSON.stringify(geometry)] : []),
        ]
      );
      townIds.set(town.code, res.rows[0].id);
      if (geometry) townGeom++;
    }
    console.log(`   ${townGeom}/${towns.length} communes avec géométrie`);

    // ── 7. Arrondissements (parent = commune) ──────────────────────────────
    console.log('7. Insertion des arrondissements...');
    const districtIds = new Map<string, string>();
    let distGeom = 0;
    for (const district of districts) {
      const parentId = townIds.get(district.town_code);
      if (!parentId) {
        console.warn(`   ⚠️  Arrondissement "${district.name}" : commune "${district.town_code}" introuvable`);
        continue;
      }
      const geometry = geomByType.ARRONDISSEMENT.get(district.name);
      const res = await client.query<{ id: string }>(
        `INSERT INTO territories (territory_type_id, parent_territory_id, code, name, status, metadata,
                                  geometry, centroid, bbox)
         SELECT $1, $2, $3, $4, 'ACTIVE', $5,
                ${geometry ? GEOM_EXPR_TERR : 'NULL, NULL, NULL'}
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, parent_territory_id = EXCLUDED.parent_territory_id,
           geometry = COALESCE(EXCLUDED.geometry, territories.geometry),
           centroid = COALESCE(EXCLUDED.centroid, territories.centroid),
           bbox = COALESCE(EXCLUDED.bbox, territories.bbox)
         RETURNING id`,
        [
          typeIds['ARRONDISSEMENT'],
          parentId,
          `${CODE_PREFIX.ARRONDISSEMENT}-${district.code}`,
          district.name,
          JSON.stringify({ source: 'location_data_bj + geoboundaries', level: 'ARRONDISSEMENT' }),
          ...(geometry ? [JSON.stringify(geometry)] : []),
        ]
      );
      districtIds.set(district.code, res.rows[0].id);
      if (geometry) distGeom++;
    }
    console.log(`   ${distGeom}/${districts.length} arrondissements avec géométrie`);

    // ── 8. Quartiers/villages (parent = arrondissement) ────────────────────
    console.log('8. Insertion des quartiers/villages...');
    let inserted = 0;
    for (const neighborhood of neighborhoods) {
      const parentId = districtIds.get(neighborhood.district_code);
      if (!parentId) {
        continue;
      }
      await client.query(
        `INSERT INTO territories (territory_type_id, parent_territory_id, code, name, status, metadata)
         VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, parent_territory_id = EXCLUDED.parent_territory_id`,
        [
          typeIds['QUARTIER'],
          parentId,
          `${CODE_PREFIX.QUARTIER}-${neighborhood.code}`,
          neighborhood.name,
          JSON.stringify({ source: 'location_data_bj', level: 'QUARTIER' }),
        ]
      );
      inserted++;
    }

    await client.query('COMMIT');

    console.log('\n✅ Seed des territoires terminé !');
    console.log('──────────────────────────────────────────────');
    console.log(`   Départements     : ${departments.length} (${depGeom} geom)`);
    console.log(`   Communes         : ${towns.length} (${townGeom} geom)`);
    console.log(`   Arrondissements  : ${districts.length} (${distGeom} geom)`);
    console.log(`   Quartiers        : ${inserted}`);
    console.log('──────────────────────────────────────────────');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du seed des territoires :', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();