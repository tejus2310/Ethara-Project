# 🚀 Orbit Project Management System

![Orbit Banner](https://img.shields.io/badge/Project-Orbit_System-00f3ff?style=for-the-badge&logo=react&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

**Orbit** is a modern, high-performance, full-stack project management application featuring a beautiful "Deep Space" aesthetic. Designed with glowing neon accents, glassmorphism UI, and custom animations, Orbit helps teams track tasks and projects with absolute precision.

## ✨ Key Features

- 🔐 **Secure Authentication & RBAC**: JWT-based login with encrypted passwords. Strict Role-Based Access Control differentiating between `Admin` and `Member` privileges.
- 🌌 **Immersive Space Theme**: A meticulously crafted UI featuring a 3D warp-speed canvas background, custom dark-mode scrollbars, and neon cyan interactive elements.
- 📊 **Dynamic Dashboards**: Admins see global metrics and all overdue tasks, while Members are securely restricted to their own personalized statistics and task assignments.
- 📝 **Advanced Task Management**: Admins can assign tasks to specific users. Members can only update the statuses of tasks explicitly assigned to them.
- 📧 **Secure Password Recovery**: Built-in Nodemailer integration generating cryptographic tokens for safe, email-based password resets.

## 🛠️ Technology Stack

### Frontend (Mission Control)
- **Framework:** React.js (built with Vite for lightning-fast compilation)
- **Styling:** Tailwind CSS (Custom customized tokens and glassmorphism utilities)
- **Icons:** Lucide-React
- **State Management:** React Context API
- **Routing:** React Router v6

### Backend (Engine Room)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (Lightweight & portable)
- **ORM:** Sequelize
- **Security:** Bcrypt (password hashing), JSON Web Tokens (session management)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tejus2310/Ethara-Project.git
   cd Ethara-Project/orbit
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
DB_URL=sqlite://database.sqlite
EMAIL_USER=your_test_email@gmail.com
EMAIL_PASS=your_app_password
```
*(Note: If you do not configure an email, the password reset system will safely fall back to printing the secure reset links directly to your backend terminal).*

## ⚡ Running the Application

You can easily launch both the frontend and backend simultaneously using the root startup script!

1. **Navigate to the root `orbit` folder**
   ```bash
   cd orbit
   ```

2. **Start the engines**
   ```bash
   npm start
   ```

The application will automatically boot up:
- **Frontend UI:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

## 🔒 Default Accounts
If you run the project for the first time, the database will initialize automatically. You can register a new account on the login page. Admin access is managed securely in the database.

---
*Developed by [tejus2310](https://github.com/tejus2310) for the Ethara Project.*
