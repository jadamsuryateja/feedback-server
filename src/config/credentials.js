import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Ensure admin password is properly hashed
const adminPassword = process.env.ADMIN_PASSWORD || 'demo799';
const hashedAdminPassword = adminPassword.startsWith('$2a$')
  ? adminPassword
  : hashPassword(adminPassword);

console.log('Admin credential setup:', {
  username: process.env.ADMIN_USERNAME || 'admin',
  passwordIsHashed: hashedAdminPassword.startsWith('$2a$'),
  passwordLength: hashedAdminPassword.length
});

// Add this temporary debug code at the top
console.log('Current process.env:', {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  NODE_ENV: process.env.NODE_ENV
});

export const credentials = {  // Add 'export' here
  admin: {
    username: process.env.ADMIN_USERNAME || 'surya',
    password: hashPassword('demo799'),
    role: 'admin'
  },
  coordinators: {
    'csecoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'CSE' },
    'ececoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'ECE' },
    'eeecoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'EEE' },
    'mechcoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'MECH' },
    'civilcoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'CIVIL' },
    'aicoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'AI' },
    'aimlcoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'AIML' },
    'dscoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'DS' },
    'cscoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'CS' },
    'itcoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'IT' },
    'mbacoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'MBA' },
    'mcacoord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'MCA' },
    'coord': { password: hashPassword('demo799'), role: 'coordinator' }
  },
  bsh: {
    'bshcoord': { password: hashPassword('demo799'), role: 'bsh' }
  }
};

// Debug logs
console.log('Admin credentials configured:', {
  username: credentials.admin.username,
  passwordHash: credentials.admin.password.substring(0, 10) + '...',
});

console.log('Credentials initialized:', {
  adminUsername: credentials.admin.username,
  adminPasswordHash: credentials.admin.password.substring(0, 10) + '...',
  coordinatorCount: Object.keys(credentials.coordinators).length,
  bshConfigured: !!credentials.bsh.bshcoord
});
