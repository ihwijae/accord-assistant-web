const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  require('dotenv').config({ path: envPath });
}

module.exports = { loadEnv };
