# Setup & Configuration Guide

## Environment Variables

Crie um ficheiro `.env` na raiz do projeto com as seguintes variáveis:

```env
# Server Configuration
HOST=localhost
PORT=3381
NODE_ENV=development
APP_NAME=Encontrar
APP_URL=http://${HOST}:${PORT}

# Database Configuration
DB_CONNECTION=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_DATABASE=encontrar

# Hash Driver (para passwords)
HASH_DRIVER=argon

# Application Key (para JWT)
APP_KEY=your_secret_key_here

# Mail Configuration (opcional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cache Configuration
CACHE_VIEWS=false

# Redis Configuration (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Session Configuration
SESSION_SECRET=session_secret_here
```

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/greciodiogo/encontrarCore.git
cd encontrarCore
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Argon2 (for password hashing)
```bash
npm install argon2
```

### 4. Generate Application Key
```bash
adonis key:generate
```

### 5. Setup Database

#### Create Database
```bash
# Using PostgreSQL
createdb encontrar
```

#### Run Migrations
```bash
adonis migration:run
```

#### (Optional) Seed Database
```bash
adonis seed:run
```

### 6. Start Development Server
```bash
npm run dev
```

Server will be running at: `http://localhost:3381`

---

## Database Setup

### PostgreSQL Installation

#### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run installer and follow the setup wizard
3. Remember the password you set for `postgres` user
4. PostgreSQL will be installed with default port `5432`

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database User
```bash
# Connect to PostgreSQL
psql -U postgres

# Create new user
CREATE USER bduser WITH PASSWORD 'service@28';

# Create database
CREATE DATABASE encontrar OWNER bduser;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE encontrar TO bduser;
```

---

## Docker Setup (Alternative)

### Using Docker Compose
Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: encontrar
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    ports:
      - "3381:3381"
    depends_on:
      - postgres
      - redis
    environment:
      DB_HOST: postgres
      REDIS_HOST: redis
    volumes:
      - .:/usr/src/app

volumes:
  postgres_data:
```

### Run with Docker Compose
```bash
docker-compose up -d
```

---

## Authentication Setup

### Generate JWT Token

#### 1. Create a User
```bash
# Via API (POST /auth/register)
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

#### 2. Login to Get Token
```bash
# Via API (POST /auth/login)
{
  "email": "user@example.com",
  "password": "securepassword"
}

# Response includes token
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": {
    "type": "bearer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Use Token in Requests
Add the token to the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Available Commands

```bash
# Development
npm run dev              # Start development server with auto-reload

# Production
npm start               # Start production server

# Testing
npm test                # Run tests

# Database
adonis migration:run    # Run pending migrations
adonis migration:reset  # Reset database (careful!)
adonis seed:run         # Seed database with test data

# Code Quality
npm run lint            # Run ESLint

# Generate
adonis make:model User          # Generate model
adonis make:migration users     # Generate migration
adonis make:controller User     # Generate controller
adonis make:repository User     # Generate repository
adonis make:service User        # Generate service
```

---

## Project Structure

```
encontrarCore/
├── app/
│   ├── Commands/              # CLI commands
│   ├── Controllers/           # HTTP controllers
│   ├── Exceptions/            # Custom exceptions
│   ├── Helpers/               # Helper functions
│   ├── Listeners/             # Event listeners
│   ├── Middleware/            # HTTP middleware
│   ├── Models/                # Database models
│   ├── Modules/               # Feature modules
│   │   ├── Catalog/           # Catalog module
│   │   ├── Authentication/    # Auth module
│   │   ├── Security/          # Security module
│   │   └── ...
│   ├── Repositories/          # Data repositories
│   ├── Services/              # Business logic
│   ├── Templates/             # Email templates
│   ├── Validators/            # Request validators
│   └── utils/                 # Utilities
├── config/                    # Configuration files
├── database/                  # Database migrations & seeds
├── docs/                      # API documentation
├── storage/                   # File storage
├── start/                     # Application startup files
├── .env                       # Environment variables
├── .env.example               # Example env file
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker compose file
├── package.json               # Node dependencies
└── server.js                  # Entry point
```

---

## Troubleshooting

### Connection to Database Failed
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Ensure database exists: `createdb encontrar`

### Migration Failed
```bash
# Reset and retry
adonis migration:reset
adonis migration:run
```

### Port Already in Use
```bash
# Kill process on port 3381
# Windows
netstat -ano | findstr :3381
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3381 | xargs kill -9
```

### Argon2 Installation Issues
```bash
# Windows (requires build tools)
npm install --build-from-source argon2

# macOS
brew install argon2
npm rebuild argon2

# Linux
sudo apt-get install libargon2-0 libargon2-0-dev
npm rebuild argon2
```

---

## Performance Tips

1. **Enable Query Caching:** Set `CACHE_VIEWS=true` in production
2. **Use Redis:** For sessions and caching
3. **Database Indexes:** Add indexes on frequently queried columns
4. **Pagination:** Always paginate large result sets
5. **Monitoring:** Use monitoring tools to track performance

---

## Security Recommendations

1. **Keep Dependencies Updated:** `npm audit` and `npm audit fix`
2. **Use Strong Passwords:** Minimum 12 characters
3. **Enable HTTPS:** In production
4. **Validate Input:** Always validate user input
5. **Rate Limiting:** Implement rate limiting on API endpoints
6. **CORS Configuration:** Restrict to trusted domains

---

## Support & Contributing

For issues or questions, please open an issue on GitHub or contact the development team.
