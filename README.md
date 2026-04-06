# HEALTHCARELAB

HEALTHCARELAB is a full-stack healthcare lab test booking platform.
It includes a Java Spring Boot backend and a modern frontend application for browsing tests, booking slots, and managing user workflows.

## Tech Stack

- Backend: Java, Spring Boot, Maven
- Frontend: TypeScript, Vite
- Database: SQL (migration scripts included)
- API Testing: Postman collections in repository

## Repository Structure

- `backend/` - Spring Boot APIs, entities, services, controllers, migrations, tests
- `frontend/` - Frontend application code and UI components
- `docs/` - Project guides, architecture, and operational documents
- `design-system/` - Design system references and specs
- `postman/` - Postman collections and environment files
- `load-test/` - Load testing assets and scripts

## Quick Start

### 1) Clone Repository

```bash
git clone https://github.com/amanjeet233/HEALTHCARELAB.git
cd HEALTHCARELAB
```

### 2) Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend typically starts on `http://localhost:8080`.

### 3) Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend typically starts on `http://localhost:5173`.

## API Testing

Use the included Postman files:

- `postman_collection.json`
- `Healthcare Local.postman_environment.json`
- `postman/Healthcare Lab Test Booking API - Working.postman_collection.json`

## Notes

- Ensure Java and Maven are installed for backend.
- Ensure Node.js and npm are installed for frontend.
- Configure environment variables as needed (see backend config and docs).

## License

This project is for educational and development use. Add a specific license if required.
