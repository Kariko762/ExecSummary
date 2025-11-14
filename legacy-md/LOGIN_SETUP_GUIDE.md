# Login System Setup Guide

## ✅ What's Been Created

### 1. **Authentication Context** (`cms-admin/src/contexts/AuthContext.tsx`)
- Manages authentication state across the CMS Admin app
- Handles login/logout operations
- Stores JWT tokens in localStorage
- Auto-verifies tokens on page load

### 2. **Login Pages**
- **CMS Admin**: `cms-admin/src/components/LoginPage.tsx`
- **Parent App**: `src/components/LoginPage.tsx`
- Beautiful gradient design with glassmorphism effects
- Show/hide password toggle
- Loading states and error handling
- Responsive design

### 3. **Protected Route Component** (`cms-admin/src/components/ProtectedRoute.tsx`)
- Wraps authenticated sections
- Shows login page if auth required and user not logged in
- Shows loading state while checking authentication

### 4. **Integration Complete**
- Both App.tsx files updated
- Checks `system-settings` in localStorage for auth requirements
- Parent App: Simple auth check
- CMS Admin: Full AuthContext with ProtectedRoute

## 🚀 How to Use

### Step 1: Set Admin Password

1. Generate a bcrypt hash for your password:
   ```bash
   # Install bcryptjs if not already
   npm install -g bcryptjs-cli
   
   # Or use Node.js
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
   ```

2. Update `cms-admin/src/data/users.json`:
   ```json
   {
     "users": [
       {
         "id": "1",
         "username": "admin",
         "passwordHash": "YOUR_GENERATED_HASH_HERE",
         ...
       }
     ]
   }
   ```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install `bcryptjs` and `jsonwebtoken`.

### Step 3: Start the Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

### Step 4: Enable Authentication

1. Start the CMS Admin:
   ```bash
   cd cms-admin
   npm run dev
   ```

2. Open http://localhost:5174 (CMS Admin)

3. Click the **Settings** menu → **System Settings**

4. Toggle **"Require Login"** for:
   - **Executive Summary App** (Parent App)
   - **CMS Admin Panel**

5. Click **Save Changes**

### Step 5: Test Login

1. Refresh the page or start the Parent App
2. You'll see the login page
3. Enter credentials:
   - Username: `admin`
   - Password: (whatever you set in users.json)
4. Click **Sign In**

## 🔐 User Management

### Current Default User

```json
{
  "username": "admin",
  "role": "admin",
  "permissions": {
    "parentApp": {
      "canView": true,
      "canEdit": false
    },
    "cmsAdmin": {
      "canView": true,
      "canEdit": true,
      "canManageUsers": true,
      "canManageSettings": true
    }
  }
}
```

### Adding More Users

You can add users via:
1. **Directly editing users.json** (manual)
2. **API endpoint** (recommended):

```bash
curl -X POST http://localhost:3001/api/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "editor1",
    "password": "password123",
    "email": "editor@example.com",
    "role": "editor"
  }'
```

## 📋 User Roles

### Admin
- Full access to everything
- Can manage users and system settings
- Can edit all content

### Editor  
- Can create and edit content
- Cannot manage users or settings
- Read/write access to CMS

### Viewer
- Read-only access
- Can view but not edit anything

## 🛠 API Endpoints

All endpoints are at `http://localhost:3001/api/auth/*`

- `POST /login` - Login with username/password
- `POST /verify` - Verify JWT token
- `POST /logout` - Logout (client-side token removal)
- `GET /users` - List all users (admin only)
- `POST /users` - Create new user (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: 24-hour expiry
- **Session Validation**: Auto-checks token on page load
- **Secure Storage**: Tokens stored in localStorage
- **Role-Based Access**: Granular permissions per user

## ⚙️ Configuration

### Change JWT Secret (Production)

Set environment variable:
```bash
# .env file in backend/
JWT_SECRET=your-super-secret-key-here
```

### Change Token Expiry

Edit `backend/api/auth.js`:
```javascript
const JWT_EXPIRY = '7d'; // 7 days instead of 24h
```

## 🎨 UI Features

- **Gradient Background**: Purple to raspberry gradient
- **Glassmorphism**: Frosted glass card effect
- **Glow Effects**: Subtle glow around card
- **Password Toggle**: Eye icon to show/hide password
- **Loading States**: Spinner during authentication
- **Error Display**: Beautiful error messages
- **Dark Mode**: Full dark mode support

## 📱 Responsive Design

- Mobile-optimized
- Tablet-friendly
- Desktop polished
- Touch-friendly buttons

## 🚨 Troubleshooting

### Login Page Not Showing
- Check System Settings → Authentication is enabled
- Verify `system-settings` in localStorage

### Login Fails with "Invalid credentials"
- Verify password hash in users.json matches your password
- Check backend is running on port 3001
- Check browser console for network errors

### Token Expired
- Tokens last 24 hours
- Simply log in again to get a new token

### Backend Not Starting
- Run `npm install` in backend directory
- Check port 3001 is not in use
- Verify users.json exists and is valid JSON

## 🎯 Next Steps

1. **User Management UI**: Build the Users tab in SystemSettingsManager
2. **Password Change**: Add password change functionality
3. **Password Reset**: Implement forgot password flow
4. **Token Refresh**: Auto-refresh tokens before expiry
5. **Audit Log**: Track user actions
6. **2FA**: Two-factor authentication (optional)

## 📄 Files Reference

- `backend/api/auth.js` - Authentication API
- `backend/README_AUTH.md` - Detailed API documentation
- `cms-admin/src/contexts/AuthContext.tsx` - Auth state management
- `cms-admin/src/components/LoginPage.tsx` - CMS login UI
- `cms-admin/src/components/ProtectedRoute.tsx` - Route protection
- `src/components/LoginPage.tsx` - Parent app login UI
- `cms-admin/src/data/users.json` - User database
- `cms-admin/src/types/auth.ts` - TypeScript types

---

**Your authentication system is now complete and ready to use!** 🎉

