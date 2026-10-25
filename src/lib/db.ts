import type { SQLiteDatabase } from 'expo-sqlite';
import type { Plan } from './types';

// Az óravázlatok az eszközön, SQLite-ban tárolódnak. Egy sor = egy óravázlat;
// a szerkezet (szakaszok, pózok) JSON-ként van a `data` oszlopban, így a
// formátum bővítése nem igényel táblamódosítást.

export const DB_NAME = 'jogapp.db';
const SCHEMA_VERSION = 1;

export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const v = row?.user_version ?? 0;
  if (v < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }
  if (v < SCHEMA_VERSION) await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

/** Régebbi mentésekből hiányzó mezők pótlása. */
function normalize(p: Partial<Plan> & { id: string }): Plan {
  return {
    title: '',
    theme: '',
    level: 0,
    durationMin: null,
    tags: [],
    conditions: [],
    notes: '',
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...p,
  } as Plan;
}

export async function listPlans(db: SQLiteDatabase): Promise<Plan[]> {
  const rows = await db.getAllAsync<{ data: string }>('SELECT data FROM plans ORDER BY updated_at DESC');
  return rows.map((r) => normalize(JSON.parse(r.data)));
}

export async function getPlan(db: SQLiteDatabase, id: string): Promise<Plan | null> {
  const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM plans WHERE id = ?', id);
  return row ? normalize(JSON.parse(row.data)) : null;
}

// Az írások sorban futnak, hogy a gyors egymás utáni mentések ne előzzék
// meg egymást (pl. gépelés közben, vagy ha egy másik képernyő ad hozzá pózt).
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

export function savePlan(db: SQLiteDatabase, plan: Plan): Promise<Plan> {
  return serial(async () => {
    const p = { ...plan, updatedAt: new Date().toISOString() };
    await db.runAsync(
      `INSERT INTO plans (id, title, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, data = excluded.data, updated_at = excluded.updated_at`,
      p.id, p.title, JSON.stringify(p), p.createdAt, p.updatedAt,
    );
    return p;
  });
}

/** Olvasás–módosítás–írás egy lépésben, a mentési sorban. */
export function modifyPlan(db: SQLiteDatabase, id: string, f: (p: Plan) => Plan): Promise<Plan | null> {
  return serial(async () => {
    const cur = await getPlan(db, id);
    if (!cur) return null;
    const p = { ...f(cur), updatedAt: new Date().toISOString() };
    await db.runAsync('UPDATE plans SET title = ?, data = ?, updated_at = ? WHERE id = ?',
      p.title, JSON.stringify(p), p.updatedAt, p.id);
    return p;
  });
}

export function deletePlan(db: SQLiteDatabase, id: string): Promise<void> {
  return serial(async () => {
    await db.runAsync('DELETE FROM plans WHERE id = ?', id);
  });
}
