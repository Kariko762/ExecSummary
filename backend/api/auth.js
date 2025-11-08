// Authentication API endpoints
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Path to users.json
const USERS_FILE = path.join(__dirname, '../../cms-admin/src/data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// Helper: Read users from JSON file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    throw new Error('Failed to read users data');
  }
}

// Helper: Write users to JSON file
async function writeUsers(usersData) {
  try {
    usersData.lastUpdated = new Date().toISOString();
    await fs.writeFile(USERS_FILE, JSON.stringify(usersData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error('Failed to save users data');
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const usersData = await readUsers();
    const user = usersData.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Compare password with hash
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await writeUsers(usersData);

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
      expiresIn: JWT_EXPIRY
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists and is active
    const usersData = await readUsers();
    const user = usersData.users.find(u => u.id === decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      valid: true,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // With JWT, logout is client-side (remove token)
  // Could implement token blacklist if needed
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/users (admin only)
router.get('/users', async (req, res) => {
  try {
    // TODO: Add authentication middleware
    const usersData = await readUsers();
    
    // Remove password hashes from response
    const usersWithoutPasswords = usersData.users.map(({ passwordHash, ...user }) => user);

    res.json({
      users: usersWithoutPasswords,
      roles: usersData.roles
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/users (admin only - create new user)
router.post('/users', async (req, res) => {
  try {
    // TODO: Add authentication middleware + admin check
    const { username, password, email, role } = req.body;

    if (!username || !password || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const usersData = await readUsers();

    // Check if username already exists
    if (usersData.users.find(u => u.username === username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: String(Date.now()),
      username,
      passwordHash,
      email,
      role,
      permissions: usersData.roles[role].defaultPermissions,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };

    usersData.users.push(newUser);
    await writeUsers(usersData);

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/users/:id (admin only - update user)
router.put('/users/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware + admin check
    const { id } = req.params;
    const { email, role, permissions, isActive } = req.body;

    const usersData = await readUsers();
    const userIndex = usersData.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    if (email) usersData.users[userIndex].email = email;
    if (role) {
      usersData.users[userIndex].role = role;
      usersData.users[userIndex].permissions = usersData.roles[role].defaultPermissions;
    }
    if (permissions) usersData.users[userIndex].permissions = permissions;
    if (typeof isActive !== 'undefined') usersData.users[userIndex].isActive = isActive;

    await writeUsers(usersData);

    const { passwordHash, ...userWithoutPassword } = usersData.users[userIndex];

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/auth/users/:id (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware + admin check
    const { id } = req.params;

    const usersData = await readUsers();
    const userIndex = usersData.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    usersData.users.splice(userIndex, 1);
    await writeUsers(usersData);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
