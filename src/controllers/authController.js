import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { credentials } from '../config/credentials.js';

export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verify = async (req, res) => {
  res.json({ user: req.user });
};
