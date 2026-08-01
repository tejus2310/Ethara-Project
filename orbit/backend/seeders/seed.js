require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Project, ProjectMember, Task } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('DB synced');

  const adminHash = await bcrypt.hash('admin123', 10);
  const memberHash = await bcrypt.hash('member123', 10);

  const admin = await User.create({ name: 'Commander Shepard', email: 'admin@orbit.com', passwordHash: adminHash, role: 'Admin' });
  const mem1 = await User.create({ name: 'Garrus Vakarian', email: 'mem1@orbit.com', passwordHash: memberHash, role: 'Member' });
  const mem2 = await User.create({ name: 'Tali Zorah', email: 'mem2@orbit.com', passwordHash: memberHash, role: 'Member' });

  const p1 = await Project.create({ title: 'Apollo Mission', description: 'Moon landing preparation sequence.', deadline: new Date(Date.now() + 864000000), createdBy: admin.id });
  const p2 = await Project.create({ title: 'Voyager Probe', description: 'Deep space exploration mapping.', deadline: new Date(Date.now() + 864000000), createdBy: admin.id });

  await ProjectMember.create({ projectId: p1.id, userId: mem1.id });
  await ProjectMember.create({ projectId: p2.id, userId: mem2.id });

  await Task.create({ projectId: p1.id, title: 'Engine Check', description: 'Verify main thrusters', assignedTo: mem1.id, status: 'Done', priority: 'High', dueDate: new Date(Date.now() - 86400000) });
  await Task.create({ projectId: p1.id, title: 'Navigation Plot', description: 'Plot course to target', assignedTo: mem1.id, status: 'In Progress', priority: 'Medium', dueDate: new Date(Date.now() + 86400000) });

  await Task.create({ projectId: p2.id, title: 'Antenna Calibration', description: 'Calibrate main dish alignment', assignedTo: mem2.id, status: 'Todo', priority: 'High', dueDate: new Date(Date.now() + 86400000) });
  await Task.create({ projectId: p2.id, title: 'Power Core Prep', description: 'Warm up RTG systems', assignedTo: mem2.id, status: 'Todo', priority: 'Low', dueDate: new Date(Date.now() + 86400000) });
  await Task.create({ projectId: p2.id, title: 'Hull Integrity', description: 'Check for microfractures', assignedTo: mem2.id, status: 'Overdue', priority: 'Medium', dueDate: new Date(Date.now() - 86400000) });

  console.log('Seed complete!');
  process.exit(0);
}

seed();
