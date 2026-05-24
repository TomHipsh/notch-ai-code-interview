import fs from 'node:fs/promises';
import path from 'node:path';

export interface EntityRecord {
    id: string;
}

export class JsonFileStore<T extends EntityRecord> {
    constructor(private readonly directoryPath: string) {}

    async loadAll(): Promise<T[]> {
        await this.ensureDirectory();

        const fileNames = await fs.readdir(this.directoryPath);
        const records: T[] = [];

        for (const fileName of fileNames) {
            if (!fileName.endsWith('.json')) {
                continue;
            }

            const record = await this.readFile(path.join(this.directoryPath, fileName));

            if (record) {
                records.push(record);
            }
        }

        return records;
    }

    async load(id: string): Promise<T | undefined> {
        await this.ensureDirectory();
        return this.readFile(this.filePath(id));
    }

    async save(record: T): Promise<void> {
        await this.ensureDirectory();
        await writeJsonFile(this.filePath(record.id), record);
    }

    async ensureDirectory(): Promise<void> {
        await fs.mkdir(this.directoryPath, {recursive: true});
    }

    private filePath(id: string): string {
        return path.join(this.directoryPath, `${id}.json`);
    }

    private async readFile(filePath: string): Promise<T | undefined> {
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            return JSON.parse(fileContent) as T;
        } catch (error) {
            if (isNodeError(error) && error.code === 'ENOENT') {
                return undefined;
            }

            throw error;
        }
    }
}

export class JsonCollectionFileStore<T> {
    constructor(private readonly directoryPath: string) {}

    async load(collectionId: string): Promise<T[]> {
        await this.ensureDirectory();

        try {
            const fileContent = await fs.readFile(this.filePath(collectionId), 'utf8');
            return JSON.parse(fileContent) as T[];
        } catch (error) {
            if (isNodeError(error) && error.code === 'ENOENT') {
                return [];
            }

            throw error;
        }
    }

    async save(collectionId: string, records: T[]): Promise<void> {
        await this.ensureDirectory();
        await writeJsonFile(this.filePath(collectionId), records);
    }

    async ensureDirectory(): Promise<void> {
        await fs.mkdir(this.directoryPath, {recursive: true});
    }

    private filePath(collectionId: string): string {
        return path.join(this.directoryPath, `${collectionId}.json`);
    }
}

const writeJsonFile = async (filePath: string, value: unknown): Promise<void> => {
    const temporaryFilePath = `${filePath}.tmp`;
    const content = `${JSON.stringify(value, null, 2)}\n`;

    await fs.writeFile(temporaryFilePath, content, 'utf8');
    await fs.rename(temporaryFilePath, filePath);
};

const isNodeError = (error: unknown): error is NodeJS.ErrnoException => {
    return error instanceof Error && 'code' in error;
};
