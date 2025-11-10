# Student Feedback System - Backend

## Prerequisites

- Node.js (v18 or higher)
- MongoDB installed and running locally

## Setup Instructions

1. Install dependencies:
```bash
cd backend
npm install
```

2. Make sure MongoDB is running on your local machine:
```bash
mongod
```

3. The MongoDB connection URL is configured in `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/student_feedback
```

4. Start the backend server:
```bash
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login for admin, coordinator, or BSH
- `GET /api/auth/verify` - Verify JWT token

### Configuration
- `POST /api/config` - Create new configuration
- `GET /api/config` - Get all configurations (filtered by role)
- `GET /api/config/title/:title` - Get configuration by title
- `PUT /api/config/:id` - Update configuration
- `DELETE /api/config/:id` - Delete configuration (admin only)

### Feedback
- `POST /api/feedback/submit` - Submit student feedback (anonymous)
- `GET /api/feedback/summary` - Get feedback summary (admin only)
- `GET /api/feedback/responses` - Get all feedback responses (admin only)

## Default Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Coordinators
- CSE: `cse_coord` / `cse@2024`
- ECE: `ece_coord` / `ece@2024`
- EEE: `eee_coord` / `eee@2024`
- MECH: `mech_coord` / `mech@2024`
- CIVIL: `civil_coord` / `civil@2024`
- AI: `ai_coord` / `ai@2024`
- AIML: `aiml_coord` / `aiml@2024`
- DS: `ds_coord` / `ds@2024`
- CS: `cs_coord` / `cs@2024`
- IT: `it_coord` / `it@2024`
- MBA: `mba_coord` / `mba@2024`
- MCA: `mca_coord` / `mca@2024`

### BSH Coordinator
- Username: `bsh_coord`
- Password: `bsh@2024`
