const app = require('../backend/app');
const { sequelize } = require('../backend/models');

// A warm container serves many requests, so the schema sync runs once per
// container rather than on every invocation. A failure clears the cache so the
// next request retries instead of inheriting a permanently rejected promise.
let ready;
function ensureReady() {
  if (!ready) {
    ready = sequelize.sync().catch(err => {
      ready = undefined;
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
