const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { Project, ProjectMember, Task, User } = require('../models');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    if (req.user.role === 'Admin') {
      const projects = await Project.findAll({
        include: [{ model: User, as: 'members', attributes: ['id', 'name'] }, { model: Task }]
      });
      res.json(projects);
    } else {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Project,
          as: 'projects',
          include: [{ model: User, as: 'members', attributes: ['id', 'name'] }, { model: Task }]
        }]
      });
      res.json(user.projects);
    }
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name'] },
        { model: Task, include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }] }
      ]
    });
    if (!project) return res.status(404).json({ error: true, message: 'Project not found' });

    if (req.user.role === 'Member') {
      const isMember = project.members.some(m => m.id === req.user.id);
      if (!isMember) return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    res.json(project);
  } catch(err) { next(err); }
});

router.post('/:id/tasks', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;
    const task = await Task.create({
      projectId: req.params.id,
      title, description, assignedTo, dueDate, priority
    });
    res.status(201).json(task);
  } catch (err) { next(err); }
});

router.use(requireAdmin);

router.post('/', async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;
    const project = await Project.create({ title, description, deadline, createdBy: req.user.id });
    res.status(201).json(project);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: 'Project not found' });
    
    await project.update(req.body);
    res.json(project);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: 'Project not found' });
    
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
});

router.post('/:id/members', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: 'Project not found' });
    
    await ProjectMember.findOrCreate({ where: { projectId: project.id, userId } });
    res.json({ message: 'Member assigned' });
  } catch (err) { next(err); }
});

module.exports = router;
