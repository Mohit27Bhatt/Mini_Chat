# Mini Chat Application

A full-stack real-time chat application built using **React (Vite + TypeScript)** for the frontend and **Spring Boot** for the backend.

This project supports private and group messaging, JWT-based authentication, and real-time updates using WebSockets (STOMP + SockJS).

---

## Features

- User registration and login (JWT authentication)
- Private and group chats
- Real-time messaging via WebSockets (STOMP + SockJS)
- Message persistence using MySQL and JPA
- Display of last message and chat previews
- Responsive UI built with React, TailwindCSS, and Shadcn components
- Create and join groups dynamically
- Live user and group updates

---

## Project Structure

Mini_Chat/
│
├── backend/ # Spring Boot backend
│ ├── src/
│ ├── pom.xml
│ └── ...
│
├── frontend/ # React frontend (Vite + TypeScript)
│ ├── src/
│ ├── package.json
│ ├── vite.config.ts
│ └── ...
│
├── .gitignore
└── README.md


---


---

## Technologies Used

### Frontend
- React (Vite + TypeScript)
- TailwindCSS
- Shadcn/UI components
- Lucide React Icons
- Axios
- SockJS and STOMP.js
- Sonner (toast notifications)
- Radix UI (tooltips, toasts, labels)

### Backend
- Spring Boot (Java 17+)
- Spring Security (JWT Authentication)
- Spring WebSocket (STOMP)
- Spring Data JPA (Hibernate)
- H2 File-based Database

---

## Local Setup Instructions

### Prerequisites
- Java 17 or later  
- Node.js (v18 or later)  
- Maven  

---


# -------------------------------
# BACKEND SETUP (Spring Boot)
# -------------------------------

1. Navigate to the backend folder:
   cd backend

2. Ensure the following configuration in:
   src/main/resources/application.properties

   spring.datasource.url=jdbc:h2:file:./data/minichatdb
   spring.datasource.driverClassName=org.h2.Driver
   spring.datasource.username=sa
   spring.datasource.password=
   spring.jpa.hibernate.ddl-auto=update
   spring.h2.console.enabled=true
   spring.h2.console.path=/h2-console
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.format_sql=true
   jwt.secret=U2prN9zQ3rT8V4mA7xD1bC6fL9pK0sG5yE2wH8uM1qJ4zR7n

   # Notes:
   # - Uses H2 file-based database (data persists on disk between restarts)
   # - H2 database file is created under: ./data/minichatdb.mv.db

3. Run the backend server:
   mvn spring-boot:run

4. Access backend at:
   http://localhost:8080

5. (Optional) Access H2 Database Console:
   http://localhost:8080/h2-console

6. JDBC Connection URL for H2 Console:
   jdbc:h2:file:./data/minichatdb


# -------------------------------
# FRONTEND SETUP (React + Vite)
# -------------------------------

1. Navigate to the frontend folder:
   cd frontend

2. Install dependencies:
   npm install

3. Create a .env file inside the frontend directory with:
   VITE_API_URL=http://localhost:8080

4. Start the development server:
   npm run dev

5. Open the application in your browser:
   http://localhost:5173


AI Tools Used  :
Github Copilot
ChatGPT 
Lovable for UI
Claude

# -------------------------------
# SUMMARY
# -------------------------------
# - Backend runs on: http://localhost:8080
# - Frontend runs on: http://localhost:5173
# - Database: H2 file-based (persistent storage)
# - WebSocket Endpoint: /ws
# - H2 Console: http://localhost:8080/h2-console
# - JDBC URL: jdbc:h2:file:./data/minichatdb
