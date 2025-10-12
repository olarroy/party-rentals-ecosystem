# 🌐 Party Rentals API

**REST API** para el sistema de alquiler de inflables. Implementa **Clean Architecture** con **Supabase** como base de datos.

## 🏗️ Arquitectura

### **Presentation Layer**
```
src/presentation/
├── controllers/              # Controllers REST
│   ├── AvailabilityController.ts
│   ├── RentalController.ts
│   └── InflatableController.ts
├── routes/                   # Routes definition
├── middlewares/              # Express middlewares
└── dto/                      # Data Transfer Objects
```

### **Infrastructure Layer**
```
src/infrastructure/
├── repositories/             # Implementaciones repositories
│   ├── SupabaseInflatableRepository.ts
│   ├── SupabaseRentalRepository.ts
│   └── SupabaseCustomerRepository.ts
├── database/                 # Database migrations & config
├── services/                 # External services
└── config/                   # Configuration
```

## 🚀 Stack Tecnológico

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database & Auth (PostgreSQL)
- **Zod** - Schema validation
- **Helmet** - Security headers
- **CORS** - Cross-origin requests

## 📊 Base de Datos (Supabase)

### **Tablas**
```sql
-- Inflatables table
CREATE TABLE inflatables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('LARGE', 'SMALL')),
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  setup_time_minutes INTEGER NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rentals table
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inflatable_id UUID REFERENCES inflatables(id),
  customer_id UUID REFERENCES customers(id),
  rental_date DATE NOT NULL,
  setup_address JSONB NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛠️ Configuración

### **1. Variables de Entorno**
```bash
cp .env.example .env
```

Editar `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
NODE_ENV=development
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Ejecutar en Desarrollo**
```bash
npm run dev
```

## 📡 API Endpoints

### **Availability**
```http
GET /api/availability?date=2024-01-15&inflatableId=uuid
GET /api/availability?date=2024-01-15&size=LARGE
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isAvailable": true,
    "inflatable": {
      "id": "uuid",
      "name": "Castillo Grande",
      "size": "LARGE",
      "basePrice": 80,
      "maxCapacity": 15
    },
    "suggestedPrice": 96  // Con recargo weekend
  }
}
```

### **Rentals**
```http
POST /api/rentals
GET /api/rentals/:id
PUT /api/rentals/:id/confirm
PUT /api/rentals/:id/cancel
```

### **Inflatables**
```http
GET /api/inflatables
GET /api/inflatables/:id
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 🚀 Deployment

### **Netlify Functions**
```bash
npm run build
netlify deploy --prod
```

### **Environment Variables (Netlify)**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 🔗 Integración

Esta API se conecta con:
- **party-rentals-core**: Domain logic
- **party-rentals-frontend**: Cliente web
- **party-rentals-mcp-server**: IA automation

---

**Desarrollado con 💖 usando Clean Architecture + Supabase**
