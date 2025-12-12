
import { MOCK_USERS, MOCK_GROUPS, MOCK_CONNECTORS, MOCK_HCPS, MOCK_RULES, DEFAULT_ATTRIBUTES } from "../constants";

// Types for global libraries loaded via CDN
declare global {
    interface Window {
        initSqlJs: (config: any) => Promise<any>;
        localforage: any;
    }
}

type StorageMode = 'local' | 'remote';

class DatabaseService {
    private db: any = null;
    private initialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    // UPDATED: Default to remote to use the Node.js backend on port 3001
    private mode: StorageMode = 'remote';
    private apiBaseUrl: string = 'http://localhost:3001/api';

    constructor() {
        this.initPromise = this.init();
    }

    async init() {
        if (this.initialized) return;

        // Load preferred mode
        try {
            const savedMode = await window.localforage.getItem('behaviour_storage_mode');
            if (savedMode) this.mode = savedMode as StorageMode;
            
            const savedUrl = await window.localforage.getItem('behaviour_api_url');
            if (savedUrl) this.apiBaseUrl = savedUrl;
        } catch (e) {
            console.warn("Could not load storage preference", e);
        }

        if (this.mode === 'local') {
            await this.initLocalDb();
        } else {
            console.log(`Initialized in Remote API mode: ${this.apiBaseUrl}`);
            try {
                 // Check connectivity by fetching users
                 const users = await this.getAll('users');
                 // If remote is empty (fresh server), seed it with mocks for a better DX
                 if (users.length === 0) {
                     console.log("Remote DB appears empty. Seeding default data...");
                     await this.seedRemote();
                 }
            } catch (e) {
                console.warn("Backend connection failed. Please ensure 'backend/server.ts' is running on port 3001.");
            }
        }

        this.initialized = true;
    }

