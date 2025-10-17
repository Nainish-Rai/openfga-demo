# RBAC Testing Examples

This file contains curl examples for testing all RBAC use cases.

## Setup Demo Data First

```bash
node demo-setup.js
```

This creates:

- Alice: Compliance Officer (dept1)
- Bob: Department Head (dept1)
- Charlie: Manager (dept1)
- Dave: Employee reporting to Charlie (dept1)
- Eve: Employee with direct access to circ2 (dept1)

## 1. Get JWT Tokens

### Alice (Compliance Officer)

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","personId":"alice"}'
```

### Bob (Dept Head)

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@example.com","personId":"bob"}'
```

### Charlie (Manager)

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"charlie","email":"charlie@example.com","personId":"charlie"}'
```

### Dave (Employee - reports to Charlie)

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"dave","email":"dave@example.com","personId":"dave"}'
```

### Eve (Employee - direct viewer)

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"eve","email":"eve@example.com","personId":"eve"}'
```

Save the tokens from each response!

## 2. Test RBAC Scenarios

### Scenario 1: Just User Case (Eve)

Eve should only see circulars directly assigned to her (circ2).

```bash
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <EVE_TOKEN>"
```

Expected: `{"circulars": [circ2]}`

### Scenario 2: Manager Case (Charlie)

Charlie should see:

- Department circulars (dept1)
- His subordinate Dave's circulars

```bash
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <CHARLIE_TOKEN>"
```

Expected: All dept1 circulars

### Scenario 3: Department Head Case (Bob)

Bob can read all dept1 circulars but cannot create/update/delete.

```bash
# Can read
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <BOB_TOKEN>"

# Cannot create (will fail)
curl -X POST http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <BOB_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id":"circ3","title":"Test","assignedDeptId":"dept1"}'
```

Expected: Read succeeds, create fails with 403

### Scenario 4: Compliance Officer Case (Alice)

Alice has full CRUD on all dept1 circulars.

```bash
# Read all
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <ALICE_TOKEN>"

# Create new
curl -X POST http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <ALICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id":"circ3","title":"New Policy","assignedDeptId":"dept1"}'

# Update
curl -X PUT http://localhost:8000/api/circulars/circ3 \
  -H "Authorization: Bearer <ALICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Policy"}'

# Delete
curl -X DELETE http://localhost:8000/api/circulars/circ3 \
  -H "Authorization: Bearer <ALICE_TOKEN>"
```

Expected: All operations succeed

## 3. Test Sharing Features

### Share Circular (Alice shares circ1 with Dave)

```bash
curl -X POST http://localhost:8000/api/share/circulars/circ1/share \
  -H "Authorization: Bearer <ALICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"personId":"dave"}'
```

Now Dave should see circ1:

```bash
curl http://localhost:8000/api/circulars \
  -H "Authorization: Bearer <DAVE_TOKEN>"
```

### Assign to Subordinate (Charlie assigns circular to Dave)

```bash
curl -X POST http://localhost:8000/api/share/circulars/circ2/assign-subordinate \
  -H "Authorization: Bearer <CHARLIE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"personId":"dave"}'
```

Charlie can now see Dave's assigned circulars through manager relationship.

## 4. Test Task Management

### Create Task (Alice)

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <ALICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"task1",
    "title":"Review compliance",
    "assigneePersonId":"dave",
    "relatedCircularId":"circ1"
  }'
```

### View Tasks (Dave can see his assigned task)

```bash
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <DAVE_TOKEN>"
```

### Complete Task (Dave)

```bash
curl -X PATCH http://localhost:8000/api/tasks/task1/complete \
  -H "Authorization: Bearer <DAVE_TOKEN>"
```

### View Tasks as Manager (Charlie sees Dave's tasks)

```bash
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <CHARLIE_TOKEN>"
```

Charlie can see Dave's tasks because he's Dave's manager.

## 5. Permission Checks

### Check if Alice can CRUD circulars

```bash
curl -X POST http://localhost:8000/api/access/check \
  -H "Content-Type: application/json" \
  -d '{
    "user":"person:alice",
    "relation":"can_crud_circulars",
    "object":"department:dept1"
  }'
```

Expected: `{"allowed": true}`

### Check if Eve can read circ1

```bash
curl -X POST http://localhost:8000/api/access/check \
  -H "Content-Type: application/json" \
  -d '{
    "user":"person:eve",
    "relation":"can_read",
    "object":"circular:circ1"
  }'
```

Expected: `{"allowed": false}` (Eve only has access to circ2)

## Summary

- **Eve (Just User)**: Sees only circ2 (direct assignment)
- **Dave (Employee)**: Sees circulars assigned to him + shared ones
- **Charlie (Manager)**: Sees dept circulars + subordinate Dave's circulars
- **Bob (Dept Head)**: Reads all dept1 circulars (no write access)
- **Alice (Compliance Officer)**: Full CRUD on all dept1 circulars

All examples demonstrate fine-grained RBAC with OpenFGA!
