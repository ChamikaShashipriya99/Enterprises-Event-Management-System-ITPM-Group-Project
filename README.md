# Enterprise Event Management System (EEMS) – User Management Module

## Project Overview
The **Enterprise Event Management System (EEMS)** is a robust platform designed to facilitate the orchestration of corporate events, user registrations, and certificate issuance. The **User and Event Management Module** serves as the core foundation of the system, providing secure authentication, role-based access control, and comprehensive management for students, organizers, and administrators.

In any enterprise-grade platform, user management is critical for ensuring data integrity, security, and a personalized user experience. This module handles everything from initial registration to advanced administrative oversight.

### System Interface Gallery

| Landing Page |
| :---: |
| ![Landing Page](LandingPage.png) |

| Registration Profile | Secure User Login |
| :---: | :---: |
| ![Registration Page](RegPage.png) | ![Login Page](LoginPage.png) |

| Administrative Dashboard | Student User Dashboard |
| :---: | :---: |
| ![Admin Dashboard](AdminDash.png) | ![User Dashboard](UserDash.png) |

---

## Features

### User Features
*   **Secure Authentication**: JWT-based sign-up and login flow.
*   **Google OAuth Integration**: Seamless one-click login via Google accounts.
*   **Profile Management**: Dedicated profile page to view and update personal information (name, phone, avatar).
*   **Account Deletion**: Secure account closure with data persistence cleanup.
*   **Role-Based Access**: Specialized dashboards for Students/Users.

### Admin & Organizer Features
*   **Administrative Dashboard**: High-level system monitoring with real-time statistics on users and events.
*   **User Directory**: Searchable management table displaying all registered enterprise members.
*   **Event Oversight (Admin)**: Platform-wide visibility and moderation of all scheduled events.
*   **Event Creation (Organizer)**: Dedicated tools for organizers to create, manage, and monitor their own events.
*   **System Statistics**: Instant visibility into total users, student counts, organizer activity, and event volume.

### Security Features
*   **Password Hashing**: Industry-standard encryption using `bcryptjs`.
*   **Stateful Protection**: Protected API routes requiring valid JWT tokens.
*   **RBAC (Role-Based Access Control)**: Backend and frontend enforcement of user privileges.
*   **Stateless Sessions**: Optimized performance using JWT without server-side session overhead.

---

## Technology Stack

### Frontend
*   **React.js**: (Vite-based) for a fast, component-based user interface.
*   **React Router**: For client-side routing and protected navigation paths.
*   **Context API**: For global authentication and user state management.
*   **Axios**: For high-performance asynchronous API communication.

### Backend
*   **Node.js & Express.js**: Providing a scalable RESTful API architecture.
*   **Passport.js**: Integrated for Google OAuth 2.0 strategy.

### Database
*   **MongoDB**: NoSQL database for flexible and scalable data storage.
*   **Mongoose**: ODM (Object Data Modeling) for schema-based data validation.

### Authentication
*   **JWT (JSON Web Tokens)**: For secure, stateless identity transmission.
*   **Bcrypt.js**: For secure salted password hashing.

---

## System Architecture

The system follows a classic **MERN** architecture pattern:
1.  **Frontend (React)**: Communicates with the backend via REST API calls. Uses a `ProtectedRoute` component to handle role verification.
2.  **Backend (Express)**: Handles requests using modular controllers and routes.
3.  **Middleware Layer**: Intercepts requests to verify JWT tokens (`authMiddleware`) and check user permissions (`roleMiddleware`).
4.  **Database (MongoDB)**: Stores persistent user data and system records securely.

---

## Project Folder Structure

