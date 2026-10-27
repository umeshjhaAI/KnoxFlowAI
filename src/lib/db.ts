import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "knoxflow.db");

let db: SqlJsDatabase | null = null;
let SqlMod: any = null;

async function getSqlMod() {
  if (!SqlMod) SqlMod = await initSqlJs();
  return SqlMod;
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (!db) {
    const SQL = await getSqlMod();
    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buf);
    } else {
      db = new SQL.Database();
    }
    db.run("PRAGMA foreign_keys = ON");
  }
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Thin wrapper that mimics better-sqlite3's Statement API enough for our usage
class Statement {
  private db: SqlJsDatabase;
  private sql: string;

  constructor(db: SqlJsDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  all(...params: any[]): any[] {
    const bound = bindParams(this.sql, params);
    try {
      const results = this.db.exec(bound);
      if (!results.length) return [];
      const { columns, values } = results[0];
      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
      });
    } catch (e) {
      console.error("SQL error:", e, "SQL:", bound);
      throw e;
    }
  }

  get(...params: any[]): any {
    const rows = this.all(...params);
    return rows.length > 0 ? rows[0] : undefined;
  }

  run(...params: any[]): { changes: number; lastInsertRowid: number } {
    const bound = bindParams(this.sql, params);
    try {
      this.db.run(bound);
      saveDb();
      const lastId = this.db.exec("SELECT last_insert_rowid() as id");
      const id = lastId.length > 0 ? (lastId[0].values[0][0] as number) : 0;
      return { changes: this.db.getRowsModified(), lastInsertRowid: id };
    } catch (e) {
      console.error("SQL error:", e, "SQL:", bound);
      throw e;
    }
  }
}

function bindParams(sql: string, params: any[]): string {
  if (!params.length) return sql;
  let idx = 0;
  return sql.replace(/\?/g, () => {
    const val = params[idx++];
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number") return String(val);
    // Escape single quotes
    return `'${String(val).replace(/'/g, "''")}'`;
  });
}

export function rawExec(sql: string, ...params: any[]): void {
  const bound = bindParams(sql, params);
  db!.run(bound);
  saveDb();
}

export function prepare(sql: string): Statement {
  if (!db) throw new Error("Database not initialized");
  return new Statement(db, sql);
}

export async function initDb(): Promise<void> {
  const d = await getDb();
  d.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'Consultant',
      skills TEXT DEFAULT '[]',
      avatar TEXT DEFAULT '',
      on_leave INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  d.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      received_at TEXT DEFAULT (datetime('now')),
      has_reply INTEGER DEFAULT 0,
      reply_type TEXT DEFAULT 'none',
      reply_draft TEXT DEFAULT ''
    )
  `);
  d.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      email_id INTEGER,
      assignee_id INTEGER,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'New',
      due_date TEXT DEFAULT (datetime('now', '+7 days')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  d.run(`
    CREATE TABLE IF NOT EXISTS resolutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      solution TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  saveDb();
}