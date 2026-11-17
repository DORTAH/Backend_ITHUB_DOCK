import express from 'express';
import cors from 'cors';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importRouter } from './modules/import/import.router.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

export const app = express();
const appDirectory = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.set('view engine', 'ejs');
app.set('views', resolve(appDirectory, '../templates'));
app.use(express.static(resolve(appDirectory, '../public')));
app.get('/', (_req, res) => res.render('import'));
app.use('/api/import', importRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Listening on http://localhost:${env.port}`);
});
