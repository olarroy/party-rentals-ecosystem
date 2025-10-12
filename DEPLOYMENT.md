# 🚀 Deployment Guide - Party Rentals Ecosystem

Guía completa para desplegar **GRATIS** todo el ecosistema usando GitHub Pages + Supabase + Netlify.

## 🌐 Arquitectura de Deployment

```
🎯 Frontend (GitHub Pages) → 🌐 API (Netlify Functions) → 🗄️ DB (Supabase)
                ↓                        ↓                      ↓
           📱 PWA Ready            🔧 Serverless             📊 PostgreSQL
           🎨 Custom Domain        ⚡ Auto-scaling           🔐 Row Level Security
           📈 Analytics            🚀 CI/CD GitHub          💾 Real-time subscriptions
```

## 📋 Pre-requisitos

### **Cuentas Gratuitas Necesarias:**
- ✅ [GitHub](https://github.com) - Hosting + CI/CD
- ✅ [Supabase](https://supabase.com) - Base de datos + Auth
- ✅ [Netlify](https://netlify.com) - Functions + API hosting
- ⚪ [Vercel](https://vercel.com) - Alternativa a Netlify

## 🗄️ Paso 1: Configurar Supabase (Base de Datos)

### **1.1 Crear Proyecto**
```bash
1. Ir a https://supabase.com
2. "New Project" 
3. Nombrar: "party-rentals-db"
4. Anotar URL y ANON KEY
```

### **1.2 Crear Tablas**
```sql
-- Ejecutar en Supabase SQL Editor

-- Tabla de inflables
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

-- Tabla de clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
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

-- Índices para performance
CREATE INDEX idx_rentals_date ON rentals(rental_date);
CREATE INDEX idx_rentals_inflatable ON rentals(inflatable_id);
CREATE INDEX idx_rentals_status ON rentals(status);
```

### **1.3 Insertar Datos de Prueba**
```sql
-- Insertar inflables
INSERT INTO inflatables (name, size, base_price, setup_time_minutes, image_urls) VALUES
('Castillo Grande Premium', 'LARGE', 80.00, 60, '{"https://example.com/large1.jpg"}'),
('Castillo Pequeño Divertido', 'SMALL', 60.00, 45, '{"https://example.com/small1.jpg"}');

-- Verificar
SELECT * FROM inflatables;
```

### **1.4 Configurar RLS (Row Level Security)**
```sql
-- Habilitar RLS
ALTER TABLE inflatables ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permite lectura pública, escritura autenticada)
CREATE POLICY "Allow public read on inflatables" ON inflatables FOR SELECT USING (true);
CREATE POLICY "Allow public read on rentals" ON rentals FOR SELECT USING (true);
CREATE POLICY "Allow insert on customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on rentals" ON rentals FOR INSERT WITH CHECK (true);
```

## 🌐 Paso 2: Configurar Netlify Functions (API)

### **2.1 Preparar Estructura**
```bash
# En party-rentals-api/
mkdir netlify
mkdir netlify/functions
```

### **2.2 Crear Netlify Function**
Crear `party-rentals-api/netlify/functions/availability.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { date, inflatableId, size } = event.queryStringParameters || {};

    if (!date) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Date is required' })
      };
    }

    // Check availability logic
    let query = supabase
      .from('rentals')
      .select('id')
      .eq('rental_date', date)
      .in('status', ['PENDING', 'CONFIRMED']);

    if (inflatableId) {
      query = query.eq('inflatable_id', inflatableId);
    }

    const { data: bookings } = await query;
    const isAvailable = !bookings || bookings.length === 0;

    // Get inflatable info if specific ID requested
    let inflatable = null;
    if (inflatableId) {
      const { data } = await supabase
        .from('inflatables')
        .select('*')
        .eq('id', inflatableId)
        .single();
      inflatable = data;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          isAvailable,
          inflatable,
          date,
          suggestedPrice: inflatable ? calculatePrice(inflatable, date) : null
        }
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function calculatePrice(inflatable, date) {
  let price = inflatable.base_price;
  
  // Weekend premium
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    price *= 1.2;
  }
  
  return Math.round(price * 100) / 100;
}
```

### **2.3 Configurar netlify.toml**
```toml
[build]
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[dev]
  functions = "netlify/functions"
```

### **2.4 Deploy a Netlify**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy desde party-rentals-api/
netlify init
netlify deploy
netlify deploy --prod
```

### **2.5 Configurar Variables de Entorno**
```bash
# En Netlify Dashboard > Site Settings > Environment Variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

## 🎨 Paso 3: Deploy Frontend (GitHub Pages)

### **3.1 Configurar Repository**
```bash
# Crear repo en GitHub
# Subir código de party-rentals-frontend/

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tuusuario/party-rentals-frontend.git
git push -u origin main
```

### **3.2 Configurar GitHub Pages**
```bash
1. Repository Settings
2. Pages section
3. Source: "Deploy from a branch"
4. Branch: main / root
5. Save
```

### **3.3 Configurar API URL**
Actualizar `party-rentals-frontend/src/js/config.js`:
```javascript
const CONFIG = {
  API_BASE_URL: 'https://your-netlify-site.netlify.app/api',
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your_anon_key'
};
```

### **3.4 GitHub Actions (CI/CD)**
Crear `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🤖 Paso 4: Configurar MCP Server

### **4.1 Claude Desktop Config**
Agregar a `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "party-rentals": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/party-rentals-mcp-server",
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your_anon_key"
      }
    }
  }
}
```

### **4.2 Build y Test**
```bash
cd party-rentals-mcp-server
npm install
npm run build
npm start
```

## 🔧 Paso 5: Configurar n8n (Opcional)

### **5.1 Self-hosted Gratuito**
```bash
# Docker Compose
version: '3.7'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### **5.2 Workflows de Ejemplo**
1. **Nueva Reserva** → Email confirmación
2. **Pago recibido** → SMS cliente + Calendar Google
3. **Día anterior evento** → Recordatorio montaje
4. **Post-evento** → Encuesta satisfacción

## 📊 Paso 6: Monitoreo y Analytics

### **6.1 Google Analytics**
```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### **6.2 Supabase Analytics**
- Dashboard nativo con métricas de uso
- Query performance
- Realtime connections

### **6.3 Netlify Analytics**
- Bandwidth usage
- Function invocations
- Performance metrics

## 🎯 URLs Finales

```
Frontend: https://tuusuario.github.io/party-rentals-frontend
API:      https://party-rentals-api.netlify.app
Admin:    https://your-project.supabase.co
n8n:      https://your-domain.com:5678 (opcional)
```

## 🔒 Seguridad y Mejores Prácticas

### **Variables de Entorno**
- ✅ Nunca hardcodear keys en código
- ✅ Usar environment variables
- ✅ Diferentes keys para dev/prod

### **CORS y Headers**
- ✅ Configurar CORS correctamente
- ✅ Security headers (Helmet.js)
- ✅ Rate limiting en functions

### **Base de Datos**
- ✅ Row Level Security habilitado
- ✅ Políticas granulares
- ✅ Backup automático (Supabase Pro)

## 🎉 ¡Listo!

Tu ecosistema completo está deployado **100% GRATIS** con:
- ✅ Frontend profesional (GitHub Pages)
- ✅ API escalable (Netlify Functions)  
- ✅ Base de datos robusta (Supabase)
- ✅ IA integrada (MCP Server)
- ✅ Automatización (n8n opcional)

**Total costo mensual: €0** 🎈
