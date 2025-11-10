import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { credentials } from '../config/credentials.js';

export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    console.log('Login attempt:', { 
      username, 
      role,
      hasPassword: !!password,
      envSecret: !!process.env.JWT_SECRET,
      adminUsername: credentials.admin.username,
      adminPasswordHash: credentials.admin.password.substring(0, 10) + '...'
    });

    // Validation
    if (!username || !password || !role) {
      console.log('Missing fields:', { username: !username, password: !password, role: !role });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          username: !username ? 'Username is required' : null,
          password: !password ? 'Password is required' : null,
          role: !role ? 'Role is required' : null
        }
      });
    }

    // JWT Secret check
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let user = null;
    let userRole = null;
    let branch = null;
    let storedPassword = null;

    // Admin login
    if (role === 'admin') {
      if (username === credentials.admin.username) {
        storedPassword = credentials.admin.password;
        user = { username: credentials.admin.username };
        userRole = 'admin';
        console.log('Admin login attempt');
      }
    } 
    // Coordinator login
    else if (role === 'coordinator') {
      const coordinator = credentials.coordinators[username];
      if (coordinator) {
        storedPassword = coordinator.password;
        user = { username };
        userRole = 'coordinator';
        branch = coordinator.branch;
        console.log('Coordinator login attempt:', { branch });
      }
    } 
    // BSH login
    else if (role === 'bsh') {
      const bshUser = credentials.bsh[username];
      if (bshUser) {
        storedPassword = bshUser.password;
        user = { username };
        userRole = 'bsh';
        console.log('BSH login attempt');
      }
    }

    // Check credentials
    if (!user || !storedPassword) {
      console.log('User not found or no stored password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, storedPassword);
    console.log('Password verification:', { 
      isValid: isValidPassword,
      providedPasswordLength: password.length,
      storedHashLength: storedPassword.length 
    });

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const tokenPayload = { 
      username: user.username, 
      role: userRole, 
      branch 
    };
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { 
      username: user.username, 
      role: userRole, 
      branch: branch || 'N/A' 
    });

    res.json({
      token,
      user: {
        username: user.username,
        role: userRole,
        branch
      }
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      body: {
        username: req.body.username,
        role: req.body.role,
        hasPassword: !!req.body.password
      }
    });
    
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const verify = async (req, res) => {
  res.json({ user: req.user });
};
