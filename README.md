# 🔐 OpenFGA RBAC Demo - Compliance Management System

Comprehensive demonstration of Role-Based Access Control (RBAC) using [OpenFGA](https://openfga.dev) with a real-world compliance management scenario featuring circulars, clauses, and tasks.

## 🎯 RBAC Use Cases Demonstrated

### 1. Just User Case

Regular employees see only circulars directly assigned to them.

### 2. Manager Case

Managers see department circulars AND their subordinates' circulars.

### 3. Cross-Department Manager

Managers can oversee subordinates from different departments and access their circulars.

### 4. Department Head Case

Department heads have read access to all department-level circulars.

### 5. Compliance Officer Case

Full CRUD permissions on all department circulars.

---

## 📂 Project Structure

```
.
├── controllers/
│   ├── circulars.js       # Circular CRUD APIs
│   ├── clauses.js         # Clause CRUD APIs
│   ├── tasks.js           # Task CRUD APIs
│   └── sharing.js         # Permission sharing APIs
├── middlewares/
│   └── auth.js            # JWT authentication
├── models/                # Mongoose models
├── services/
│   └── tupleSync.js       # OpenFGA tuple management
├── docker-compose.yml     # OpenFGA + Postgres setup
├── index.js               # Express server
├── routes.js              # API router
├── openfga.js             # OpenFGA client
├── demo-setup.js          # Demo data setup script
└── API_DOCS.md            # Complete API documentation
```

---

## � Quick Start

### 1. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
MONGO_URI=mongodb://localhost:27017/compliance
OPENFGA_API_URL=http://localhost:8080
OPENFGA_STORE_ID=your-store-id
OPENFGA_MODEL_ID=your-model-id
JWT_SECRET=mysupersecret
PORT=8000
```

### 2. Start Services

```bash
docker compose up -d
pnpm install
pnpm dev
```

### 3. Load Demo Data

```bash
node demo-setup.js
```

---

## 📋 API Endpoints

### Authentication

- `POST /signup` - Create user and get JWT token

### Setup

- `POST /api/departments` - Create department
- `POST /api/persons` - Create person with roles

### Circulars

- `GET /api/circulars` - List accessible circulars (RBAC filtered)
- `POST /api/circulars` - Create circular (compliance officer)
- `PUT /api/circulars/:id` - Update circular
- `DELETE /api/circulars/:id` - Delete circular

### Clauses

- `GET /api/clauses` - List accessible clauses
- `POST /api/clauses` - Create clause
- `PUT /api/clauses/:id` - Update clause
- `DELETE /api/clauses/:id` - Delete clause

### Tasks

- `GET /api/tasks` - List accessible tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/complete` - Complete task
- `DELETE /api/tasks/:id` - Delete task

### Sharing

- `POST /api/share/circulars/:id/share` - Share with person
- `POST /api/share/circulars/:id/assign-subordinate` - Assign to subordinate
- `POST /api/share/tasks/:id/reassign` - Reassign task

### Utility

- `POST /api/access/check` - Check permissions

See [API_DOCS.md](./API_DOCS.md) for detailed examples.

---

## 🧪 Testing RBAC Scenarios

### Scenario 1: Regular Employee (Eve)

```bash
# Login as Eve
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"eve","email":"eve@example.com","personId":"eve"}'

# Get circulars (sees only circ2 - direct assignment)
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <eve-token>"
```

### Scenario 2: Manager (Charlie)

```bash
# Login as Charlie
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"charlie","email":"charlie@example.com","personId":"charlie"}'

# Get circulars (sees dept circulars + Dave's circulars)
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <charlie-token>"
```

### Scenario 3: Department Head (Bob)

```bash
# Login as Bob
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@example.com","personId":"bob"}'

# Get circulars (sees all dept1 circulars - read only)
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <bob-token>"
```

### Scenario 4: Compliance Officer (Alice)

```bash
# Login as Alice
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","personId":"alice"}'

# Full CRUD on circulars
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <alice-token>"

curl -X POST http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <alice-token>" \
  -H "Content-Type: application/json" \
  -d '{"id":"circ3","title":"New Policy","assignedDeptId":"dept1"}'
```

---

## 🔑 Authorization Model

The system implements a comprehensive RBAC model with:

- **Departments** - Hierarchical with parent relationships
- **Persons** - Users with roles (manager, dept_head, compliance_officer)
- **Circulars** - Department-level documents with cascading permissions
- **Clauses** - Sub-sections of circulars
- **Tasks** - Assignable work items linked to circulars/clauses

### Key Relations

- `can_read` - View permission (inherited through hierarchy)
- `can_create` - Create permission (compliance officers)
- `can_update` - Modify permission (creators, compliance officers)
- `can_delete` - Delete permission (compliance officers)
- `reports_to` - Transitive manager relationship

---

## 🛠 Built With

- [OpenFGA](https://openfga.dev) - Authorization engine
- [Express.js](https://expressjs.com) - Web framework
- [MongoDB](https://www.mongodb.com) - Database
- [Mongoose](https://mongoosejs.com) - ODM
- [JWT](https://jwt.io) - Authentication

---

## 📖 Learn More

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA Playground](https://play.fga.dev)
- [Authorization Modeling](https://openfga.dev/docs/modeling)

---

## 📝 License

MIT
