import { MOCK_USERS, MOCK_GROUPS, MOCK_CONNECTORS, MOCK_HCPS, MOCK_RULES, DEFAULT_ATTRIBUTES } from "../constants";

// Types for global libraries loaded via CDN
declare global {
    interface Window {
        initSqlJs: (config: any) => Promise<any>;
        localforage: any;
    }
}

class DatabaseService {
    private db: any = null;
    private initialized: boolean = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.initPromise = this.init();
    }

    async init() {
        if (this.initialized) return;

        try {
            console.log("Initializing SQLite...");
            const SQL = await window.initSqlJs({
                locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });

            // Try loading from IndexedDB
            const savedDb = await window.localforage.getItem('behaviour_sqlite_db');
            
            if (savedDb) {
                this.db = new SQL.Database(new Uint8Array(savedDb));
                console.log("Loaded database from persistence.");
                
                // DATA MIGRATION CHECK:
                // Check if 'hcps' table has 'id' column. If not (it has 'npi'), we need to rebuild the DB.
                try {
                   this.db.exec("SELECT id FROM hcps LIMIT 1");
                } catch (e) {
                   console.warn("Detected old schema (hcps missing 'id' column). Re-seeding database.");
                   this.db = new SQL.Database(); // Reset to new in-memory DB
                   this.seedDatabase();
                }

            } else {
                this.db = new SQL.Database();
                console.log("Created new in-memory database.");
                this.seedDatabase();
            }

            this.initialized = true;
            // Auto-save on window unload
            window.addEventListener('beforeunload', () => this.saveToDisk());
        } catch (err) {
            console.error("Failed to initialize SQLite:", err);
            // Fallback: create fresh in-memory if loading failed
            try {
                const SQL = await window.initSqlJs({
                     locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
                });
                this.db = new SQL.Database();
                this.seedDatabase();
                this.initialized = true;
            } catch (fallbackErr) {
                console.error("Critical Failure: Could not initialize SQLite fallback", fallbackErr);
            }
        }
    }

    private seedDatabase() {
        // Drop tables if they exist to ensure clean schema (generic 'id' column)
        const tableNames = ['users', 'groups', 'connectors', 'hcps', 'rules', 'settings', 'attributes', 'links'];
        tableNames.forEach(t => this.db.run(`DROP TABLE IF EXISTS ${t}`));

        // Create tables - ALL using 'id' as primary key column for consistency
        const tables = [
            `CREATE TABLE users (id TEXT PRIMARY KEY, data TEXT);`,
            `CREATE TABLE groups (id TEXT PRIMARY KEY, data TEXT);`,
            `CREATE TABLE connectors (id TEXT PRIMARY KEY, data TEXT);`,
            `CREATE TABLE hcps (id TEXT PRIMARY KEY, data TEXT);`, 
            `CREATE TABLE rules (id TEXT PRIMARY KEY, data TEXT);`,
            `CREATE TABLE settings (id TEXT PRIMARY KEY, data TEXT);`,
            `CREATE TABLE attributes (id TEXT PRIMARY KEY, data TEXT);`,
            `CREATE TABLE links (id TEXT PRIMARY KEY, data TEXT);`
        ];

        tables.forEach(sql => this.db.run(sql));

        // Seed default data if empty (using MOCK data as seed)
        this.bulkInsert('users', MOCK_USERS);
        this.bulkInsert('groups', MOCK_GROUPS);
        this.bulkInsert('connectors', MOCK_CONNECTORS);
        // Map NPI to ID
        this.bulkInsert('hcps', MOCK_HCPS.map(h => ({ ...h, id: h.npi }))); 
        this.bulkInsert('rules', MOCK_RULES);
        // Map Key to ID
        this.bulkInsert('attributes', DEFAULT_ATTRIBUTES.map(a => ({ ...a, id: a.key })));
        
        // Settings
        const defaultSettings = {
            llmConfig: { mode: 'direct', agentEndpoint: '', location: 'us-central1' },
            tracingConfig: { provider: 'none', sampleRate: 1.0 }
        };
        this.upsert('settings', { id: 'system_settings', ...defaultSettings });

        this.saveToDisk();
    }

    // --- Core Operations ---

    async saveToDisk() {
        if (!this.db) return;
        try {
            const data = this.db.export();
            await window.localforage.setItem('behaviour_sqlite_db', data);
        } catch (e) {
            console.warn("Failed to save DB to disk", e);
        }
    }

    private bulkInsert(table: string, items: any[]) {
        try {
            const stmt = this.db.prepare(`INSERT OR IGNORE INTO ${table} (id, data) VALUES (?, ?)`);
            for (const item of items) {
                // Normalize ID: prefer 'id', fallback to 'npi' or 'key'
                const id = item.id || item.npi || item.key;
                if (id) {
                    stmt.run([id, JSON.stringify(item)]);
                }
            }
            stmt.free();
        } catch (e) {
            console.error(`Error bulk inserting into ${table}:`, e);
        }
    }

    async getAll(table: string): Promise<any[]> {
        await this.initPromise;
        if (!this.db) return [];
        try {
            const result = this.db.exec(`SELECT data FROM ${table}`);
            if (!result.length) return [];
            return result[0].values.map((v: any[]) => JSON.parse(v[0]));
        } catch (e) {
            console.error(`Error fetching from ${table}:`, e);
            return [];
        }
    }

    async getById(table: string, id: string): Promise<any | null> {
        await this.initPromise;
        if (!this.db) return null;
        try {
            const stmt = this.db.prepare(`SELECT data FROM ${table} WHERE id = ?`);
            stmt.bind([id]);
            if (stmt.step()) {
                const data = JSON.parse(stmt.get()[0]);
                stmt.free();
                return data;
            }
            stmt.free();
            return null;
        } catch (e) {
            console.error(`Error fetching by id from ${table}:`, e);
            return null;
        }
    }

    async upsert(table: string, item: any) {
        await this.initPromise;
        if (!this.db) return;
        try {
            // Normalize ID
            const id = item.id || item.npi || item.key;
            if (!id) {
                console.error("Cannot upsert item without id/npi/key", item);
                return;
            }
            
            // Ensure the item stored in JSON also has the normalized ID property if needed, 
            // but usually keeping the original object structure is preferred.
            // We just use 'id' column for lookup.
            
            this.db.run(`INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`, [id, JSON.stringify(item)]);
            this.saveToDisk();
        } catch (e) {
            console.error(`Error upserting into ${table}:`, e);
        }
    }

    async delete(table: string, id: string) {
        await this.initPromise;
        if (!this.db) return;
        try {
            this.db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
            this.saveToDisk();
        } catch (e) {
            console.error(`Error deleting from ${table}:`, e);
        }
    }

    // --- Import / Export ---

    async exportFullState(): Promise<string> {
        await this.initPromise;
        if (!this.db) return "{}";
        
        const tables = ['users', 'groups', 'connectors', 'hcps', 'rules', 'settings', 'attributes', 'links'];
        const dump: Record<string, any[]> = {};
        
        for (const table of tables) {
            dump[table] = await this.getAll(table);
        }
        return JSON.stringify(dump, null, 2);
    }

    async importFullState(json: string): Promise<void> {
        await this.initPromise;
        if (!this.db) return;

        try {
            const dump = JSON.parse(json);
            const tables = ['users', 'groups', 'connectors', 'hcps', 'rules', 'settings', 'attributes', 'links'];
            
            // Transactional update
            this.db.run("BEGIN TRANSACTION");
            
            for (const table of tables) {
                if (Array.isArray(dump[table])) {
                    this.db.run(`DELETE FROM ${table}`);
                    const stmt = this.db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`);
                    for (const item of dump[table]) {
                        const id = item.id || item.npi || item.key;
                        if (id) stmt.run([id, JSON.stringify(item)]);
                    }
                    stmt.free();
                }
            }
            
            this.db.run("COMMIT");
            this.saveToDisk();
            console.log("Database imported successfully.");
        } catch (e) {
            this.db.run("ROLLBACK");
            console.error("Import failed", e);
            throw e;
        }
    }
}

export const dbService = new DatabaseService();