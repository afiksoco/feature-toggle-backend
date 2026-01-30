# Feature Toggle SDK

A Feature Toggle SDK backend with FastAPI + Next.js admin portal, ready to deploy to Vercel with MongoDB Atlas.

## Project Structure

```
seminar_backend/
├── api/                          # FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Settings (env vars)
│   │   ├── database.py          # MongoDB connection
│   │   ├── models/              # Pydantic models
│   │   ├── routes/              # API endpoints
│   │   └── services/            # Business logic
│   └── requirements.txt
├── admin/                        # Next.js admin portal
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   └── lib/                 # API client
│   └── package.json
├── vercel.json                  # Vercel deployment config
└── pyproject.toml
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
# Install dependencies
cd api
pip install -r requirements.txt

# Set environment variables
cp ../.env.example ../.env
# Edit .env with your MongoDB connection string

# Run the server
uvicorn app.main:app --reload
```

### Admin Portal Setup

```bash
# Install dependencies
cd admin
npm install

# Run the dev server
npm run dev
```

## API Endpoints

### Admin Endpoints (for portal)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/features` | Create new feature |
| GET | `/api/admin/features` | List all features |
| GET | `/api/admin/features/{id}` | Get feature by ID |
| PUT | `/api/admin/features/{id}` | Update feature |
| DELETE | `/api/admin/features/{id}` | Delete feature |

### SDK Endpoints (for mobile apps)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sdk/features` | Get all active features |
| GET | `/api/sdk/features/{key}` | Check if specific feature is enabled |
| POST | `/api/sdk/evaluate` | Evaluate features for user (handles percentage rollout) |

## Feature Schema

```json
{
  "key": "dark_mode",
  "name": "Dark Mode",
  "description": "Enable dark mode theme",
  "enabled": true,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "rollout_percentage": 50
}
```

## Percentage Rollout

The SDK uses consistent hashing to ensure users always get the same result for percentage-based rollouts. Use the `/api/sdk/evaluate` endpoint with a `user_id` to check feature availability:

```bash
curl -X POST http://localhost:8000/api/sdk/evaluate \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "feature_keys": ["dark_mode"]}'
```

## Deployment to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel:
   - `MONGODB_URL`
   - `DATABASE_NAME`
   - `CORS_ORIGINS`
   - `NEXT_PUBLIC_API_URL`
4. Deploy

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://...` |
| `DATABASE_NAME` | Database name | `feature_toggle` |
| `CORS_ORIGINS` | Allowed origins (JSON array) | `["http://localhost:3000"]` |
| `NEXT_PUBLIC_API_URL` | API URL for frontend | `https://api.example.com` |
