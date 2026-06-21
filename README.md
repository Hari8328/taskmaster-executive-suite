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
Open PowerShell or Command Prompt in the root project folder (where this README is located) and run:
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

1. Open a terminal and go to the folder where you extracted ngrok:
   ```cmd
   cd /path/to/your/ngrok-folder
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

---

## ☁️ Cloud Deployment (24/7 Live Website)

To make your website run 24/7 without needing your laptop to stay open, you can deploy it to **Render.com** using the pre-configured Blueprint template.

### Deploying to Render
1. Push your latest code to your **GitHub** repository.
2. Sign up or log in to [Render.com](https://render.com).
3. In the Render Dashboard, click **New** ➔ **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically read the `render.yaml` file and set up three services:
   - `db` (MySQL container)
   - `backend` (Spring Boot API container)
   - `frontend` (React Nginx web container)
6. Go to the **backend** service settings, and add your `GEMINI_API_KEY` under Environment Variables.
7. Once Render finishes building, you will get a permanent live link (e.g., `https://frontend-xxxx.onrender.com`) that works on any mobile or desktop device even if your laptop is closed.

---

## 📂 Project Structure
* `frontend/`: React components, views, styling (`index.css`), and asset management.
* `backend/`: Spring Boot Java application controllers, models, and security layers.
* `docker-compose.yml`: Multi-container Docker configuration.
* `render.yaml`: Cloud deployment orchestration configuration.
* `README.md`: Project developer guide.
