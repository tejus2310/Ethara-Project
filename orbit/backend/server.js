require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Without a signing key every login throws inside jwt.sign and surfaces as a
// generic 500, so fail loudly at boot instead.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Auth cannot work. Set it in backend/.env (local) or the service variables (deployment).');
  process.exit(1);
}

if (!process.env.DB_URL) {
  console.warn('WARNING: DB_URL is not set — falling back to local SQLite. On an ephemeral host every deploy wipes registered users.');
}

sequelize.sync().then(() => {
  console.log('Database synced');
  // Log env check (without exposing actual secrets)
  console.log('ENV CHECK → JWT_SECRET set:', !!process.env.JWT_SECRET);
  console.log('ENV CHECK → DB_URL set:', !!process.env.DB_URL);
  app.listen(PORT, () => {
    console.log(`Mission Control (Backend) running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync db:', err);
});
