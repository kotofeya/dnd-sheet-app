import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, dialog, MessageBoxOptions } from 'electron';
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
for (const old of ['Electron', 'dnd-sheet-app']) {
    const base = path.join(app.getPath('appData'), old);
    try {
        copyMissing(path.join(base, 'characters'), path.join(DATA_DIR, 'characters'));
        copyMissing(path.join(base, 'parties.json'), path.join(DATA_DIR, 'parties.json'));
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});