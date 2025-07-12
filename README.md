# 🔐 OpenFGA Node.js Authorization Demo

This project demonstrates how to implement **fine-grained, relationship-based access control** using [OpenFGA](https://openfga.dev) inside a **Node.js** application.

Inspired by real-world authorization use-cases from platforms like **Google Drive** and **GitHub**, this demo shows how to model complex access patterns with simplicity and scalability.

---

## 📌 Features

- ✅ OpenFGA integration via official JavaScript SDK
- ✅ Define and manage authorization models (schema)
- ✅ Add relationship-based access rules using **tuples**
- ✅ Fine-grained permissions: owner, viewer, editor
- ✅ Share files with users dynamically
- ✅ Visualize and test policies using [OpenFGA Playground](https://play.fga.dev)
- ✅ Docker setup to run OpenFGA locally

---

## 📂 Project Structure

```bash
.
├── docker-compose.yml     # Sets up OpenFGA + Postgres
├── index.js               # Main Node.js server file
├── openfga.js             # FGA client configuration
├── README.md              # You're here :)
└── package.json
```
