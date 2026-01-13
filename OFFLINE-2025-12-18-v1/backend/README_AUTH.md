# Authentication System Documentation

## Overview

The Executive Summary application now includes a JSON file-based authentication system with JWT tokens. This allows you to control access to both the Parent App (Executive Summary Dashboard) and CMS Admin Panel.

## Architecture

### User Data Storage
- **Location**: `cms-admin/src/data/users.json`
- **Format**: JSON file containing users array and roles definitions
- **Password Security**: Passwords are hashed using bcrypt (10 salt rounds)

### Authentication Flow
1. User submits login credentials (username/password)
2. Backend validates against `users.json`
3. If valid, JWT token is generated (24h expiry)
4. Token is stored in localStorage on client
5. Token is sent with each subsequent API request
6. Backend verifies token before processing protected routes

## API Endpoints

### POST `/api/auth/login`
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": {...},
    "isActive": true
  },
  "expiresIn": "24h"
}
```

### POST `/api/auth/verify`
Verify if current token is still valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {...}
}
```

### POST `/api/auth/logout`
Logout (client-side token removal).

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### GET `/api/auth/users` (Admin Only)
Get all users (without password hashes).

**Response:**
```json
{
  "users": [...],
  "roles": {...}
}
```

### POST `/api/auth/users` (Admin Only)
Create a new user.

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "role": "editor"
}
```

### PUT `/api/auth/users/:id` (Admin Only)
Update user details.

**Request:**
```json
{
  "email": "newemail@example.com",
  "role": "viewer",
  "isActive": false
}
```

### DELETE `/api/auth/users/:id` (Admin Only)
Delete a user.

## User Roles

### Admin
- Full access to all features
- Can manage users and system settings
- Can create/edit/delete content in CMS
- Can view Executive Summary Dashboard

### Editor
- Can create and edit content in CMS
- Cannot manage users or system settings
- Can view Executive Summary Dashboard

### Viewer
- Read-only access to CMS
- Can view Executive Summary Dashboard
- Cannot edit or manage anything

## Permissions Structure

```typescript
{
  parentApp: {
    canView: boolean,
    canEdit: boolean
  },
  cmsAdmin: {
    canView: boolean,
    canEdit: boolean,
    canManageUsers: boolean,
    canManageSettings: boolean
  }
}
```

## Default User

**Username**: `admin`  
**Password**: You'll need to generate a bcrypt hash and update `users.json`  
**Role**: admin

### Generating Password Hash

Use this script to generate a password hash:

```javascript
import bcrypt from 'bcryptjs';
const password = 'your-password-here';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

Or use an online bcrypt generator (search "bcrypt hash generator").

## System Settings Integration

The `SystemSettingsManager` component in the CMS Admin allows you to toggle authentication requirements:

- **Parent App - Require Login**: Forces users to log in before viewing Executive Summary
- **CMS Admin - Require Login**: Forces users to log in before accessing CMS Admin Panel

When disabled, apps are accessible without authentication (open access).

## Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in production via environment variable
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
4. **Password Policy**: Implement password complexity requirements as needed
5. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks
6. **Token Expiry**: Default is 24 hours; adjust `JWT_EXPIRY` as needed

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Update `users.json` with your admin password hash

3. Start backend server:
```bash
npm run dev
```

4. Test authentication:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

## Next Steps

1. **Create Login UI**: Build login page components for both apps
2. **Auth Context**: Create React context to manage auth state
3. **Protected Routes**: Add route guards to check authentication
4. **Token Refresh**: Implement token refresh logic before expiry
5. **User Management UI**: Build the Users tab in SystemSettingsManager
