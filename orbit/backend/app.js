require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
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

// Unmatched API paths answer with JSON rather than falling through to the SPA
// shell, which would hand the frontend HTML where it expects a payload.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// On Vercel the built frontend is served straight off the CDN and never reaches
// this function, so the static handlers only matter when running as a real server.
if (!process.env.VERCEL) {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(globalErrorHandler);

module.exports = app;
