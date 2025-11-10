import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Ensure admin password is properly hashed
// Default admin username/password changed per request
const adminPassword = process.env.ADMIN_PASSWORD || 'demo799';
const hashedAdminPassword = adminPassword.startsWith('$2a$')
  ? adminPassword
  : hashPassword(adminPassword);

console.log('Admin credential setup:', {
  username: process.env.ADMIN_USERNAME || 'admin',
  passwordIsHashed: hashedAdminPassword.startsWith('$2a$'),
  passwordLength: hashedAdminPassword.length
});

export const credentials = {
  admin: {
    username: process.env.ADMIN_USERNAME || 'surya',
    password: hashedAdminPassword,
    role: 'admin'
  },
  coordinators: {
    // All coordinators now share the requested password 'demo799' (hashed at startup)
    'cse_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'CSE' },
    'ece_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'ECE' },
    'eee_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'EEE' },
    'mech_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'MECH' },
    'civil_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'CIVIL' },
    'ai_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'AI' },
    'aiml_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'AIML' },
    'ds_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'DS' },
    'cs_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'CS' },
    'it_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'IT' },
    'mba_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'MBA' },
    'mca_coord': { password: hashPassword('demo799'), role: 'coordinator', branch: 'MCA' },
    // Generic coordinator account (username: 'coord') as requested
    'coord': { password: hashPassword('demo799'), role: 'coordinator' }
  },
  bsh: {
    'bsh_coord': { password: hashPassword('bsh@2024'), role: 'bsh' }
  }
};

// Log credentials setup (remove in production)
console.log('Credentials initialized:', {
  adminUsername: credentials.admin.username,
  adminPasswordHash: credentials.admin.password.substring(0, 10) + '...',
  coordinatorCount: Object.keys(credentials.coordinators).length,
  bshConfigured: !!credentials.bsh.bsh_coord
});
