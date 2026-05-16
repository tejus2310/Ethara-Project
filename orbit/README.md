# Orbit — Mission Control for Teams

A sleek, space-themed Project & Task Management System.

## Features
- Role-Based Access Control (Admin / Member)
- JWT Authentication
- Cosmic Dark Theme UI (React + Tailwind)
- Kanban Task Board
- Dashboard Statistics

## Setup Instructions

1. Install dependencies for both backend and frontend:
```bash
npm install
```

2. Seed the database with initial data (1 Admin, 2 Members, 2 Projects, 5 Tasks):
```bash
npm run seed
```

3. Start the application:
```bash
npm start
```

The backend will run on `http://localhost:5000` and the frontend will run on `http://localhost:5173` (or similar Vite port).

## Environment Variables
The `.env` file is already included in `backend/.env` with defaults:
- `PORT=5000`
- `JWT_SECRET=your_jwt_secret_here`
- `DB_URL=sqlite://database.sqlite`

## Railway Deployment
1. Push the repository to GitHub.
2. Create a new Railway project and connect the GitHub repo.
3. Railway will detect the `Dockerfile` and build the app.
4. Set the following environment variables in Railway:
   - `JWT_SECRET` (required)
   - `PORT` (optional; Railway provides one automatically)
5. Deploy the service and Railway will expose the backend with the frontend served from the same container.

> Note: This app uses SQLite for runtime persistence. Railway containers are ephemeral, so use this deployment for demo/testing or switch to a managed database for production.

## API Documentation

| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | /api/auth/signup | Create new user | Any |
| POST | /api/auth/login | Login | Any |
| GET | /api/projects | List projects | Admin/Member |
| POST | /api/projects | Create project | Admin |
| GET | /api/projects/:id | Get project details | Admin/Member |
| PUT | /api/projects/:id | Update project | Admin |
| DELETE | /api/projects/:id | Delete project | Admin |
| POST | /api/projects/:id/members | Assign user to project | Admin |
| POST | /api/projects/:id/tasks | Create task for project | Admin |
| PUT | /api/tasks/:id | Update task | Admin/Member(Status only) |
| DELETE | /api/tasks/:id | Delete task | Admin |
| GET | /api/dashboard | Get dashboard stats | Admin/Member |
