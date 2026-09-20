/*
 * SEED TERRITOIRES — Bénin (4 niveaux administratifs)
 * ─────────────────────────────────────────────────────────────────────
 * Insère les données dans les 4 tables explicites :
 *   regions → municipalities → districts → neighborhoods
 *
 * Source attributs : package `location_data_bj`
 * Source géométries : GeoBoundaries (local → cache → téléchargement)
 *
 * Codes préfixés : BJ-DEP-, BJ-TWN-, BJ-DIS-, BJ-NGH-
 * Idempotent (ON CONFLICT DO UPDATE). Usage : npm run seed:territory
 */
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import {
  departmentList,
  townsList,
  districtList,
  neighborhoodList,
} from 'location_data_bj';

const CODE_PREFIX = {
  DEPARTMENT: 'BJ-DEP',
  COMMUNE: 'BJ-TWN',
  ARRONDISSEMENT: 'BJ-DIS',
  QUARTIER: 'BJ-NGH',
} as const;

// ── Sources GeoBoundaries ─────────────────────────────────────────────────────
const LOCAL_DATA_DIR = path.join(__dirname, '..', '..', 'data');
const GEOJSON_CACHE_DIR = path.join(__dirname, 'data');

const GEOBOUNDARIES_URLS = {
  DEPARTMENT:
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BEN/ADM1/geoBoundaries-BEN-ADM1.geojson',
  COMMUNE:
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BEN/ADM2/geoBoundaries-BEN-ADM2.geojson',
  ARRONDISSEMENT:
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BEN/ADM3/geoBoundaries-BEN-ADM3.geojson',
} as const;

const LOCAL_FILE_NAMES = {
  DEPARTMENT: 'geoBoundaries-BEN-ADM1.geojson',
  COMMUNE: 'geoBoundaries-BEN-ADM2.geojson',
  ARRONDISSEMENT: 'geoBoundaries-BEN-ADM3.geojson',
} as const;

// Corrections manuelles de noms
const NAME_FIXES: Record<string, string> = {
  Atakora: 'ATACORA',
  Kouffo: 'COUFFO',
  Atlanique: 'ATLANTIQUE',
  'Akpo-Misserete': 'AKPRO-MISSERETE',
  Boukombe: 'BOUKOUMBE',
  Klouekanme: 'KLOUEKANMEY',
  Pehunco: 'OUASSA-PEHUNCO',
  'Seme-Kpodji': 'SEME-PODJI',
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
  norm: string;
  clean: string;
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

    const exact = exactMap.get(clean);
    if (exact) return exact;

    let wild: any;
    for (const it of items) {
      if (it.norm.includes('?') && wildcardMatch(it.norm, clean)) {
        wild = it.geometry;
        break;
      }
    }
    if (wild) return wild;

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

  for (const n of bjClean) {
    if (exactSet.has(n)) matches++;
    else {
      const hasWild = items.some(
        (it) => it.norm.includes('?') && wildcardMatch(it.norm, n)
      );
      if (hasWild) matches++;
      else {
        const found = items.some(
          (it) =>
            Math.abs(it.clean.length - n.length) <= 3 &&
            levenshtein(it.clean, n) <= 2
        );
        if (found) matches++;
      }
    }
  }

  return { matches, get };
}

