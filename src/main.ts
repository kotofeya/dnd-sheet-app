import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, dialog, MessageBoxOptions, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { randomUUID } from 'crypto';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000, 
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // Указываем путь к нашему мосту
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

    // Keep a log of the sheet's warnings and errors (app.log next to the saved characters),
    // so problems can be traced after the fact.
    const logFile = path.join(app.getPath('userData'), 'app.log');
    const writeLog = (text: string) => {
        try {
            if (fs.existsSync(logFile) && fs.statSync(logFile).size > 1_000_000) fs.renameSync(logFile, logFile + '.old');
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${text}\n`);
        } catch { /* logging must never break the app */ }
    };
    mainWindow.webContents.on('console-message', (...args: any[]) => {
        const e = args[0] || {};
        // Newer Electron passes one event object; older versions pass (event, level, message, line, source).
        const level = e.level ?? args[1];
        const message = e.message ?? args[2];
        const line = e.lineNumber ?? args[3];
        const source = e.sourceId ?? args[4];
        const isProblem = level === 'warning' || level === 'error' || level === 2 || level === 3;
        if (isProblem) writeLog(`${String(level).toUpperCase()} ${message} (${String(source || '').split('/').slice(-2).join('/')}:${line})`);
    });
    mainWindow.webContents.on('render-process-gone', (_e: any, details: any) => writeLog(`RENDERER GONE ${JSON.stringify(details)}`));
    writeLog(`Started (version ${app.getVersion()})`);
}

// One data folder for every way of starting the app. "npm start" (electron ./dist/main.js) has no
// package.json name, so Electron called it "Electron"; the built .exe is called "dnd-sheet-app".
// Both now use %APPDATA%\Mystara Character Sheet, and characters saved by either are copied in once
// (files that already exist are never overwritten; the old folders are left as they were).
const DATA_DIR = path.join(app.getPath('appData'), 'Mystara Character Sheet');
app.setPath('userData', DATA_DIR);
function copyMissing(from: string, to: string) {
    if (!fs.existsSync(from)) return;
    if (fs.statSync(from).isDirectory()) {
        if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
        for (const f of fs.readdirSync(from)) copyMissing(path.join(from, f), path.join(to, f));
    } else if (!fs.existsSync(to)) {
        fs.copyFileSync(from, to);
    }
}
// Each old folder is copied in only once (a marker file remembers it), so characters deleted or
// renamed here do not come back from the old folders at the next start. Where the characters
// folder already had files before markers existed, the copy was made by an earlier version.
const hadCharacters = fs.existsSync(path.join(DATA_DIR, 'characters')) && fs.readdirSync(path.join(DATA_DIR, 'characters')).some((f: string) => f.endsWith('.json'));
for (const old of ['Electron', 'dnd-sheet-app']) {
    const base = path.join(app.getPath('appData'), old);
    const marker = path.join(DATA_DIR, `.imported-${old}`);
    try {
        if (fs.existsSync(marker)) continue;
        if (!hadCharacters) {
            copyMissing(path.join(base, 'characters'), path.join(DATA_DIR, 'characters'));
            copyMissing(path.join(base, 'parties.json'), path.join(DATA_DIR, 'parties.json'));
        }
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(marker, `Characters from ${base} were copied here on ${new Date().toISOString()}; they are not copied again.\n`);
    } catch (err) {
        console.error(`Could not copy saved characters from ${base}:`, err);
    }
}

const charactersDir = path.join(app.getPath('userData'), 'characters');
if (!fs.existsSync(charactersDir)) {
    fs.mkdirSync(charactersDir, { recursive: true });
}

// 1. Получить список персонажей
ipcMain.handle('get-characters-list', () => {
    const files = fs.readdirSync(charactersDir).filter((f: string) => f.endsWith('.json'));
    return files.map((file: string) => {
        const filePath = path.join(charactersDir, file);
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return { id: file, name: data.name, class: data.characterClass, level: data.level };
        } catch (e) {
            return { id: file, name: "Error Loading", class: "Unknown", level: 0 };
        }
    });
});

ipcMain.handle('get-classes-db', () => {
    try {
        const candidatePaths = [
            path.join(__dirname, 'classes_2.js'),
            path.join(__dirname, 'classes.js'),
            path.join(__dirname, 'data', 'classes_2.js'),
            path.join(__dirname, 'data', 'classes.js')
        ];

        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                delete require.cache[require.resolve(p)];
                const loaded = require(p);
                if (loaded && loaded.ClassesDatabase) {
                    return loaded.ClassesDatabase;
                }
            }
        }
    } catch (err) {
        console.error("Ошибка загрузки ClassesDatabase:", err);
    }
    return {};
});

ipcMain.handle('get-spells-db', () => {
    try {
        const candidatePaths = [
            path.join(__dirname, 'data', 'spells_db.js'),
            path.join(__dirname, 'spells_db.js')
        ];
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                delete require.cache[require.resolve(p)];
                return require(p).SpellsDatabase || {};
            }
        }
    } catch (err) { 
        console.error("Error loading SpellsDatabase:", err); 
    }
    return {};
});

ipcMain.handle('get-deities-db', () => {
    try {
        const candidatePaths = [
            path.join(__dirname, 'data', 'deities_db.js'),
            path.join(__dirname, 'deities_db.js')
        ];
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                delete require.cache[require.resolve(p)];
                return require(p).DeitiesDatabase || {};
            }
        }
    } catch (err) {
        console.error("Error loading DeitiesDatabase:", err);
    }
    return {};
});

ipcMain.handle('get-weapons-db', () => {
    try {
        const candidatePaths = [
            path.join(__dirname, 'weapons_db.js'),
            path.join(__dirname, 'data', 'weapons_db.js')
        ];
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                delete require.cache[require.resolve(p)];
                const loaded = require(p);
                if (loaded && loaded.WeaponsDatabase) return loaded.WeaponsDatabase;
            }
        }
    } catch (err) {
        console.error("Error loading WeaponsDatabase:", err);
    }
    return {};
});

// --- Character file access -------------------------------------------------
// Every file name that comes from the renderer is validated here, so a
// malicious or malformed value can never reach outside the characters folder.
const CHAR_DIR = path.resolve(charactersDir);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveCharacterPath(filename: unknown): string {
    if (typeof filename !== 'string' || !/^[\w.-]+\.json$/.test(filename)) {
        throw new Error(`Invalid character file name: ${String(filename)}`);
    }
    const full = path.resolve(CHAR_DIR, filename);
    if (path.dirname(full) !== CHAR_DIR) throw new Error('Path escapes the characters folder');
    return full;
}

// --- Version history -----------------------------------------------------
// Before a character file is overwritten, the previous copy is kept as a restore
// point in characters/history/<uuid>/<timestamp>.json: at most one every
// HISTORY_INTERVAL_MS while editing (always when forced), keeping HISTORY_KEEP.
const HISTORY_DIR = path.join(CHAR_DIR, 'history');
const HISTORY_INTERVAL_MS = 10 * 60 * 1000;
const HISTORY_KEEP = 40;
const VERSION_RE = /^\d{10,16}\.json$/;

function historyDirFor(filename: unknown): string | null {
    if (typeof filename !== 'string') return null;
    const id = filename.replace(/\.json$/, '');
    if (!UUID_RE.test(id)) return null;              // legacy name-based files get history once migrated
    return path.join(HISTORY_DIR, id);
}

async function listVersionFiles(dir: string): Promise<string[]> {
    try {
        return (await fsPromises.readdir(dir)).filter(f => VERSION_RE.test(f)).sort().reverse();   // newest first
    } catch {
        return [];
    }
}

async function snapshotBeforeWrite(target: string, filename: string, force: boolean): Promise<void> {
    const dir = historyDirFor(filename);
    if (!dir || !fs.existsSync(target)) return;
    const existing = await listVersionFiles(dir);
    const newest = existing[0] ? Number(existing[0].replace('.json', '')) : 0;
    if (!force && Date.now() - newest < HISTORY_INTERVAL_MS) return;
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.copyFile(target, path.join(dir, `${Date.now()}.json`));
    for (const old of (await listVersionFiles(dir)).slice(HISTORY_KEEP)) {
        await fsPromises.rm(path.join(dir, old), { force: true });
    }
}

ipcMain.handle('list-character-versions', async (_event: IpcMainInvokeEvent, filename: unknown) => {
    resolveCharacterPath(filename);
    const dir = historyDirFor(filename);
    if (!dir) return [];
    const out = [];
    for (const file of await listVersionFiles(dir)) {
        try {
            const data = JSON.parse(await fsPromises.readFile(path.join(dir, file), 'utf8'));
            out.push({ file, savedAt: Number(file.replace('.json', '')), name: data.name, characterClass: data.characterClass,
                       level: data.level, experiencePoints: data.experiencePoints, hitPoints: data.hitPoints });
        } catch {
            out.push({ file, savedAt: Number(file.replace('.json', '')), name: '(unreadable)' });
        }
    }
    return out;
});

ipcMain.handle('load-character-version', async (_event: IpcMainInvokeEvent, filename: unknown, versionFile: unknown) => {
    resolveCharacterPath(filename);
    const dir = historyDirFor(filename);
    if (!dir || typeof versionFile !== 'string' || !VERSION_RE.test(versionFile)) throw new Error('Invalid version');
    return JSON.parse(await fsPromises.readFile(path.join(dir, versionFile), 'utf8'));
});

// 2. Загрузить данные
ipcMain.handle('load-character-data', async (_event: IpcMainInvokeEvent, filename: unknown) => {
    const data = await fsPromises.readFile(resolveCharacterPath(filename), 'utf8');
    return JSON.parse(data);
});

// 3. Сохранить. Files are named by a stable UUID (not by character name), so
// renaming a character or giving two characters the same name can no longer
// overwrite or delete another sheet. Writes are atomic (temp file + rename),
// and a legacy name-based file is removed only AFTER the new file is on disk.
ipcMain.handle('save-character', async (_event: IpcMainInvokeEvent, payload: unknown) => {
    const { data, oldFilename, snapshot } = (payload ?? {}) as { data?: any; oldFilename?: unknown; snapshot?: boolean };
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid character payload');

    if (typeof data.id !== 'string' || !UUID_RE.test(data.id)) data.id = randomUUID();
    const filename = `${data.id}.json`;
    const target = resolveCharacterPath(filename);
    const tmp = `${target}.tmp`;

    await snapshotBeforeWrite(target, filename, Boolean(snapshot));
    await fsPromises.writeFile(tmp, JSON.stringify(data, null, 4), 'utf8');
    await fsPromises.rename(tmp, target);

    if (typeof oldFilename === 'string' && oldFilename && oldFilename !== filename) {
        await fsPromises.rm(resolveCharacterPath(oldFilename), { force: true });
    }
    return { filename, id: data.id as string };
});

// Parties: one shared file beside the characters folder (members, treasury, notes).
const PARTIES_FILE = path.join(app.getPath('userData'), 'parties.json');
ipcMain.handle('get-parties', async () => {
    try {
        const data = JSON.parse(await fsPromises.readFile(PARTIES_FILE, 'utf8'));
        return data && typeof data === 'object' && Array.isArray(data.parties) ? data : { parties: [] };
    } catch (e) {
        return { parties: [] };
    }
});
ipcMain.handle('save-parties', async (_event: IpcMainInvokeEvent, payload: unknown) => {
    const data = payload as { parties?: unknown };
    if (!data || typeof data !== 'object' || !Array.isArray(data.parties)) throw new Error('Invalid parties payload');
    const tmp = `${PARTIES_FILE}.tmp`;
    await fsPromises.writeFile(tmp, JSON.stringify(data, null, 4), 'utf8');
    await fsPromises.rename(tmp, PARTIES_FILE);
    return true;
});

// --- Backups ---------------------------------------------------------------
// Copies of every character file (and parties.json) in Mystara Character Sheet\backups:
// automatically once a week, before each level-up (that character only), or on demand.
// Each backup is a folder "<date> <time> <reason>" with a backup.json describing it.
const BACKUP_DIR = path.join(app.getPath('userData'), 'backups');
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const KEEP = { weekly: 12, levelup: 40, manual: 40 } as Record<string, number>;
type BackupKind = 'weekly' | 'levelup' | 'manual';
type BackupFile = { file: string; name?: string; characterClass?: string; level?: number; experiencePoints?: number };
type BackupMeta = { kind: BackupKind; reason: string; created: number; files: BackupFile[] };

function stamp(d = new Date()): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}
function safeLabel(s: string): string { return s.replace(/[^\p{L}\p{N} .()'_-]+/gu, '_').replace(/\s+/g, ' ').trim().slice(0, 60) || 'backup'; }

async function readMeta(folder: string): Promise<BackupMeta | null> {
    try { return JSON.parse(await fsPromises.readFile(path.join(BACKUP_DIR, folder, 'backup.json'), 'utf8')); } catch { return null; }
}
async function listBackupFolders(): Promise<{ folder: string; meta: BackupMeta }[]> {
    let dirs: string[] = [];
    try { dirs = await fsPromises.readdir(BACKUP_DIR); } catch { return []; }
    const out: { folder: string; meta: BackupMeta }[] = [];
    for (const d of dirs) {
        const meta = await readMeta(d);
        if (meta) out.push({ folder: d, meta });
    }
    return out.sort((a, b) => b.meta.created - a.meta.created);           // newest first
}
async function describeCharacter(full: string, file: string): Promise<BackupFile> {
    try {
        const d = JSON.parse(await fsPromises.readFile(full, 'utf8'));
        return { file, name: d.name, characterClass: d.characterClass, level: d.level, experiencePoints: d.experiencePoints };
    } catch { return { file, name: '(unreadable)' }; }
}
// Copy the given character files (all when none given) into a new backup folder.
async function makeBackup(kind: BackupKind, reason: string, only?: string[]): Promise<{ folder: string; count: number }> {
    const files = only ?? fs.readdirSync(CHAR_DIR).filter((f: string) => f.endsWith('.json'));
    let folder = `${stamp()} ${safeLabel(reason)}`;
    for (let n = 2; fs.existsSync(path.join(BACKUP_DIR, folder)); n++) folder = `${stamp()} ${safeLabel(reason)} (${n})`;
    const dir = path.join(BACKUP_DIR, folder);
    await fsPromises.mkdir(dir, { recursive: true });
    const meta: BackupMeta = { kind, reason, created: Date.now(), files: [] };
    for (const f of files) {
        const src = resolveCharacterPath(f);
        if (!fs.existsSync(src)) continue;
        await fsPromises.copyFile(src, path.join(dir, f));
        meta.files.push(await describeCharacter(src, f));
    }
    if (!only && fs.existsSync(PARTIES_FILE)) await fsPromises.copyFile(PARTIES_FILE, path.join(dir, 'parties.json'));
    await fsPromises.writeFile(path.join(dir, 'backup.json'), JSON.stringify(meta, null, 2), 'utf8');
    // Keep only the newest backups of this kind.
    const sameKind = (await listBackupFolders()).filter(b => b.meta.kind === kind);
    for (const old of sameKind.slice(KEEP[kind] ?? 40)) await fsPromises.rm(path.join(BACKUP_DIR, old.folder), { recursive: true, force: true });
    return { folder, count: meta.files.length };
}
// The weekly backup: made when the newest weekly one is a week old (checked at start and every 6 hours).
async function weeklyBackupIfDue(): Promise<void> {
    try {
        const last = (await listBackupFolders()).find(b => b.meta.kind === 'weekly');
        if (last && Date.now() - last.meta.created < WEEK_MS) return;
        if (!fs.readdirSync(CHAR_DIR).some((f: string) => f.endsWith('.json'))) return;
        await makeBackup('weekly', 'weekly');
    } catch (err) { console.error('Weekly backup failed:', err); }
}
function backupFolderPath(folder: unknown): string {
    if (typeof folder !== 'string' || !/^[\p{L}\p{N} .()'_-]+$/u.test(folder)) throw new Error('Invalid backup folder');
    const full = path.resolve(BACKUP_DIR, folder);
    if (path.dirname(full) !== path.resolve(BACKUP_DIR)) throw new Error('Path escapes the backups folder');
    return full;
}

ipcMain.handle('list-backups', async () => (await listBackupFolders()).map(b => ({ folder: b.folder, ...b.meta })));
ipcMain.handle('backup-all', async (_e: IpcMainInvokeEvent, reason: unknown) => makeBackup('manual', typeof reason === 'string' && reason ? reason : 'manual'));
ipcMain.handle('backup-character', async (_e: IpcMainInvokeEvent, filename: unknown, reason: unknown) => {
    resolveCharacterPath(filename);
    return makeBackup('levelup', typeof reason === 'string' && reason ? reason : 'before level-up', [filename as string]);
});
ipcMain.handle('load-backup-file', async (_e: IpcMainInvokeEvent, folder: unknown, file: unknown) => {
    const dir = backupFolderPath(folder);
    if (typeof file !== 'string' || !/^[\w.-]+\.json$/.test(file) || file === 'backup.json' || file === 'parties.json') throw new Error('Invalid file');
    return JSON.parse(await fsPromises.readFile(path.join(dir, file), 'utf8'));
});
ipcMain.handle('open-backups-folder', async (_e: IpcMainInvokeEvent, folder: unknown) => {
    await fsPromises.mkdir(BACKUP_DIR, { recursive: true });
    return shell.openPath(folder ? backupFolderPath(folder) : BACKUP_DIR);
});

// 4. Удалить персонажа навсегда
ipcMain.handle('delete-character', async (_event: IpcMainInvokeEvent, filename: unknown) => {
    await fsPromises.rm(resolveCharacterPath(filename), { force: true });
    return true;
});

ipcMain.handle('show-confirm', async (event: IpcMainInvokeEvent, message: string) => {
    // Attach the dialog to the sheet's window and give focus back afterwards: an unparented
    // dialog on Windows can leave the window not taking clicks or typing.
    const win = BrowserWindow.fromWebContents(event.sender);
    const options: MessageBoxOptions = {
        type: 'warning',
        buttons: ['Cancel', 'Delete'],
        defaultId: 1,
        cancelId: 0,
        title: 'Confirm Deletion',
        message: message,
    };
    const result = win ? await dialog.showMessageBox(win, options) : await dialog.showMessageBox(options);
    if (win && !win.isDestroyed()) { win.focus(); win.webContents.focus(); }
    // Возвращает true, если нажали кнопку 'Delete' (индекс 1)
    return result.response === 1; 
});

app.whenReady().then(() => {
    createWindow();
    weeklyBackupIfDue();
    setInterval(weeklyBackupIfDue, 6 * 60 * 60 * 1000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});