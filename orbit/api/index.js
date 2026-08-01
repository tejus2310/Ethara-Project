const app = require('../backend/app');
const { sequelize } = require('../backend/models');

// The schema is already provisioned, so syncing on each cold start only spends
// the function's time budget re-describing existing tables. Set DB_SYNC=true to
// turn it back on for a deploy that introduces a model change.
let ready;
function ensureReady() {
  if (!ready) {
    ready = (process.env.DB_SYNC === 'true' ? sequelize.sync() : Promise.resolve())
      .catch(err => {
        ready = undefined; // let the next request retry rather than cache the failure
        throw err;
      });
  }
  return ready;
}

function fail(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: true, message }));
}

module.exports = async (req, res) => {
  // server.js exits on a missing secret; a function cannot, so answer clearly
  // instead of letting every login fail as an opaque 500.
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set in the Vercel project environment variables.');
    return fail(res, 500, 'Server is misconfigured: JWT_SECRET is not set.');
  }

  try {
    await ensureReady();
  } catch (err) {
    console.error('Database sync failed:', err);
    return fail(res, 500, 'Database unavailable.');
  }

  return app(req, res);
};
