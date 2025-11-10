import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { credentials } from '../config/credentials.js';

export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    console.log('Login attempt:', { username, role }); // Add logging

    if (!username || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          username: !username ? 'Username is required' : null,
          password: !password ? 'Password is required' : null,
          role: !role ? 'Role is required' : null
        }
      });
    }

    // Verify JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    let user = null;
    let userRole = null;
    let branch = null;
    let storedPassword = null;

    if (role === 'admin') {
      if (username === credentials.admin.username) {
        storedPassword = credentials.admin.password;
        user = { username: credentials.admin.username };
        userRole = 'admin';
      }
    } else if (role === 'coordinator') {
      const coordinator = credentials.coordinators[username];
      if (coordinator) {
        storedPassword = coordinator.password;
        user = { username };
        userRole = 'coordinator';
        branch = coordinator.branch;
      }
    } else if (role === 'bsh') {
      const bshUser = credentials.bsh[username];
      if (bshUser) {
        storedPassword = bshUser.password;
        user = { username };
        userRole = 'bsh';
      }
    }

    if (!user || !storedPassword || !bcrypt.compareSync(password, storedPassword)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: user.username, role: userRole, branch },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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
      body: req.body
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
