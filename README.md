# AI-Data-Centre-EPC
AI-powered copilot for Data Centre EPC (Engineering, Procurement &amp; Construction) projects. It verifies technical documents, predicts schedule risks, and provides instant engineering knowledge using RAG and AI, helping teams reduce errors, improve quality, and make faster, data-driven decisions.



# Backend Integration Guide

This document explains how to set up and use the backend for frontend development.

---

# Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt / bcryptjs
- Cookie Parser
- CORS
- Dotenv

---

# Project Setup

## 1. Clone the repository

```bash
git clone <repository-url>
```

---

## 2. Navigate to the backend folder

```bash
cd Backend
```

---

## 3. Install dependencies

```bash
npm install
```

The backend uses the following dependencies:

```json
{
  "bcrypt": "^6.0.0",
  "bcryptjs": "^3.0.3",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.7.4"
}
```

---

## 4. Environment Variables

Create a `.env` file inside the Backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 5. Start the server

```bash
node server.js
```

or

```bash
npm start
```

The backend will run on

```
http://localhost:5000
```

---

# Base URL

```
http://localhost:5000
```

---

# Authentication API

Base Route

```
/api/auth
```

---

## Register User

### Endpoint

```
POST /api/auth/register
```

### Description

Creates a new user account.

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

## Login User

### Endpoint

```
POST /api/auth/login
```

### Description

Authenticates an existing user.

### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<JWT Token>"
}
```

---

# Authentication

The backend uses **JWT (JSON Web Token)** for authentication.

After login:

- Store the JWT token securely.
- Include it in protected requests if required.

Example:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# Headers

```
Content-Type: application/json
```

---

# Frontend Integration Example

### Register

```javascript
await fetch("http://localhost:5000/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name,
    email,
    password
  })
});
```

---

### Login

```javascript
const response = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    password
  })
});

const data = await response.json();
```

---

# Folder Structure

```
Backend
│
├── src/
│   ├── Features/
│   │   └── auth/
│   │       ├── route/
│   │       ├── controller/
│   │       ├── model/
│   │       └── middleware/
│   │
│   └── config/
│
├── server.js
├── package.json
└── .env
```

---

# Notes for Frontend Developer

- Backend runs on **http://localhost:5000**
- All authentication routes start with **/api/auth**
- Use **POST** requests for Register and Login.
- Send request bodies as JSON.
- Store the JWT token after successful login.
- Include the JWT token in the `Authorization` header for protected routes (if applicable).
- Handle API errors gracefully and display user-friendly messages.

---

# Available Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate an existing user |
