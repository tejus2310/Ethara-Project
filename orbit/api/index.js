// Requiring the app at module scope means any failure inside it — a driver the
// bundler dropped, a bad env var — takes down the whole function before it can
// answer, which the platform can only report as FUNCTION_INVOCATION_FAILED with
// no detail. Loading lazily behind a try/catch turns that into a readable reply.
const BUILD = 'diag-1';

let app;
let sequelize;
let loadError;

function load() {
  if (app || loadError) return;
  try {
    app = require('../backend/app');
    sequelize = require('../backend/models').sequelize;
  } catch (err) {
    loadError = err;
    console.error('Function failed to load its dependencies:', err);
  }
}

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

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  load();

  // Reports which build is live and what the function can actually see, so a
  // failing deploy can be diagnosed from the outside without log access.
  if (req.url && req.url.startsWith('/api/__health')) {
    return send(res, 200, {
      build: BUILD,
      loaded: !!app,
      loadError: loadError ? { message: loadError.message, code: loadError.code } : null,
      env: {
        DB_URL: !!process.env.DB_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        VERCEL: !!process.env.VERCEL
      },
      node: process.version
    });
  }

  if (loadError) {
    return send(res, 500, {
      error: true,
      message: 'Server failed to start.',
      detail: loadError.message,
      code: loadError.code,
      build: BUILD
    });
  }

  // server.js exits on a missing secret; a function cannot, so answer clearly
  // instead of letting every login fail as an opaque 500.
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set in the Vercel project environment variables.');
    return send(res, 500, { error: true, message: 'Server is misconfigured: JWT_SECRET is not set.' });
  }

  try {
    await ensureReady();
  } catch (err) {
    console.error('Database sync failed:', err);
    return send(res, 500, { error: true, message: 'Database unavailable.', detail: err.message });
  }

  return app(req, res);
};
