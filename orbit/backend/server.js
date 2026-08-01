require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { globalErrorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.use(globalErrorHandler);

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
