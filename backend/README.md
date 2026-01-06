# Time Tracker - Backend API

> FastAPI backend for time tracking and invoicing

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL (or Neon account)

### Installation

1. **Clone and navigate:**

```bash
cd backend
```

2. **Create virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your values
```

5. **Run migrations:**

```bash
# Tables are created automatically on first run
```

6. **Start server:**

```bash
uvicorn main:app --reload
```

API will be available at: http://localhost:8000

## 📋 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

Once running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🗄️ Database Schema

```
User
├── id (UUID, PK)
├── email (unique)
├── first_name
├── last_name
├── hashed_password
├── oauth_provider
└── oauth_id

Client
├── id (UUID, PK)
├── user_id (FK → User)
├── name
├── email
├── company
└── notes

Project
├── id (UUID, PK)
├── user_id (FK → User)
├── client_id (FK → Client)
├── name
├── hourly_rate
├── status
└── color

TimeEntry
├── id (UUID, PK)
├── user_id (FK → User)
├── project_id (FK → Project)
├── start_time
├── end_time
├── duration_seconds
└── is_billable

Invoice
├── id (UUID, PK)
├── user_id (FK → User)
├── client_id (FK → Client)
├── invoice_number
├── subtotal
├── tax_rate
├── total
└── status

InvoiceLineItem
├── id (UUID, PK)
├── invoice_id (FK → Invoice)
├── time_entry_id (FK → TimeEntry)
├── quantity
├── rate
└── amount
```

## 🔐 Authentication

### Email/Password

```bash
POST /auth/register
POST /auth/login
GET /auth/me
```

### OAuth

```bash
GET /auth/google
GET /auth/google/callback
GET /auth/github
GET /auth/github/callback
```

## 📡 API Endpoints

### Clients

```bash
POST   /clients          # Create client
GET    /clients          # List clients
GET    /clients/{id}     # Get client
PATCH  /clients/{id}     # Update client
DELETE /clients/{id}     # Delete client (soft)
```

### Projects

```bash
POST   /projects                  # Create project
GET    /projects                  # List projects
GET    /projects/{id}             # Get project
PATCH  /projects/{id}             # Update project
DELETE /projects/{id}             # Delete project
PATCH  /projects/{id}/status      # Update status
```

### Time Entries

```bash
POST   /time-entries/timer/start  # Start timer
PATCH  /time-entries/timer/stop   # Stop timer
GET    /time-entries/timer/running # Get running timer
POST   /time-entries              # Create manual entry
POST   /time-entries/manual       # Create with duration
GET    /time-entries              # List entries (filters)
GET    /time-entries/{id}         # Get entry
PATCH  /time-entries/{id}         # Update entry
DELETE /time-entries/{id}         # Delete entry
```

### Invoices

```bash
POST   /invoices/generate         # Generate from time entries
GET    /invoices                  # List invoices
GET    /invoices/{id}             # Get invoice
PATCH  /invoices/{id}             # Update invoice
DELETE /invoices/{id}             # Delete invoice
GET    /invoices/{id}/pdf         # Download PDF
PATCH  /invoices/{id}/status/{status} # Update status
```

## 📦 Dependencies

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlmodel** - ORM
- **psycopg2-binary** - PostgreSQL driver
- **python-jose** - JWT handling
- **passlib** - Password hashing
- **authlib** - OAuth integration
- **reportlab** - PDF generation
- **python-dotenv** - Environment management

## 🚀 Deployment

### Render

1. Create new project
2. Connect GitHub repo
3. Set environment variables
4. Deploy automatically

### Environment

```bash
DATABASE_URL=<neon-production-url>
SECRET_KEY=<production-secret>
FRONTEND_URL=https://your-app.vercel.app
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License