async function loadGeoJson(level: keyof typeof GEOBOUNDARIES_URLS): Promise<any> {
  const localFile = path.join(LOCAL_DATA_DIR, LOCAL_FILE_NAMES[level]);
  if (fs.existsSync(localFile)) {
    console.log(`   📂 Source locale : ${LOCAL_FILE_NAMES[level]}`);
    return JSON.parse(fs.readFileSync(localFile, 'utf8'));
  }

  const cacheFile = path.join(GEOJSON_CACHE_DIR, LOCAL_FILE_NAMES[level]);
  if (fs.existsSync(cacheFile)) {
    console.log(`   💾 Cache local : ${LOCAL_FILE_NAMES[level]}`);
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  const url = GEOBOUNDARIES_URLS[level];
  console.log(`   ⬇️  Téléchargement : ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  const json = await res.json();
  fs.mkdirSync(GEOJSON_CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(json));
  return json;
}

/**
 * Seed des territoires du Bénin dans les tables explicites :
 * regions, municipalities, districts, neighborhoods.
 * Idempotent (ON CONFLICT DO UPDATE).
 */
export async function seedTerritories(pool?: Pool): Promise<void> {
  const ownPool = !pool;
  const localPool = pool ?? new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const client = await localPool.connect();

  try {
    // ── Garde idempotente ─────────────────────────────────────────────────
    const check = await client.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM regions WHERE code LIKE 'BJ-DEP-%'`
    );
    const existing = parseInt(check.rows[0]?.count ?? '0', 10);
    if (existing > 0) {
      console.log(`⏩ Seed territoires ignoré — ${existing} région(s) déjà en base.`);
      return;
    }

    await client.query('BEGIN');

    // ── 1. Données location_data_bj ───────────────────────────────────────
    const departments = departmentList();
    const towns = townsList();
    const districts = districtList();
    const neighborhoods = neighborhoodList();
    console.log(
      `1. Données location_data_bj : ${departments.length} depts, ${towns.length} communes, ${districts.length} arrondissements, ${neighborhoods.length} quartiers`
    );

    // ── 2. Charger les shapes GeoBoundaries ──────────────────────────────
    console.log('2. Chargement des shapes GeoBoundaries...');
    const shapeADM1 = await loadGeoJson('DEPARTMENT');
    const shapeADM2 = await loadGeoJson('COMMUNE');
    const shapeADM3 = await loadGeoJson('ARRONDISSEMENT');

    const geomByType = {
      DEPARTMENT: buildGeometryLookup(shapeADM1, departments.map((d) => d.name)),
      COMMUNE: buildGeometryLookup(shapeADM2, towns.map((t) => t.name)),
      ARRONDISSEMENT: buildGeometryLookup(shapeADM3, districts.map((d) => d.name)),
    };
    console.log(
      `   Matching : ${geomByType.DEPARTMENT.matches}/${departments.length} depts, ${geomByType.COMMUNE.matches}/${towns.length} communes, ${geomByType.ARRONDISSEMENT.matches}/${districts.length} arrondissements`
    );

    // ── 3. Régions (Départements) ─────────────────────────────────────────
    console.log('3. Insertion des régions (départements)...');
    const regionIds = new Map<string, string>();
    let depGeom = 0;
    for (const dept of departments) {
      const geometry = geomByType.DEPARTMENT.get(dept.name);
      const code = `${CODE_PREFIX.DEPARTMENT}-${dept.code}`;
      const res = await client.query<{ id: string }>(
        `INSERT INTO regions (code, name${geometry ? ', geometry' : ''})
         VALUES ($1, $2${geometry ? ', ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($3)), 4326)' : ''})
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
           ${geometry ? ', geometry = COALESCE(EXCLUDED.geometry, regions.geometry)' : ''}
         RETURNING id`,
        geometry
          ? [code, dept.name, JSON.stringify(geometry)]
          : [code, dept.name]
      );
      regionIds.set(dept.code, res.rows[0].id);
      if (geometry) depGeom++;
    }
    console.log(`   ${depGeom}/${departments.length} régions avec géométrie`);

    // ── 4. Communes (Municipalities) ──────────────────────────────────────
    console.log('4. Insertion des communes...');
    const municipalityIds = new Map<string, string>();
    let townGeom = 0;
    for (const town of towns) {
      const regionId = regionIds.get(town.department_code);
      if (!regionId) {
        console.warn(`   ⚠️  Commune "${town.name}" : département "${town.department_code}" introuvable`);
        continue;
      }
      const geometry = geomByType.COMMUNE.get(town.name);
      const code = `${CODE_PREFIX.COMMUNE}-${town.code}`;
      const res = await client.query<{ id: string }>(
        `INSERT INTO municipalities (region_id, code, name${geometry ? ', geometry' : ''})
         VALUES ($1, $2, $3${geometry ? ', ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($4)), 4326)' : ''})
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, region_id = EXCLUDED.region_id
           ${geometry ? ', geometry = COALESCE(EXCLUDED.geometry, municipalities.geometry)' : ''}
         RETURNING id`,
        geometry
          ? [regionId, code, town.name, JSON.stringify(geometry)]
          : [regionId, code, town.name]
      );
      municipalityIds.set(town.code, res.rows[0].id);
      if (geometry) townGeom++;
    }
    console.log(`   ${townGeom}/${towns.length} communes avec géométrie`);

    // ── 5. Arrondissements (Districts) ────────────────────────────────────
    console.log('5. Insertion des arrondissements...');
    const districtIds = new Map<string, string>();
    let distGeom = 0;
    for (const district of districts) {
      const municipalityId = municipalityIds.get(district.town_code);
      if (!municipalityId) {
        console.warn(`   ⚠️  Arrondissement "${district.name}" : commune "${district.town_code}" introuvable`);
        continue;
      }
      const geometry = geomByType.ARRONDISSEMENT.get(district.name);
      const code = `${CODE_PREFIX.ARRONDISSEMENT}-${district.code}`;
      // Upsert : vérifie si le code existe déjà dans n'importe quelle commune
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM districts WHERE code = $1 LIMIT 1`,
        [code]
      );
      let districtDbId: string;
      if (existing.rowCount && existing.rowCount > 0) {
        districtDbId = existing.rows[0].id;
      } else {
        const res = await client.query<{ id: string }>(
          `INSERT INTO districts (municipality_id, code, name${geometry ? ', geometry' : ''})
           VALUES ($1, $2, $3${geometry ? ', ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($4)), 4326)' : ''})
           RETURNING id`,
          geometry
            ? [municipalityId, code, district.name, JSON.stringify(geometry)]
            : [municipalityId, code, district.name]
        );
        districtDbId = res.rows[0].id;
      }
      if (geometry) distGeom++;
      districtIds.set(district.code, districtDbId); // ← fix : nécessaire pour le seed des quartiers
    }
    console.log(`   ${distGeom}/${districts.length} arrondissements avec géométrie`);

    // ── 6. Quartiers/Villages (Neighborhoods) ─────────────────────────────
    console.log('6. Insertion des quartiers/villages...');
    let inserted = 0;
    for (const neighborhood of neighborhoods) {
      const districtId = districtIds.get(neighborhood.district_code);
      if (!districtId) continue;
      const code = `${CODE_PREFIX.QUARTIER}-${neighborhood.code}`;
      // Insère seulement si n'existe pas déjà
      const existingNgh = await client.query<{ id: string }>(
        `SELECT id FROM neighborhoods WHERE code = $1 LIMIT 1`,
        [code]
      );
      if (!existingNgh.rowCount || existingNgh.rowCount === 0) {
        await client.query(
          `INSERT INTO neighborhoods (district_id, code, name)
           VALUES ($1, $2, $3)`,
          [districtId, code, neighborhood.name]
        );
        inserted++;
      }
    }

    await client.query('COMMIT');

    console.log('\n✅ Seed des territoires terminé !');
    console.log('──────────────────────────────────────────────');
    console.log(`   Régions (depts)  : ${departments.length} (${depGeom} geom)`);
    console.log(`   Communes         : ${towns.length} (${townGeom} geom)`);
    console.log(`   Arrondissements  : ${districts.length} (${distGeom} geom)`);
    console.log(`   Quartiers        : ${inserted}`);
    console.log('──────────────────────────────────────────────');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du seed des territoires :', error.message);
    throw error;
  } finally {
    client.release();
    if (ownPool) await localPool.end();
  }
}

// ── Entrée CLI directe (npm run seed:territory) ───────────────────────────────
if (require.main === module) {
  import('dotenv/config').then(() =>
    seedTerritories().catch((e) => {
      console.error(e);
      process.exit(1);
    })
  );
}