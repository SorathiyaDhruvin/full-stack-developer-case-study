# Mini ERP CRM

Full-stack mini ERP/CRM for customers, products, stock movements, and sales challans.

## Stack

- Backend: Node.js, Express, MySQL, JWT auth
- Frontend: React, Vite, Axios, React Router

## Setup

1. Create the database:

```sql
SOURCE database/schema.sql;
```

2. Configure `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_erp_crm
DB_PORT=3306
JWT_SECRET=replace_with_a_long_random_secret
```

3. Configure `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Install and run the backend:

```bash
cd backend
npm install
npm start
```

5. Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Roles

- Admin: full access
- Sales: customers, products, challans
- Warehouse: customers, products, stock
- Accounts: read access to customers, products, stock, and challans
