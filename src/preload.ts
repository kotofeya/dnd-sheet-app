import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getCharactersList: () => ipcRenderer.invoke('get-characters-list'),
    loadCharacterData: (filename: string) => ipcRenderer.invoke('load-character-data', filename),
    // Resolves to { filename, id } once the file is safely on disk; rejects on failure.
    saveCharacter: (payload: unknown) => ipcRenderer.invoke('save-character', payload),
    deleteCharacter: (filename: string) => ipcRenderer.invoke('delete-character', filename),
    // Version history: restore points kept by the main process before overwriting a save.
    listCharacterVersions: (filename: string) => ipcRenderer.invoke('list-character-versions', filename),
    loadCharacterVersion: (filename: string, versionFile: string) => ipcRenderer.invoke('load-character-version', filename, versionFile),
    showConfirm: (message: string) => ipcRenderer.invoke('show-confirm', message),
    // Parties: members, shared treasury and notes (parties.json beside the characters folder).
    getParties: () => ipcRenderer.invoke('get-parties'),
    // Backups of all characters (weekly, before level-ups, or on demand), in the backups folder.
    listBackups: () => ipcRenderer.invoke('list-backups'),
    backupAll: (reason?: string) => ipcRenderer.invoke('backup-all', reason),
    backupCharacter: (filename: string, reason: string) => ipcRenderer.invoke('backup-character', filename, reason),
    loadBackupFile: (folder: string, file: string) => ipcRenderer.invoke('load-backup-file', folder, file),
    openBackupsFolder: (folder?: string) => ipcRenderer.invoke('open-backups-folder', folder),
    saveParties: (data: unknown) => ipcRenderer.invoke('save-parties', data),
    // УБЕДИСЬ, ЧТО ЭТА СТРОКА ЕСТЬ:
    getClassesDB: () => ipcRenderer.invoke('get-classes-db'),
    getSpellsDB: () => ipcRenderer.invoke('get-spells-db'),
    // УБЕДИСЬ, ЧТО ЭТА СТРОКА ЕСТЬ И НАПИСАНА БЕЗ ОПЕЧАТОК:
    getDeitiesDB: () => ipcRenderer.invoke('get-deities-db'),
    getWeaponsDB: () => ipcRenderer.invoke('get-weapons-db')
});