# Quick Reference

## Setup Commands

```bash
cp .env.example .env          # Configure environment
docker compose up -d          # Start OpenFGA + Postgres
pnpm install                  # Install dependencies
pnpm dev                      # Start server
node demo-setup.js            # Load demo data
```

## API Endpoints

### Circulars (RBAC Filtered)

- `GET /api/circulars` - List accessible circulars
- `POST /api/circulars` - Create (compliance officer)
- `PUT /api/circulars/:id` - Update
- `DELETE /api/circulars/:id` - Delete

### Clauses

- `GET /api/clauses` - List accessible clauses
- `POST /api/clauses` - Create
- `PUT /api/clauses/:id` - Update
- `DELETE /api/clauses/:id` - Delete

### Tasks

- `GET /api/tasks` - List accessible tasks
- `POST /api/tasks` - Create
- `PUT /api/tasks/:id` - Update
- `PATCH /api/tasks/:id/complete` - Complete
- `DELETE /api/tasks/:id` - Delete

### Sharing

- `POST /api/share/circulars/:id/share` - Share with person
- `POST /api/share/circulars/:id/assign-subordinate` - Assign to subordinate
- `POST /api/share/tasks/:id/reassign` - Reassign task

### Setup

- `POST /signup` - Get JWT token
- `POST /api/departments` - Create department
- `POST /api/persons` - Create person with roles
- `POST /api/access/check` - Check permission

## Demo Users

| User    | Role               | Permissions                  |
| ------- | ------------------ | ---------------------------- |
| Alice   | Compliance Officer | Full CRUD on dept circulars  |
| Bob     | Dept Head          | Read all dept circulars      |
| Charlie | Manager            | Dept + subordinate circulars |
| Dave    | Employee           | Reports to Charlie           |
| Eve     | Employee           | Direct viewer of circ2 only  |

## Test Example

```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","personId":"alice"}' \
  | jq -r '.token')

# 2. List circulars
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer $TOKEN"

# 3. Create circular
curl -X POST http://localhost:8000/api/circulars \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"circ3","title":"New Policy","assignedDeptId":"dept1"}'
```

## RBAC Scenarios

1. **Just User (Eve)**: `GET /api/circulars` → only circ2
2. **Manager (Charlie)**: `GET /api/circulars` → dept + subordinate circulars
3. **Dept Head (Bob)**: `GET /api/circulars` → all dept (read-only)
4. **Compliance (Alice)**: Full CRUD access
5. **Cross-Dept Manager**: See subordinates across departments

## File Structure

```
controllers/
  ├── circulars.js    # Circular endpoints
  ├── clauses.js      # Clause endpoints
  ├── tasks.js        # Task endpoints
  └── sharing.js      # Permission sharing
services/
  ├── permissions.js  # Helper functions
  └── tupleSync.js    # OpenFGA tuple management
middlewares/
  └── auth.js         # JWT authentication
models/               # Mongoose schemas
```

## Documentation

- `API_DOCS.md` - Complete API documentation
- `TESTING.md` - Testing guide with curl examples
- `PROJECT_SUMMARY.md` - Project overview
- `README.md` - Setup and usage

## Key Features

✅ Simple, clean APIs (like the example provided)
✅ No files over 250 lines
✅ No comments (self-documenting code)
✅ All 5 RBAC use cases implemented
✅ OpenFGA integration with js-sdk
✅ Permission helper functions
✅ Controller-based architecture
✅ Demo data script included
