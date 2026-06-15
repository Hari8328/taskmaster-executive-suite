# Taskmaster Executive Suite

A sophisticated, minimal task management and deep-work inspiration dashboard built with React (Frontend), Java Spring Boot (Backend), and MySQL (Database), containerized with Docker Compose.

---

## 🛠️ Technology Stack
* **Frontend**: React, Vite, Tailwind CSS, Recharts (ResizeObserver layout-optimized), Lucide icons.
* **Backend**: Java 17, Spring Boot, Spring Security (JWT authentication), Spring Data JPA.
* **Database**: MySQL 8.0.
* **Orchestration**: Docker & Docker Compose.

---

## 🚀 How to Run the Application

The fastest and most reliable way to run the entire stack is using **Docker Compose**.

### 1. Prerequisites
Make sure you have the following installed on your computer:
* **Docker Desktop** (Make sure it is opened and running).
* **Node.js** (v18+; only if running outside Docker).

### 2. Start the Website (Docker Mode)
Open PowerShell or Command Prompt in the root project folder (`C:\Users\ihari\Downloads\TaskMaster`) and run:
```powershell
docker-compose up -d --build
```
This command automatically:
1. Builds the React frontend container.
2. Compiles and packages the Spring Boot backend container.
3. Launches the MySQL database container.
4. Binds the frontend port to `http://localhost:3000`.

### 3. Stop the Website
To shut down all servers and database containers safely, run:
```powershell
docker-compose down
```

---

## 🌐 How to Share Your Website (ngrok)

To let another person access your website from outside your home network, use the pre-configured **ngrok** tunnel:

1. Open a terminal and go to the ngrok folder:
   ```cmd
   cd C:\Users\ihari\Downloads\ngrok-v3-stable-windows-amd64
   ```
2. Run the tunnel command:
   ```cmd
   .\ngrok.exe http 3000
   ```
3. Copy the **Forwarding** address (e.g., `https://xxxx.ngrok-free.dev`) and share it with others.
4. *Note: Keep this terminal window open to keep the public link active.*

---

## 🔒 Security Features
* **Password Hashing**: Passwords are encrypted before database insertion using **BCrypt** hashing.
* **JWT Access Control**: All restricted API endpoints require stateless Bearer token authorization.
* **Length Validations**: Sign-Up validation requires usernames to be at least **3 characters** and passwords to be at least **6 characters** long.

---

## 📂 Project Structure
* `frontend/`: React components, views, styling (`index.css`), and asset management.
* `backend/`: Spring Boot Java application controllers, models, and security layers.
* `docker-compose.yml`: Multi-container Docker configuration.
* `README.md`: Project developer guide.
