# Personal Finance Tracker API

REST API lagu maamulo dakhliga (income), kharashaadka (expenses), categories, profile pictures iyo monthly summaries. Waxaa lagu dhisay Node.js, Express 5, MongoDB/Mongoose, JWT, bcryptjs, Zod iyo Cloudinary.

## Features

- Register, login iyo JWT-protected profile.
- Password hashing iyadoo la adeegsanayo bcryptjs.
- Roles: `user` iyo `admin`.
- User kasta wuxuu arkaa oo maamulaa transactions-kiisa oo keliya.
- Transactions CRUD, filters, date range iyo pagination.
- Monthly summary oo MongoDB Aggregation ku xisaabiso income/expenses per category.
- Predefined income iyo expense categories.
- Profile picture upload: Multer `memoryStorage()` + Cloudinary `upload_stream()`.
- Admin overview: total users, transactions, income, expenses iyo top spending categories.
- Zod validation, request logger, Helmet, CORS, rate limiting, 404 iyo global error handler.
- Swagger UI: `/docs`; OpenAPI JSON: `/docs.json`.

## 1. Requirements

- Node.js 22, 23 ama 24 (Node 25 lama beegsan).
- MongoDB local ama MongoDB Atlas.
- Cloudinary account (kaliya haddii aad rabto inaad tijaabiso image upload).

## 2. Installation

```bash
npm install
```

Nuqul ka samee `.env.example`, kadib u bixi `.env`:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Buuxi `MONGO_URI` iyo `JWT_SECRET`. `JWT_SECRET` waa inuu ahaadaa ugu yaraan 32 characters oo random ah. Waxaad ku abuuri kartaa:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Haddii Cloudinary aan wali laguu diyaarin, saddexda `CLOUDINARY_*` way bannaanaan karaan; API-gu wuu shaqaynayaa, laakiin upload endpoint-ku wuxuu soo celinayaa `503` ilaa credentials la geliyo.

## 3. Run locally

Development (Nodemon):

```bash
npm run dev
```

Normal start:

```bash
npm start
```

- Health: `http://localhost:5000/health`
- Swagger: `http://localhost:5000/docs`
- OpenAPI JSON: `http://localhost:5000/docs.json`

## 4. Important amount rule

Mashruucan wuxuu isticmaalaa hal sharci oo cad:

- `income`: amount waa **positive**. Tusaale `1500`.
- `expense`: amount waa **negative**. Tusaale `-50`.

Monthly summary-ga iyo admin overview-gu expenses-ka waxay u soo bandhigaan tiro positive ah si ay u fududaato akhriskoodu. `netBalance = totalIncome - totalExpenses`.

## 5. API endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account and return JWT |
| POST | `/auth/login` | Public | Login and return JWT |
| GET | `/auth/profile` | User | Current user profile |
| GET | `/categories` | Public | List predefined categories |
| POST | `/transactions` | User | Create income/expense |
| GET | `/transactions` | User | List own transactions |
| GET | `/transactions/monthly-summary?month=2025-05` | User | Monthly totals by category |
| PUT | `/transactions/:id` | Owner | Update own transaction (send full body) |
| DELETE | `/transactions/:id` | Owner | Delete own transaction |
| POST | `/upload/profile-picture` | User | Upload profile picture |
| GET | `/admin/overview` | Admin | Platform-wide overview |

For protected endpoints, send this header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Register example

```json
{
  "name": "Ayaan",
  "email": "ayaan@example.com",
  "password": "StrongPass123"
}
```

Registration intentionally does not accept a `role` field. New users always receive `role: "user"`.

### Create expense example

```json
{
  "title": "Groceries",
  "amount": -50,
  "type": "expense",
  "category": "Food",
  "date": "2025-05-27"
}
```

### Create income example

```json
{
  "title": "Monthly salary",
  "amount": 1500,
  "type": "income",
  "category": "Salary",
  "date": "2025-05-01"
}
```

Valid categories are returned by `GET /categories`. Category names are case-sensitive.

### List filters

`GET /transactions?type=expense&category=Food&page=1&limit=10`

Also supported: `startDate=2025-05-01&endDate=2025-05-31`. `endDate` is inclusive, so all transactions on May 31 are included.

### Monthly summary

`GET /transactions/monthly-summary?month=2025-05`

If `month` is omitted, the API uses the current UTC month.

### Upload profile picture

Use `multipart/form-data` with field name `profilePicture`. Maximum size: 5 MB. Only image MIME types are accepted. The image is sent to Cloudinary through an in-memory Multer buffer; it is not stored on the app server's disk.

## 6. Create an admin user

First register a normal account. Then set that account as admin using the private maintenance script:

```bash
npm run set-admin -- ayaan@example.com
```

This script connects using `MONGO_URI` and updates the existing user. Do not expose an endpoint that lets users promote themselves to admin.

## 7. GitHub

Create an empty repository on GitHub, then run these commands from the project folder (replace the URL with your repository URL):

```bash
git init
git add .
git commit -m "feat: build personal finance tracker API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/personal-finance-tracker-api.git
git push -u origin main
```

`.env` and `node_modules` are excluded by `.gitignore`. Commit `.env.example`, not `.env`.

## 8. Deploy to Render

1. Push the project to GitHub.
2. In Render choose **New → Web Service**, then connect the repository.
3. Use Runtime **Node**.
4. Build Command: `npm install`.
5. Start Command: `npm start`.
6. Add the environment variables in Render Dashboard → your service → **Environment**:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a new strong random secret
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGIN` = `*` during API-only testing; later replace with your frontend origin(s)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `API_BASE_URL` = your service host only, e.g. `https://your-service-name.onrender.com` (do not add `/api`)
7. Deploy. Then open `/health` and `/docs` on the Render URL.

Render also provides `RENDER_EXTERNAL_URL`; the Swagger config can use it as a fallback. Setting `API_BASE_URL` explicitly makes the deployed server URL clear in the Swagger UI.

For MongoDB Atlas, create a database user and allow your Render service to connect through Atlas Network Access. Use a strong database password and never publish the connection string. For a learning deployment, an allow-all IP rule may be used when necessary, but it is broader than ideal; tighten access when your hosting setup supports known outbound IPs.

## 9. Suggested demo (at least 5 endpoints)

1. `POST /auth/register` — create a user.
2. `POST /auth/login` — log in and copy the token.
3. `GET /auth/profile` — click **Authorize** in Swagger and paste the token.
4. `POST /transactions` — create an expense or income.
5. `GET /transactions` — list transactions.
6. `GET /transactions/monthly-summary` — show monthly totals.
7. `POST /upload/profile-picture` — upload a test image (after Cloudinary setup).

For the final submission, capture a screenshot or short Loom recording showing at least five successful endpoints and the live `/docs` page.