    private async initLocalDb() {
        try {
            console.log("Initializing SQLite (Local)...");
            const SQL = await window.initSqlJs({
                locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });

            const savedDb = await window.localforage.getItem('behaviour_sqlite_db');
            
            if (savedDb) {
                this.db = new SQL.Database(new Uint8Array(savedDb));
                console.log("Loaded database from persistence.");
                try {
                   this.db.exec("SELECT id FROM hcps LIMIT 1");
                } catch (e) {
                   console.warn("Detected old schema. Re-seeding database.");
                   this.db = new SQL.Database();
                   this.seedLocalDatabase();
                }
            } else {
                this.db = new SQL.Database();
                console.log("Created new in-memory database.");
                this.seedLocalDatabase();
            }

            window.addEventListener('beforeunload', () => this.saveToDisk());
        } catch (err) {
            console.error("Failed to initialize SQLite:", err);
            try {
                // Retry fallback
                const SQL = await window.initSqlJs({ locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`});
                this.db = new SQL.Database();
                this.seedLocalDatabase();
            } catch (fallbackErr) {
                console.error("Critical Failure: Could not initialize SQLite fallback", fallbackErr);
            }
        }
    }

    private seedLocalDatabase() {
        const tableNames = ['users', 'groups', 'connectors', 'hcps', 'rules', 'settings', 'attributes', 'links'];
        tableNames.forEach(t => this.db.run(`DROP TABLE IF EXISTS ${t}`));

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

        this.bulkInsertLocal('users', MOCK_USERS);
        this.bulkInsertLocal('groups', MOCK_GROUPS);
        this.bulkInsertLocal('connectors', MOCK_CONNECTORS);
        this.bulkInsertLocal('hcps', MOCK_HCPS.map(h => ({ ...h, id: h.npi }))); 
        this.bulkInsertLocal('rules', MOCK_RULES);
        this.bulkInsertLocal('attributes', DEFAULT_ATTRIBUTES.map(a => ({ ...a, id: a.key })));
        
        const defaultSettings = {
            llmConfig: { mode: 'direct', agentEndpoint: '', location: 'us-central1' },
            tracingConfig: { provider: 'none', sampleRate: 1.0 }
        };
        this.upsertLocal('settings', { id: 'system_settings', ...defaultSettings });

        this.saveToDisk();
    }

    private async seedRemote() {
        // Sequentially upsert mocks to backend to avoid overwhelming parallel requests
        for (const u of MOCK_USERS) await this.upsert('users', u);
        for (const g of MOCK_GROUPS) await this.upsert('groups', g);
        for (const c of MOCK_CONNECTORS) await this.upsert('connectors', c);
        for (const h of MOCK_HCPS) await this.upsert('hcps', { ...h, id: h.npi });
        for (const r of MOCK_RULES) await this.upsert('rules', r);
        for (const a of DEFAULT_ATTRIBUTES) await this.upsert('attributes', { ...a, id: a.key });
        
        const defaultSettings = {
            llmConfig: { mode: 'direct', agentEndpoint: '', location: 'us-central1' },
            tracingConfig: { provider: 'none', sampleRate: 1.0 }
        };
        await this.upsert('settings', { id: 'system_settings', ...defaultSettings });
        console.log("Remote seeding complete.");
    }

    // --- Configuration Methods ---

    async setMode(mode: StorageMode, apiUrl?: string) {
        this.mode = mode;
        if (apiUrl) this.apiBaseUrl = apiUrl;
        
        await window.localforage.setItem('behaviour_storage_mode', mode);
        if (apiUrl) await window.localforage.setItem('behaviour_api_url', apiUrl);

        if (mode === 'local' && !this.db) {
            await this.initLocalDb();
        }
        
        window.location.reload(); 
    }

    getMode() { return this.mode; }
    getApiUrl() { return this.apiBaseUrl; }

    // --- Core Operations ---

    async saveToDisk() {
        if (this.mode === 'local' && this.db) {
            try {
                const data = this.db.export();
                await window.localforage.setItem('behaviour_sqlite_db', data);
            } catch (e) {
                console.warn("Failed to save DB to disk", e);
            }
        }
    }

    private bulkInsertLocal(table: string, items: any[]) {
        try {
            const stmt = this.db.prepare(`INSERT OR IGNORE INTO ${table} (id, data) VALUES (?, ?)`);
            for (const item of items) {
                const id = item.id || item.npi || item.key;
                if (id) stmt.run([id, JSON.stringify(item)]);
            }
            stmt.free();
        } catch (e) {
            console.error(`Error bulk inserting into ${table}:`, e);
        }
    }

    private upsertLocal(table: string, item: any) {
        const id = item.id || item.npi || item.key;
        if (!id) return;
        this.db.run(`INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`, [id, JSON.stringify(item)]);
        this.saveToDisk();
    }

    async getAll(table: string): Promise<any[]> {
        await this.initPromise;

        if (this.mode === 'remote') {
            try {
                const res = await fetch(`${this.apiBaseUrl}/${table}`);
                if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
                return await res.json();
            } catch (e) {
                console.error(`Failed to fetch ${table} from remote`, e);
                // Return empty array to prevent UI crash, but log error
                return [];
            }
        } else {
            // Local WASM
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
    }

    async getById(table: string, id: string): Promise<any | null> {
        await this.initPromise;

        if (this.mode === 'remote') {
            try {
                const res = await fetch(`${this.apiBaseUrl}/${table}/${id}`);
                if (res.status === 404) return null;
                if (!res.ok) throw new Error("API Error");
                return await res.json();
            } catch (e) {
                return null;
            }
        } else {
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
                return null;
            }
        }
    }

    async upsert(table: string, item: any) {
        await this.initPromise;
        const id = item.id || item.npi || item.key;
        if (!id) {
            console.error("Upsert failed: Item missing ID/NPI/Key", item);
            return;
        }

        if (this.mode === 'remote') {
            try {
                // Ensure ID is explicit in body for consistency
                const payload = { ...item };
                await fetch(`${this.apiBaseUrl}/${table}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (e) {
                console.error(`Failed to upsert to remote`, e);
                throw e; 
            }
        } else {
            this.upsertLocal(table, item);
        }
    }

    async delete(table: string, id: string) {
        await this.initPromise;
        if (this.mode === 'remote') {
            try {
                await fetch(`${this.apiBaseUrl}/${table}/${id}`, { method: 'DELETE' });
            } catch (e) {
                console.error(`Failed to delete remote`, e);
            }
        } else {
            if (!this.db) return;
            this.db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
            this.saveToDisk();
        }
    }

    async exportFullState(): Promise<string> {
        await this.initPromise;
        const tables = ['users', 'groups', 'connectors', 'hcps', 'rules', 'settings', 'attributes', 'links'];
        const dump: Record<string, any[]> = {};
        
        for (const table of tables) {
            dump[table] = await this.getAll(table);
        }
        return JSON.stringify(dump, null, 2);
    }

    async importFullState(json: string): Promise<void> {
        await this.initPromise;
        const dump = JSON.parse(json);
        const tables = ['users', 'groups', 'connectors', 'hcps', 'rules', 'settings', 'attributes', 'links'];

        if (this.mode === 'remote') {
             for (const table of tables) {
                 if (Array.isArray(dump[table])) {
                     for (const item of dump[table]) {
                         await this.upsert(table, item);
                     }
                 }
             }
        } else {
            // Local Transactional
            if (!this.db) return;
            try {
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
            } catch (e) {
                this.db.run("ROLLBACK");
                throw e;
            }
        }
    }
}

export const dbService = new DatabaseService();
