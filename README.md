# 🏰 Legends

> **A modern full-stack web application for discovering, collecting and sharing Polish legends, myths and local folklore.**

![Version](https://img.shields.io/badge/version-v0.3.1-blue)
![Status](https://img.shields.io/badge/status-active-success)
![Java](https://img.shields.io/badge/Java-21+-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📖 About

Legends is a modern web application designed to preserve and share Polish legends, myths and local stories.

The project is being developed as a long-term portfolio application focused on modern Java backend development, React frontend architecture and clean software engineering practices.

The long-term vision is to create a community-driven platform dedicated to Polish folklore.

---

## ✨ Current Features

### Backend

* REST API
* Spring Boot
* Spring Security
* JWT Authentication
* User Roles (USER / ADMIN)
* Ownership-based authorization
* Flyway database migrations
* MySQL
* Image upload
* Automatic image cleanup

### Frontend

* React
* React Router
* Responsive UI
* Search & filtering
* Pagination
* Statistics dashboard
* Charts
* Dark theme

---

## 🛠 Tech Stack

### Backend

* Java 21+
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* Flyway
* MySQL

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Recharts

---

## 🚀 Getting Started

### Clone repository

```bash
git clone https://github.com/ColJops/legends.git
cd legends
```

### Backend

Requirements: Java 21+ and a running MySQL server. Create the `appbase` database before starting the backend. For local development, the `local` profile supplies a development JWT key, localhost CORS origin, and email verification links in the application log. Its default database credentials are `root` / `root`; override them if your local MySQL uses different credentials.

PowerShell:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:DB_URL = 'jdbc:mysql://localhost:3306/appbase'
$env:DB_USERNAME = 'root'
$env:DB_PASSWORD = 'root'
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
cd backend
export SPRING_PROFILES_ACTIVE=local
export DB_URL=jdbc:mysql://localhost:3306/appbase
export DB_USERNAME=root
export DB_PASSWORD=root
./mvnw spring-boot:run
```

For non-local deployments, do not activate `local`. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET_BASE64` (a Base64-encoded random key of at least 32 bytes), `APP_CORS_ALLOWED_ORIGINS`, `APP_MAIL_MODE`, `MAIL_FROM`, and `APP_EMAIL_VERIFICATION_URL`; SMTP mode also requires the appropriate `MAIL_*` settings.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```
backend/
frontend/
docs/
uploads/
```

---

## 📚 Documentation

Detailed documentation is available inside the **docs/** directory.

* Roadmap
* Changelog
* Architecture
* Backend
* Frontend
* Database
* API
* Architecture Decisions (ADR)
* TODO

---

## 🗺️ Roadmap

Current milestone:

**v0.3 – Foundation & Security**

Upcoming releases:

* Community Features
* Administration Panel
* Interactive Poland Map
* Public Release

---

## 🤝 Contributing

The project is currently under active development.

Suggestions and feedback are always welcome.

---

## 👨‍💻 Author

Daniel Kupracz

Developed as a long-term portfolio project focused on Java, Spring Boot and React.

---
