# Postman Collection — OpenFGA RBAC Demo

This repo includes a ready-to-use Postman collection to demo the RBAC scenarios.

## Files

- `postman/OpenFGA RBAC Demo.postman_collection.json` — Requests grouped by scenarios
- `postman/Local.postman_environment.json` — Environment with `BASE_URL`

## Prerequisites

1. Start dependencies (MongoDB, OpenFGA) and the app
2. Seed demo data

```powershell
# from repo root
pnpm i
pnpm dev  # server should run at http://localhost:8000
node .\demo-setup.js  # creates users, departments, circulars, and FGA tuples
```

## Import into Postman

1. File > Import > select both JSON files from the `postman/` folder
2. Select the environment "OpenFGA Demo - Local" (or update to your local setting)

## Usage Flow

1. In the "Auth" folder, run all five Signup requests to capture JWTs into collection variables
2. Use the "Scenarios" folder to exercise:
   - Just User (Eve): sees only direct assignments
   - Manager (Charlie): sees department + subordinates
   - Dept Head (Bob): read-all for dept; create is forbidden
   - Compliance Officer (Alice): full CRUD on dept circulars
   - Cross-Department Manager: create subordinate in another dept and verify visibility
3. Try "Sharing" to grant person-specific or manager-subordinate visibility
4. Use "Tasks" to create/complete/review tasks across roles
5. "Access Checks" to call the utility endpoint directly

## Notes

- If you re-run `demo-setup.js`, you may need to re-run "Signup" to refresh tokens
- The collection assumes base URL `http://localhost:8000`; change the environment if needed
- For the Cross-Department scenario, a subordinate from `dept2` is created (`frank`) and assigned a circular by the manager (Charlie)
