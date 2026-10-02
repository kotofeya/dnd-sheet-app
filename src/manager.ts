// src/manager.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { Character } from './types'; // ИМПОРТИРУЕМ НАШИ ТИПЫ

export class CharacterManager {
    private readonly storageDirectory: string;

    constructor(storageDirectory: string) {
        this.storageDirectory = storageDirectory;
    }

    private getFilePath(characterId: string): string {
        return path.join(this.storageDirectory, `${characterId}.json`);
    }

    public async saveCharacter(character: Character): Promise<void> {
        try {
            const filePath = this.getFilePath(character.id);
            const data = JSON.stringify(character, null, 4);
            await fs.writeFile(filePath, data, 'utf-8');
            console.log(`Character ${character.name} successfully saved to ${filePath}`);
        } catch (error) {
            console.error(`Failed to save character ${character.id}:`, error);
            throw new Error('SaveOperationFailed');
        }
    }

    public async loadCharacter(characterId: string): Promise<Character> {
        try {
            const filePath = this.getFilePath(characterId);
            const data = await fs.readFile(filePath, 'utf-8');
            const character: Character = JSON.parse(data);
            return character;
        } catch (error) {
            console.error(`Failed to load character ${characterId}:`, error);
            throw new Error('LoadOperationFailed');
        }
    }
}