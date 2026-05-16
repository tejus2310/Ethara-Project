const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { Task, ActivityLog } = require('../models');

const router = express.Router();
router.use(requireAuth);

router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: true, message: 'Task not found' });

    if (req.user.role === 'Member') {
      if (task.assignedTo !== req.user.id) {
        return res.status(403).json({ error: true, message: 'You can only update tasks assigned to you' });
      }
      const { status } = req.body;
      if (status && ['Todo', 'In Progress', 'Done'].includes(status)) {
        await task.update({ status });
        await ActivityLog.create({ userId: req.user.id, action: 'Task Status Updated', details: `Task "${task.title}" status changed to ${status}` });
        return res.json(task);
      }
      return res.status(400).json({ error: true, message: 'Invalid status update for member' });
    } else {
      await task.update(req.body);
      await ActivityLog.create({ userId: req.user.id, action: 'Task Edited', details: `Task "${task.title}" was updated` });
      return res.json(task);
    }
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: true, message: 'Task not found' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch(err) { next(err); }
});

module.exports = router;
