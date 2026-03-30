const express = require('express');
const cors = require('cors');
const { loadEnv } = require('./lib/env');
const filesRouter = require('./routes/files');

loadEnv();

const app = express();
const port = Number(process.env.PORT) || 3001;
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'up' });
});

app.use('/api/files', filesRouter);

app.listen(port, () => {
  console.log(`[server] listening on ${port}`);
});
