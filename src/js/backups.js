// js/backups.js — backups of every character file (Mystara Character Sheet\backups).
// The app makes one automatically each week and one of the character before each level-up;
// this window lists them, makes one now, opens the folder, and restores a character as a new sheet.

function backupsAvailable() { return Boolean(window.api && typeof window.api.listBackups === 'function'); }

// Called when a level-up window opens: keep the character's file as it was before.
function backupBeforeLevelUp(label) {
    if (!backupsAvailable() || !currentFileName || !currentCharacter) return;
    const name = currentCharacter.name || 'Character';
    window.api.backupCharacter(currentFileName, `${name} before ${label}`).catch(err => console.error('Backup before level-up failed:', err));
}

async function openBackupsModal() {
    let m = document.getElementById('backups-modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'backups-modal';
        m.className = 'notes-form-wrap';
        m.setAttribute('role', 'dialog');
        m.setAttribute('aria-modal', 'true');
        m.setAttribute('aria-label', 'Backups');
        m.addEventListener('click', e => { if (e.target === m) closeBackupsModal(); });
        document.body.appendChild(m);
    }
    m.innerHTML = `<div class="card backups-card" onclick="event.stopPropagation();">
        <div class="panel-head"><h2>Backups</h2>
            <div class="panel-head-tools">
                <button type="button" class="btn btn-sm btn-accent" onclick="backupAllNow()">Back up all now</button>
                <button type="button" class="btn btn-sm" onclick="openBackupsFolder()" title="Open the folder that holds every backup">Open backups folder</button>
                <button type="button" class="icon-btn" onclick="closeBackupsModal()" aria-label="Close">${getIcon('close', 15)}</button>
            </div>
        </div>
        <p class="sub-caption" style="margin: 0 0 8px;">Every character is copied automatically once a week (the 12 newest weekly backups are kept), and a character's file is copied before each level-up (the 40 newest are kept). They are in the <em>backups</em> folder beside your characters. Restoring loads a copy as a new character, so nothing is overwritten.</p>
        <div id="backups-list" class="backups-list"><div class="ledger-note">Loading…</div></div>
    </div>`;
    await renderBackupsList();
}
// Read-only window: Esc (via registerModalCloser) and a click outside close it.
function closeBackupsModal() {
    document.getElementById('backups-modal')?.remove();
}
if (typeof registerModalCloser === 'function') registerModalCloser('backups-modal', closeBackupsModal);

const BACKUP_KINDS = { weekly: 'Weekly', levelup: 'Before level-up', manual: 'By hand' };
let backupsCache = [];
async function renderBackupsList() {
    const box = document.getElementById('backups-list');
    if (!box) return;
    if (!backupsAvailable()) { box.innerHTML = '<div class="ledger-note">Backups need the updated app: rebuild it (or start it again with npm start) to turn them on.</div>'; return; }
    try { backupsCache = await window.api.listBackups(); }
    catch (err) { box.innerHTML = `<div class="ledger-note">Could not read the backups: ${escapeHtml(err?.message || String(err))}</div>`; return; }
    if (!backupsCache.length) { box.innerHTML = '<div class="ledger-note">No backups yet. The first weekly backup is made when the app starts; or use “Back up all now”.</div>'; return; }
    box.innerHTML = backupsCache.map((b, bi) => {
        const when = new Date(b.created).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const files = (b.files || []).map((f, fi) => `<div class="backup-file">
            <span><strong>${escapeHtml(f.name || f.file)}</strong> <span class="eyebrow">${escapeHtml([f.characterClass, f.level ? `level ${f.level}` : '', f.experiencePoints != null ? `${Number(f.experiencePoints).toLocaleString('en-US')} XP` : ''].filter(Boolean).join(' · '))}</span></span>
            <button type="button" class="btn btn-sm" onclick="restoreBackupFile(${bi}, ${fi})" title="Load this copy as a new character">Restore as new</button>
        </div>`).join('');
        return `<details class="backup-row"${bi === 0 ? ' open' : ''}>
            <summary><span class="backup-when">${escapeHtml(when)}</span> <span class="tag">${escapeHtml(BACKUP_KINDS[b.kind] || b.kind)}</span> <span class="backup-reason">${escapeHtml(b.kind === 'weekly' ? `${(b.files || []).length} character${(b.files || []).length === 1 ? '' : 's'}` : b.reason)}</span>
                <button type="button" class="icon-btn backup-folder-btn" onclick="event.preventDefault(); openBackupsFolder(${bi})" title="Open this backup's folder">${getIcon('vault', 13)} Open folder</button></summary>
            ${files || '<div class="ledger-note">Empty.</div>'}
        </details>`;
    }).join('');
}

async function backupAllNow() {
    if (!backupsAvailable()) return renderBackupsList();
    try {
        if (typeof debouncedSave?.flush === 'function') debouncedSave.flush();
        if (typeof saveQueue !== 'undefined') await saveQueue;
        const r = await window.api.backupAll('by hand');
        await renderBackupsList();
        if (typeof sheetToast === 'function') sheetToast(`Backed up ${r.count} character${r.count === 1 ? '' : 's'}.`);
    } catch (err) {
        if (typeof sheetAlert === 'function') sheetAlert(`The backup failed: ${err?.message || err}`);
    }
}
async function openBackupsFolder(bi) {
    if (!backupsAvailable()) return;
    const b = bi !== undefined ? backupsCache[bi] : null;
    try { await window.api.openBackupsFolder(b ? b.folder : undefined); } catch (err) { console.error(err); }
}
async function restoreBackupFile(bi, fi) {
    const b = backupsCache[bi], f = b?.files?.[fi];
    if (!b || !f) return;
    const when = new Date(b.created).toLocaleDateString();
    if (!(await sheetConfirm(`Load ${f.name || 'this character'} as it was on ${when} as a new character? Your current sheets are not changed.`, 'Restore as new'))) return;
    try {
        const data = await window.api.loadBackupFile(b.folder, f.file);
        if (typeof debouncedSave?.flush === 'function') debouncedSave.flush();
        delete data.id;
        data.name = `${data.name || 'Character'} (backup ${when})`;
        window.currentFileName = null;
        currentFileName = null;
        closeBackupsModal();
        loadCharacterToUI(data);
        await saveChanges();
        if (typeof addChronicleEntry === 'function') addChronicleEntry('restore', `Restored from the backup of ${when} (${BACKUP_KINDS[b.kind] || b.kind}).`);
        if (typeof sheetAlert === 'function') sheetAlert(`Restored as “${data.name}”. Rename it, or delete the old sheet, as you like.`);
    } catch (err) {
        if (typeof sheetAlert === 'function') sheetAlert(`Could not restore: ${err?.message || err}`);
    }
}

window.openBackupsModal = openBackupsModal;
window.closeBackupsModal = closeBackupsModal;
window.backupAllNow = backupAllNow;
window.openBackupsFolder = openBackupsFolder;
window.restoreBackupFile = restoreBackupFile;
window.backupBeforeLevelUp = backupBeforeLevelUp;
