import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { credentials } from '../config/credentials.js';

export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Add request validation logging
    console.log('Login request:', {
      username,
      role,
      hasPassword: !!password,
      headers: req.headers,
      body: req.body
    });

    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: {
          username: !username,
          password: !password,
          role: !role
        }
      });
    }

    // Add credentials check logging
    console.log('Checking credentials for:', {
      role,
      username,
      adminUser: credentials.admin.username,
      coordinatorExists: role === 'coordinator' && !!credentials.coordinators[username],
      bshExists: role === 'bsh' && !!credentials.bsh[username]
    });

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
      }
    } 
    // BSH login
    else if (role === 'bsh') {
      const bshUser = credentials.bsh[username];
      if (bshUser) {
        storedPassword = bshUser.password;
        user = { username };
        userRole = 'bsh';
      }
    }

    // Debug user resolution
    console.log('User resolution:', {
      found: !!user,
      hasStoredPassword: !!storedPassword,
      resolvedRole: userRole,
      branch: branch || 'N/A'
    });

    if (!user || !storedPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'User not found or invalid role'
      });
    }

    // Verify password with debug info
    console.log('Password verification details:', {
      providedPassword: password,
      storedPasswordHash: storedPassword,
      adminUsername: credentials.admin.username,
      attemptedUsername: username,
      roleMatch: role === userRole
    });

    const isValidPassword = await bcrypt.compare(password, storedPassword);
    
    console.log('Password verification:', {
      providedPasswordLength: password.length,
      storedHashLength: storedPassword.length,
      isValid: isValidPassword,
      role: userRole,
      username
    });

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Password verification failed',
        debug: process.env.NODE_ENV === 'development' ? {
          userFound: !!user,
          roleMatched: role === userRole,
          passwordLength: password.length
        } : undefined
      });
    }

    // Verify JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'JWT secret is not configured'
      });
    }

    // Create token with error handling
    let token;
    try {
      token = jwt.sign(
        { username: user.username, role: userRole, branch },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    } catch (jwtError) {
      console.error('JWT signing error:', jwtError);
      return res.status(500).json({
        error: 'Token generation failed',
        details: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }

    // Send success response
    return res.status(200).json({
      token,
      user: {
        username: user.username,
        role: userRole,
        branch
      }
    });

  } catch (error) {
    // Enhanced error logging
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      body: req.body
    });

    return res.status(500).json({
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const verify = async (req, res) => {
  res.json({ user: req.user });
};
