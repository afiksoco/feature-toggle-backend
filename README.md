# Feature Toggle SDK

A complete Feature Toggle system with FastAPI backend, Next.js admin portal, and Android SDK.

## Live Demo

| Service | URL |
|---------|-----|
| **Admin Portal** | https://admin-five-drab-87.vercel.app |
| **API** | https://api-jade-two-62.vercel.app |
| **API Docs** | https://api-jade-two-62.vercel.app/docs |
| **Android SDK (JitPack)** | https://jitpack.io/#afiksoco/feature-toggle-android-sdk |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin Portal   │────▶│   FastAPI API   │────▶│  MongoDB Atlas  │
│   (Next.js)     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               ▲
                               │
                        ┌──────┴──────┐
                        │ Android SDK │
                        │  (Kotlin)   │
                        └─────────────┘
```

## Project Structure

```
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
└── android-sdk/                  # Android SDK + Sample App
    ├── feature-toggle-sdk/      # The SDK library
    └── sample/                  # Demo app
```

## Android SDK Usage

Add JitPack to your `settings.gradle.kts`:
```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

Add the dependency:
```kotlin
implementation("com.github.afiksoco:feature-toggle-android-sdk:v1.0.0")
```

Use in your app:
```kotlin
// Initialize in Application.onCreate()
FeatureToggle.initialize(
    context = this,
    config = FeatureToggleConfig(
        appId = "com.example.myapp",
        apiUrl = "https://api-jade-two-62.vercel.app"
    )
)

// Set user ID
FeatureToggle.setUserId("user123")

// Check features
if (FeatureToggle.isEnabled("dark_mode")) {
    enableDarkMode()
}
```

## API Endpoints

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/features` | Create new feature |
| GET | `/api/admin/features?app_id=xxx` | List features (filter by app) |
| GET | `/api/admin/features/{id}` | Get feature by ID |
| PUT | `/api/admin/features/{id}` | Update feature |
| DELETE | `/api/admin/features/{id}` | Delete feature |

### SDK Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sdk/features?app_id=xxx` | Get active features for app |
| POST | `/api/sdk/evaluate` | Evaluate features for user |

## Feature Schema

```json
{
  "app_id": "com.example.myapp",
  "key": "dark_mode",
  "name": "Dark Mode",
  "description": "Enable dark mode theme",
  "enabled": true,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "rollout_percentage": 50
}
```

## Key Features

- **Multi-App Support** - Each app has isolated features
- **Percentage Rollout** - Gradual feature releases (consistent hashing)
- **Date Scheduling** - Start/end dates for features
- **Real-time Toggle** - No app update needed to enable/disable
- **Admin Portal** - Easy-to-use web interface

## Local Development

### Backend
```bash
cd api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Admin Portal
```bash
cd admin
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB connection string |
| `DATABASE_NAME` | Database name (default: `feature_toggle`) |
| `CORS_ORIGINS` | Allowed origins JSON array |
| `NEXT_PUBLIC_API_URL` | API URL for frontend |