```
EEMS-ITPM/
├── backend/            # Express Server
│   ├── config/         # DB and Passport configurations
│   ├── controllers/    # Request handlers (auth, user, admin, event)
│   ├── middleware/     # Auth, Role, and Permission guards
│   ├── models/         # Mongoose schemas (User, Event)
│   ├── routes/         # API endpoints
│   ├── utils/          # Token generation and helpers
│   └── server.js       # Application entry point
├── frontend/           # React App (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global State (AuthContext)
│   │   ├── pages/      # View components (Login, Profile, Admin)
│   │   ├── services/   # API abstraction layer
│   │   └── App.jsx     # Main routing and navigation
└── package.json        # Root scripts for concurrent execution
```

---

## Database Design

The **User Schema** in MongoDB includes:
*   `name`: (String) Full name of the user.
*   `email`: (String) Unique identifier for login.
*   `password`: (String) Hashed credentials (optional for OAuth users).
*   `role`: (Enum) `student`, `organizer`, or `admin`.
*   `phone`: (String) Optional contact information.
*   `profilePicture`: (String) URL to user avatar.
*   `registeredEvents`: (Array) List of event IDs user is attending.
*   `certificates`: (Array) List of earned certificate URLs.
*   `googleId`: (String) Identifier for Google OAuth users.
*   `timestamps`: Automatically managed `createdAt` and `updatedAt`.

---

## API Endpoints

### Authentication
*   `POST /api/auth/register`: Create a new user account.
*   `POST /api/auth/login`: Authenticate and receive a JWT.
*   `GET /api/auth/google`: Initiate Google OAuth flow.

### User Management
*   `GET /api/users/profile`: Retrieve personal profile details.
*   `PUT /api/users/profile`: Update name, phone, or avatar.
*   `DELETE /api/users/profile`: Permanently remove user account.

### Administrative Control
*   `GET /api/admin/users`: List all system users (Admin only).
*   `GET /api/admin/stats`: Fetch system-wide metrics (Admin only).
*   `GET /api/admin/events`: Oversee all enterprise events (Admin only).
*   `DELETE /api/admin/users/:id`: Remove specific user account (Admin only).

### Event Management
*   `POST /api/events`: Create a new corporate event (Organizer only).
*   `GET /api/events/my-events`: List events for current organizer.
*   `PUT /api/events/:id`: Update event details.
*   `DELETE /api/events/:id`: Cancel or remove an event.

---

## Installation Guide

1.  **Clone Repository**: 
    ```bash
    git clone https://github.com/ChamikaShashipriya99/Enterprises-Event-Management-System-ITPM-Group-Project.git
    cd Enterprises-Event-Management-System-ITPM-Group-Project
    ```
2.  **Install Dependencies**: 
    Installs both root, backend, and frontend dependencies.
    ```bash
    npm install
    cd backend && npm install
    cd ../frontend && npm install
    ```
3.  **Setup Environment Variables**: 
    Create a `.env` file in the `backend/` directory.
4.  **Database Setup**: 
    Ensure you have a MongoDB instance running (Local or MongoDB Atlas).
5.  **Run Application**: 
    Start both frontend and backend concurrently from the root:
    ```bash
    npm run dev
    ```

---

## Environment Variables

The backend requires the following variables in the `.env` file:
*   `MONGO_URI`: Your MongoDB connection string.
*   `JWT_SECRET`: A secure random string for token signing.
*   `PORT`: Port for the backend server (default: 5000).
*   `GOOGLE_CLIENT_ID`: Your Google Cloud Console Client ID.
*   `GOOGLE_CLIENT_SECRET`: Your Google Cloud Console Client Secret.
*   `FRONTEND_URL`: The URL of your running frontend application (e.g., http://localhost:5173).

---

## Security Best Practices
*   **Bcrypt Hashing**: Passwords are never stored in plain text.
*   **JWT Integrity**: All sensitive routes are guarded by token validation.
*   **RBAC Enforcement**: Specific actions (like user deletion) are restricted to the Administrative role.
*   **Sanitized Responses**: Sensitive data like passwords are excluded from API responses.

---

## Contributors
*   **Chamika Shashipriya (IT23257054)**
