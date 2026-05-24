import corsMiddleware from 'cors';
import express from 'express';
import { json } from 'body-parser';
import controller from './controller';
import { config } from './config';
import { dataManager } from './data_store/memoryDataManager';

const port = config.PORT;

const app = express();
app.use(corsMiddleware());
app.use(json());
app.use(controller);

const bootstrap = async (): Promise<void> => {
    await dataManager.load();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

bootstrap().catch((error: unknown) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
