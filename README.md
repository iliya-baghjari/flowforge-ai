# FlowForge AI

**AI-Powered Project Management Platform**

FlowForge AI is a modern, full-stack project management application built with Next.js. It helps teams and individuals manage projects, tasks, deadlines, and progress with a clean dashboard, authentication, and real-time insights.

🔗 **Live Demo**: [https://flowforge-ai-rose.vercel.app](https://flowforge-ai-rose.vercel.app)

---

## ✨ Features

### Authentication & Security
- Email/Password registration & login
- Google & GitHub OAuth
- Email verification
- Password reset flow
- Secure JWT sessions
- Protected routes with middleware
- Avatar upload

### Dashboard
- Summary cards (Total Tasks, Completed, Upcoming Deadlines, Active Projects)
- Activity feed
- Burn-down chart
- Task distribution (Pie chart)
- Mini calendar with deadline indicators

### Project & Task Management
- Projects with status (active / completed / paused)
- Tasks with status, priority, and due dates
- Activity logging

---

## 🛠 Tech Stack

| Category          | Technology                          |
|-------------------|-------------------------------------|
| Framework         | Next.js 16 (App Router)             |
| Language          | TypeScript                          |
| Database          | PostgreSQL + Prisma 7               |
| Authentication    | Auth.js (NextAuth v5)               |
| Styling           | Tailwind CSS 4                      |
| Charts            | Recharts                            |
| Forms & Validation| React Hook Form + Zod               |
| State Management  | Zustand                             |
| Deployment        | Vercel                              |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/iliya-baghjari/flowforge-ai.git
cd flowforge-ai