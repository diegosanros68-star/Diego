# Backend - Faga Mueblería

API REST con Express, PostgreSQL y Stripe integration.

## Instalación

```bash
npm install
```

## Variables de Entorno

Crea un archivo `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/faga_muebleria
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret
PORT=3001
NODE_ENV=development
```

## Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Construcción
npm start         # Producción
npm run migrate   # Migraciones DB
```
