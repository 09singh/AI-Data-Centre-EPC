# Frontend Integration Guide
## AI Data Centre EPC Platform

This document explains how the React frontend should communicate with the Express backend.

---

# Overall Architecture

```
                React Frontend
                       │
                       │ REST API
                       ▼
          Express.js Backend (Node.js)
               │               │
               │               │
               ▼               ▼
          MongoDB        FastAPI AI Layer
```

> **Important**
>
> The frontend **never communicates directly with the AI Layer**.
>
> Every request goes through the Express backend.

---

# Base URL

Development

```
http://localhost:5000/api
```

---

# Response Format

Every API returns the same structure.

Success Response

```json
{
    "success": true,
    "data": {}
}
```

Error Response

```json
{
    "success": false,
    "message": "Something went wrong"
}
```

---

# Authentication

## Register

POST

```
/auth/register
```

Body

```json
{
    "name":"John",
    "email":"john@gmail.com",
    "password":"123456"
}
```

---

## Login

POST

```
/auth/login
```

Body

```json
{
    "email":"john@gmail.com",
    "password":"123456"
}
```

Response

```json
{
    "success":true,
    "token":"JWT_TOKEN",
    "user":{}
}
```

---

# Save Token

After login

```javascript
localStorage.setItem("token", response.data.token);
```

---

# Send Token

Every protected request must include

```
Authorization: Bearer JWT_TOKEN
```

Axios Example

```javascript
axios.get(url,{
    headers:{
        Authorization:`Bearer ${token}`
    }
})
```

---

# Projects

## Create Project

POST

```
/projects
```

Body

```json
{
    "name":"Data Centre Phase 1",
    "company":"ABC Ltd",
    "location":"Delhi",
    "description":"Project Description"
}
```

---

## Get All Projects

GET

```
/projects
```

Response

```json
{
  "success":true,
  "data":[]
}
```

Frontend

Display

- Project Name
- Company
- Status
- Created Date

---

## Project Details

GET

```
/projects/:projectId
```

Display

- Project Information
- Uploaded Documents
- Compliance
- Reports
- Recommendations

---

# Documents

## Upload Document

POST

```
/documents/upload
```

Content Type

```
multipart/form-data
```

Fields

```
projectId
file
```

React Example

```javascript
const formData=new FormData();

formData.append("projectId",projectId);

formData.append("file",selectedFile);

await axios.post(
"/api/documents/upload",
formData
);
```

---

## Get Documents

GET

```
/documents
```

Display

- File Name
- Upload Date
- Status

---

# AI Chat

POST

```
/ai/chat
```

Body

```json
{
    "documentId":"xxxx",
    "question":"Summarize this document"
}
```

Display

```
Question

↓

Loading

↓

AI Response
```

---

# AI Search

POST

```
/ai/search
```

Body

```json
{
    "query":"Generator Capacity"
}
```

Display

Search Results

---

# Compliance

Generate Compliance Report

POST

```
/compliance
```

Body

```json
{
    "projectId":"...",
    "documentId":"..."
}
```

Display

- Compliance Score
- Risk Level
- Violations
- Suggestions

---

# Recommendations

Generate Recommendation

POST

```
/recommendations
```

Body

```json
{
    "projectId":"...",
    "documentId":"..."
}
```

Display

Cards

```
Priority

Category

Title

Description

Status
```

---

# Reports

Generate Report

POST

```
/reports
```

Body

```json
{
    "projectId":"...",
    "documentId":"..."
}
```

Display

- Report Title
- Summary
- Download Button

---

# Loading State

Before every API call

```
Loading...
```

After Success

```
Display Data
```

After Error

```
Display Error Message
```

---

# Folder Structure

```
src/

components/

pages/

hooks/

services/

context/

utils/
```

---

# Services Folder

```
services/

api.js

auth.service.js

project.service.js

document.service.js

ai.service.js

compliance.service.js

recommendation.service.js

report.service.js
```

---

# Axios Configuration

```javascript
import axios from "axios";

const api=axios.create({
    baseURL:"http://localhost:5000/api"
});

api.interceptors.request.use(config=>{

const token=localStorage.getItem("token");

if(token){

config.headers.Authorization=`Bearer ${token}`;

}

return config;

});

export default api;
```

---

# Dashboard Flow

```
Login

↓

Projects

↓

Select Project

↓

Documents

↓

Upload Document

↓

AI Processes Document

↓

Compliance

↓

Recommendations

↓

Reports

↓

AI Chat
```

---

# UI Components

## Dashboard

- Total Projects
- Total Documents
- Compliance Score
- Active Risks

---

## Project Page

- Project Details
- Documents Table
- Upload Button

---

## Document Page

- Document Viewer
- AI Chat
- Compliance Button
- Recommendation Button
- Report Button

---

## Compliance Page

- Score
- Risk Chart
- Violations

---

## Recommendation Page

- Recommendation Cards
- Priority Badge
- Status Badge

---

## Report Page

- Report Summary
- Report Details
- Download Report

---

# Error Handling

Always handle

- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

Example

```javascript
try{

const response=await api.get("/projects");

}catch(error){

toast.error(error.response.data.message);

}
```

---

# Best Practices

- Use Axios Instance
- Store JWT Token
- Use React Context for Authentication
- Show Loading Indicators
- Handle API Errors
- Use Pagination for Large Lists
- Refresh Data After Create/Update/Delete
- Never call the FastAPI AI Layer directly from the frontend.
- All requests must go through the Express backend.
