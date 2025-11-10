import bcrypt from 'bcryptjs';

// Helper function to hash passwords
const hashPassword = (password) => bcrypt.hashSync(password, 10);

export const credentials = {
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || hashPassword('admin123'),
    role: 'admin'
  },
  coordinators: {
    'cse_coord': { password: hashPassword('cse@2024'), role: 'coordinator', branch: 'CSE' },
    'ece_coord': { password: hashPassword('ece@2024'), role: 'coordinator', branch: 'ECE' },
    'eee_coord': { password: hashPassword('eee@2024'), role: 'coordinator', branch: 'EEE' },
    'mech_coord': { password: hashPassword('mech@2024'), role: 'coordinator', branch: 'MECH' },
    'civil_coord': { password: hashPassword('civil@2024'), role: 'coordinator', branch: 'CIVIL' },
    'ai_coord': { password: hashPassword('ai@2024'), role: 'coordinator', branch: 'AI' },
    'aiml_coord': { password: hashPassword('aiml@2024'), role: 'coordinator', branch: 'AIML' },
    'ds_coord': { password: hashPassword('ds@2024'), role: 'coordinator', branch: 'DS' },
    'cs_coord': { password: hashPassword('cs@2024'), role: 'coordinator', branch: 'CS' },
    'it_coord': { password: hashPassword('it@2024'), role: 'coordinator', branch: 'IT' },
    'mba_coord': { password: hashPassword('mba@2024'), role: 'coordinator', branch: 'MBA' },
    'mca_coord': { password: hashPassword('mca@2024'), role: 'coordinator', branch: 'MCA' }
  },
  bsh: {
    'bsh_coord': { password: hashPassword('bsh@2024'), role: 'bsh' }
  }
};
