<div align="center">
  
  # 🏥 HEALTHCARE LAB
  
  **A Premium, Full-Stack Healthcare Platform**

  [![Java Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-Ready-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)

  <p align="center">
    Seamlessly integrating modern UI paradigms with a robust backend architecture to deliver a superior lab test booking and management experience.
  </p>

</div>

---

## 📖 Overview

**Healthcare Lab** is an enterprise-grade web application designed to bridge the gap between patients seeking medical tests and healthcare professionals processing them. Built with scalability and performance in mind, it provides dedicated portals for different roles, ensuring intelligent slot management, secure data handling, and an ultra-responsive user interface using **Framer Motion** and **React Three Fiber**.

---

## ✨ Core Features

### 👤 Patient Portal
- 🩺 **Extensive Test Catalog:** Browse and search for medical tests seamlessly.
- 📅 **Smart Slot Booking:** Real-time availability checks and scheduling.
- 📄 **Reports & Analytics:** View diagnostic reports via beautifully rendered charts (Powered by Recharts).
- 🌓 **Dynamic Theming:** Premium Dark/Light mode integration with Tailwind CSS.

### 👨‍⚕️ Medical Officer & Admin Portal
- 📊 **Dynamic Dashboard:** Real-time metrics, appointment volume tracking, and analytics.
- 🎫 **Workflow Management:** Approve appointments, upload reports, and manage test statuses.
- ⚙️ **Inventory/Test Management:** Add, update, or remove test offerings securely.

---

## 📸 Screenshots Gallery

*(Screenshots to be added here. Replace paths with actual image locations once captured)*

| Patient Dashboard | Booking Flow | Medical Officer View |
| :---: | :---: | :---: |
| <img src="https://via.placeholder.com/400x250.png?text=Patient+Dashboard" alt="Patient Dashboard" width="300" /> | <img src="https://via.placeholder.com/400x250.png?text=Booking+Flow" alt="Booking Flow" width="300" /> | <img src="https://via.placeholder.com/400x250.png?text=Medical+Officer+Portal" alt="MO View" width="300" /> |
| *Intuitive test discovery and patient analytics* | *Frictionless appointment slot booking* | *Comprehensive patient management tools* |

---

## 🛠️ Detailed Tech Stack

### Frontend Architecture
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Class Variance Authority (CVA)
- **Animations & 3D:** Framer Motion, React Three Fiber & Drei
- **Forms & Validation:** React Hook Form + Yup
- **Data Visualization:** Recharts

### Backend Architecture
- **Framework:** Java + Spring Boot
- **Database:** SQL (Managed via Spring Data JPA / Hibernate)
- **Security:** Complete Auth implementation (Role-based access)
- **Tooling:** Maven for dependency management

### Testing & QA
- **E2E & UI Testing:** Playwright
- **API Testing:** Postman Collections Included

---

## 🚦 Prerequisites

Before running the project locally, ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Java JDK** (v17+ recommended)
- **Maven** (latest)
- **Database Server** (MySQL/PostgreSQL, configured as per backend properties)

---

## 🚀 Getting Started

### ⚡ Quick Startup (Automated)

The project includes an intelligent one-click batch script for immediate initialization on Windows:

```bash
# Start both backend and frontend servers
startup.bat
```
*(Optionally, use `start-backend.bat` or `run-backend.bat` for isolated backend execution).*

### 👨‍💻 Manual Setup

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/amanjeet233/HEALTHCARELAB.git
cd HEALTHCARELAB
```

#### 2️⃣ Backend Initialization
Ensure your database is running, then navigate to the backend directory:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
> 📍 **API Endpoint:** `http://localhost:8080`

#### 3️⃣ Frontend Initialization
Open a new integrated terminal instance:
```bash
cd frontend
npm install
npm run dev
```
> 📍 **Application Access:** `http://localhost:5173`

---

## ⚙️ Environment Configuration

You must set up your environment variables. Reference the provided `.env.example` files:
- `backend/src/main/resources/application.properties` (Database credentials, JWT secret)
- `frontend/.env` (API endpoints, e.g., `VITE_API_URL=http://localhost:8080`)

---

## 🧪 Testing Guidelines

- **Frontend E2E:** 
  Navigate to `/frontend` and run Playwright tests:
  ```bash
  npm run test:e2e
  ```
- **Backend API:** 
  Import the Postman components located in `/postman` into your Postman workspace:
  - `postman_collection.json`
  - `Healthcare Local.postman_environment.json`

---

## 📂 Repository Structure

```tree
📦 HEALTHCARELAB
 ┣ 📂 backend/         # Java APIs, Services, Entities
 ┣ 📂 frontend/        # React components, Pages, Hooks
 ┣ 📂 docs/            # Technical specifications & design references
 ┣ 📂 postman/         # QA assets and test environments
 ┗ 📂 load-test/       # Performance testing scripts
```

---

## 🤝 Contributing & Support

We welcome contributions to the Healthcare Lab platform. Please follow the standard fork-and-pull mechanism and ensure your code is covered by adequate Playwright/JUnit tests before requesting a merge.

## 📜 License

This repository and its source code are strictly intended for educational and internal development use. Please consult the [LICENSE](./LICENSE) file for distribution and usage rights.

<br/>
<div align="center">
  <i>Designed and built for modern healthcare infrastructure.</i><br/>
  <b>Made with ❤️ by AMANJEET KUMAR</b> <br/>
  <i>Instagram: <a href="https://instagram.com/amanjeet233">@amanjeet233</a></i> <br/>
  <b>© 2026 Healthcare Lab Team</b>
</div>

