# TaskMaster Executive Suite

A sophisticated task management and inspiration dashboard built with React (Frontend) and Spring Boot/Express (Backend).

## Project Structure

- `frontend/`: React + Vite + Tailwind CSS application.
- `backend/`: Spring Boot implementation (Java 17).

## How to Run in VS Code

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Java JDK 17**
- **VS Code Extensions**:
  - `ESLint`
  - `Tailwind CSS IntelliSense`
  - `Extension Pack for Java`

### 2. Setup
1. Open the **root project folder** in VS Code.
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### 3. Running the App
You will need **two terminal windows** open in VS Code:

**Terminal 1 (Frontend)**:
```bash
cd frontend
npm run dev
```
(UI available at `http://localhost:5173`)

**Terminal 2 (Backend)**:
```bash
cd backend
./gradlew bootRun
```
(API available at `http://localhost:8080`)

## Design Philosophy
This app follows a high-density, modern executive aesthetic using the **Plus Jakarta Sans** typeface and a deep **Brand Dark** palette.
