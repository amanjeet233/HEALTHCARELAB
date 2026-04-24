# 🏁 Getting Started with Healthcare Lab

> **Welcome to the premium health-tech ecosystem. Follow this guide to initialize, verify, and scale your local environment.**

---

## ⚡ Rapid Initialization

The fastest way to get the system running is using our standard automation:

```bash
# From the root directory
startup.bat
```

This will concurrently launch:
1. **Spring Boot Backend** (`http://localhost:8080`)
2. **React 19 Frontend** (`http://localhost:5173`)

---

## 📋 Initialization Checklist

### 1️⃣ Database Strategy
- **Auto-Schema:** Hibernate automatically manages your tables on startup.
- **Smart Seeding:** 500+ realistic Lab Tests are injected on first boot.
- **Roles & Users:** Core accounts (`patient@test.com`, `technician@test.com`, etc.) are auto-created with the correct permissions.

### 2️⃣ Environment Configuration
Ensure your `.env` and `application.properties` align with your local database credentials. Check the following:
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

### 3️⃣ Frontend Hydration
Navigate to `/frontend` and ensure dependencies are local:
```bash
npm install
npm run dev
```

---

## 🧪 Verification Steps

### API Health Check
Invoke a simple GET request to verify the server is breathing:
`GET http://localhost:8080/api/health`

### Postman Validation
1. Import the collection from `/postman`.
2. Select the **Healthcare Local** environment.
3. Run the **"Patient Login"** request.

---

## 📁 Key Documentation Paths

| Resource | Purpose |
| :--- | :--- |
| [API.md](../api/API.md) | Full REST resource documentation. |
| [ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md) | System design and data flow diagrams. |
| [CHANGELOG.md](../CHANGELOG.md) | Timeline of features and fixes. |
| [PLAN.md](../PLAN.md) | Development roadmap and strategy. |

---

## 🆘 Support & Oversight

The Healthcare Lab platform is managed by **AMANJEET KUMAR**. If you encounter system anomalies or configuration blockers, please refer to the [LOG_REFERENCE.md](./06-LOG_REFERENCE.md) or reach out via Instagram [@amanjeet233](https://instagram.com/amanjeet233).

---
<div align="center">
  <b>Designed for excellence. Built for health.</b>
</div>
