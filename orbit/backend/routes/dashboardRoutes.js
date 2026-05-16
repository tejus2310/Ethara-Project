const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { Task, Project, User, ActivityLog } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    await Task.update(
      { status: 'Overdue' },
      { 
        where: { 
          dueDate: { [Op.lt]: new Date() },
          status: { [Op.notIn]: ['Done', 'Overdue'] }
        }
      }
    );

    let projectsCount = 0;
    let tasks = [];
    let myTasks = [];

    if (req.user.role === 'Admin') {
      projectsCount = await Project.count();
      tasks = await Task.findAll({ include: [{ model: Project }, { model: User, as: 'assignee' }] });
      myTasks = tasks.filter(t => t.assignedTo === req.user.id);
    } else {
      const user = await User.findByPk(req.user.id, { include: [{ model: Project, as: 'projects' }] });
      projectsCount = user.projects.length;
      const projectIds = user.projects.map(p => p.id);
      tasks = await Task.findAll({ 
        where: { projectId: projectIds },
        include: [{ model: Project }, { model: User, as: 'assignee' }]
      });
      myTasks = tasks.filter(t => t.assignedTo === req.user.id);
    }

    // For Admins, show global stats. For Members, show personal stats.
    const statTasks = req.user.role === 'Admin' ? tasks : myTasks;

    const tasksByStatus = { Todo: 0, 'In Progress': 0, Done: 0, Overdue: 0 };
    statTasks.forEach(t => { if(tasksByStatus[t.status] !== undefined) tasksByStatus[t.status]++; });

    const overdueTasks = statTasks.filter(t => t.status === 'Overdue');

    let allProjects = [];
    if (req.user.role === 'Admin') {
      allProjects = await Project.findAll({ include: [{ model: Task }] });
    } else {
      const user = await User.findByPk(req.user.id, { include: [{ model: Project, as: 'projects', include: [{model: Task}] }] });
      allProjects = user.projects;
    }

    const completion = allProjects.map(p => {
      const total = p.Tasks ? p.Tasks.length : 0;
      const done = p.Tasks ? p.Tasks.filter(t => t.status === 'Done').length : 0;
      return {
        projectId: p.id,
        title: p.title,
        percent: total === 0 ? 0 : Math.round((done / total) * 100)
      };
    });

    const response = {
      projectsCount,
      tasksByStatus,
      overdueTasks,
      myTasks,
      completion
    };

    if (req.user.role === 'Admin') {
      const recentActivity = await ActivityLog.findAll({
        include: [{ model: User, as: 'user', attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      response.recentActivity = recentActivity;
    }

    res.json(response);
  } catch (err) { next(err); }
});

module.exports = router;
