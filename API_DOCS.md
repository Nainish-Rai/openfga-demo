# RBAC Demo API Documentation

## Authentication

### POST /signup

Create a user account and get JWT token

```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "personId": "person1"
}
```

Response:

```json
{
  "username": "john.doe",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Setup APIs

### POST /api/departments

```json
{
  "id": "dept1",
  "name": "Engineering",
  "parentDeptId": null
}
```

### POST /api/persons

```json
{
  "id": "person1",
  "userId": "user1",
  "name": "John Doe",
  "deptId": "dept1",
  "directManagerId": null,
  "roles": ["compliance_officer"]
}
```

## Circular APIs

### GET /api/circulars

Get all circulars the user can read based on RBAC:

- Just user: direct assignments
- Manager: department circulars + subordinate circulars
- Cross-department Manager: own dept + subordinates from other depts
- Dept Head: all department circulars
- Compliance Officer: all department circulars (with CRUD)

### POST /api/circulars

Create a new circular (requires compliance_officer role)

```json
{
  "id": "circ1",
  "title": "New Policy Update",
  "assignedDeptId": "dept1",
  "parentCircularId": null
}
```

### PUT /api/circulars/:id

Update circular (creator or compliance_officer)

```json
{
  "title": "Updated Policy"
}
```

### DELETE /api/circulars/:id

Delete circular (compliance_officer only)

## Clause APIs

### GET /api/clauses

Get all clauses the user can read (inherits from parent circular)

### POST /api/clauses

Create a clause under a circular

```json
{
  "id": "clause1",
  "title": "Clause 1.1",
  "parentCircularId": "circ1",
  "assignedDeptId": "dept1"
}
```

### PUT /api/clauses/:id

Update clause

```json
{
  "title": "Updated Clause"
}
```

### DELETE /api/clauses/:id

Delete clause

## Task APIs

### GET /api/tasks

Get all tasks the user can read:

- Assignee can view
- Creator can view
- Manager of assignee can view
- Compliance officer via circular can view

### POST /api/tasks

Create a task

```json
{
  "id": "task1",
  "title": "Complete compliance review",
  "assigneePersonId": "person2",
  "relatedCircularId": "circ1",
  "relatedClauseId": "clause1"
}
```

### PUT /api/tasks/:id

Update task

```json
{
  "title": "Updated task title"
}
```

### PATCH /api/tasks/:id/complete

Mark task as completed

### DELETE /api/tasks/:id

Delete task

## Sharing APIs

### POST /api/share/circulars/:id/share

Share circular with specific person

```json
{
  "personId": "person3"
}
```

### POST /api/share/circulars/:id/assign-subordinate

Assign circular to subordinate (manager visibility)

```json
{
  "personId": "person4"
}
```

### POST /api/share/tasks/:id/reassign

Reassign task to another person

```json
{
  "personId": "person5"
}
```

## Utility APIs

### POST /api/access/check

Check if user has specific permission

```json
{
  "user": "person:person1",
  "relation": "can_read",
  "object": "circular:circ1"
}
```

## RBAC Use Cases

### 1. Just User Case

User sees only circulars directly assigned to them

- Login as regular user
- GET /api/circulars returns only direct assignments

### 2. Manager Case

Manager sees department circulars + subordinate circulars

- Login as manager
- GET /api/circulars returns dept + subordinate items

### 3. Cross-Department Manager

Manager from dept A managing person in dept B

- Sees own department circulars
- Sees subordinate's circulars from dept B
- GET /api/circulars returns both

### 4. Department Head Case

Dept head can read all department-level circulars

- Login as dept_head
- GET /api/circulars returns all dept circulars
- No create/update/delete (read-only)

### 5. Compliance Officer Case

Full CRUD on all department circulars

- Login as compliance_officer
- GET /api/circulars returns all dept circulars
- POST /api/circulars creates new
- PUT /api/circulars/:id updates
- DELETE /api/circulars/:id deletes
