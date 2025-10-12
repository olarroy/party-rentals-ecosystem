# 🚀 GUÍA DE DEPLOYMENT PASO A PASO

**Tiempo estimado: 20-30 minutos**  
**Costo total: $0 (100% gratuito)**

## 📋 **CHECKLIST PRE-DEPLOYMENT**

- [ ] Tienes cuenta de GitHub
- [ ] Tienes cuenta de Supabase (o la crearás)
- [ ] Tienes cuenta de Netlify (o la crearás)
- [ ] Git está instalado en tu sistema

---

## 🗂️ **PASO 1: SUBIR A GITHUB (5 minutos)**

### 1.1 Crear Repositorio en GitHub
```bash
# Ve a GitHub.com → New Repository
# Nombre: party-rentals-ecosystem
# Público: ✅ Sí (para GitHub Pages gratuito)
# Initialize: ❌ No (ya tienes código)
```

### 1.2 Conectar tu Proyecto Local
```bash
# Abrir terminal en tu carpeta del proyecto
cd "C:\Users\oscar\proyectos personales\MCP_DEMO\party-rentals-ecosystem"

# Inicializar Git (si no está)
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "🎉 Initial commit: Complete party rentals ecosystem"

# Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/party-rentals-ecosystem.git

# Subir código
git push -u origin main
```

---

## 🎨 **PASO 2: CONFIGURAR GITHUB PAGES (2 minutos)**

### 2.1 Activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages** (menú izquierdo)
3. **Source**: Deploy from a branch
4. **Branch**: `main`
5. **Folder**: `/ (root)` 
6. **Save**

### 2.2 Configurar para Frontend
```bash
# Crear archivo especial para GitHub Pages
echo "# Party Rentals - Frontend on GitHub Pages" > party-rentals-frontend/.nojekyll

# Actualizar index.html del repositorio raíz
cp party-rentals-frontend/index.html ./index.html
cp party-rentals-frontend/reservas.html ./reservas.html
cp -r party-rentals-frontend/src ./src
cp party-rentals-frontend/favicon.svg ./favicon.svg

# Commit y push
git add .
git commit -m "📄 Configure root for GitHub Pages"
git push
```

### 2.3 Tu Sitio Estará Disponible En:
```
https://TU-USUARIO.github.io/party-rentals-ecosystem
```
⏱️ **Espera 5-10 minutos** para que GitHub lo procese.

---

## 🗄️ **PASO 3: CONFIGURAR SUPABASE DATABASE (8 minutos)**

### 3.1 Crear Proyecto Supabase
1. Ve a [supabase.com](https://supabase.com)
2. **Sign up** (gratis con GitHub)
3. **New Project**
   - **Name**: `party-rentals-db`
   - **Password**: Genera una segura
   - **Region**: Elige la más cercana
   - **Plan**: Free

### 3.2 Crear Tablas de Base de Datos
```sql
-- En Supabase → SQL Editor → New Query

-- Tabla de Inflables
CREATE TABLE inflatables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL CHECK (size IN ('large', 'small')),
  capacity INTEGER NOT NULL,
  weekday_price DECIMAL(10,2) NOT NULL,
  weekend_price DECIMAL(10,2) NOT NULL,
  holiday_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  specifications JSONB,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de Clientes
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de Reservas
CREATE TABLE rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  inflatable_id UUID REFERENCES inflatables(id) NOT NULL,
  rental_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  rental_hours INTEGER NOT NULL,
  guest_count INTEGER NOT NULL,
  event_type VARCHAR(100),
  setup_address TEXT NOT NULL,
  special_requests TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  setup_fee DECIMAL(10,2) DEFAULT 25.00,
  cleaning_fee DECIMAL(10,2) DEFAULT 15.00,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ejecutar Query
```

### 3.3 Insertar Datos de Ejemplo
```sql
-- Insertar Inflables
INSERT INTO inflatables (name, size, capacity, weekday_price, weekend_price, holiday_price, description, specifications) VALUES
('Castillo Grande Premium', 'large', 15, 150.00, 200.00, 250.00, 'Castillo inflable grande perfecto para fiestas con muchos invitados', '{"dimensions": "6x6x4 metros", "weight_limit": "500kg", "age_range": "3-12 años"}'),
('Casa de Rebote Pequeña', 'small', 8, 100.00, 130.00, 160.00, 'Casa inflable compacta ideal para espacios reducidos', '{"dimensions": "4x4x3 metros", "weight_limit": "300kg", "age_range": "2-10 años"}');

-- Ejecutar Query
```

### 3.4 Configurar Políticas de Seguridad (RLS)
```sql
-- Habilitar Row Level Security
ALTER TABLE inflatables ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura pública de inflables
CREATE POLICY "Allow public read inflatables" ON inflatables FOR SELECT USING (is_active = true);

-- Políticas para permitir inserción de customers y rentals
CREATE POLICY "Allow insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert rentals" ON rentals FOR INSERT WITH CHECK (true);

-- Ejecutar Query
```

### 3.5 Obtener Credenciales
1. **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xyz.supabase.co`
   - **Project API Key** (anon/public): `eyJ...`

---

## 🌐 **PASO 4: CONFIGURAR NETLIFY API (5 minutos)**

### 4.1 Crear Cuenta Netlify
1. Ve a [netlify.com](https://netlify.com)
2. **Sign up** con GitHub
3. **Import from Git** → Selecciona tu repositorio

### 4.2 Deploy Configuración
```bash
# Build settings en Netlify:
Build command: npm run build
Publish directory: party-rentals-api
Functions directory: party-rentals-api/netlify/functions
```

### 4.3 Variables de Entorno en Netlify
```bash
# Site settings → Environment variables
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-publica-supabase
NODE_ENV=production
```

---

## ⚙️ **PASO 5: CONECTAR FRONTEND CON BACKEND (3 minutos)**

### 5.1 Actualizar Configuración Frontend
```javascript
// Editar: src/js/config.js
window.PARTY_RENTALS_CONFIG = {
  // Información de tu empresa
  companyName: 'Tu Empresa de Inflables',
  phone: '+34 123 456 789',
  email: 'info@tuempresa.com',
  address: 'Tu Dirección, Ciudad, País',
  
  // URLs de producción
  apiBaseUrl: 'https://tu-sitio.netlify.app/.netlify/functions',
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  supabaseAnonKey: 'tu-clave-publica',
  
  // Configuración del negocio
  defaultInflatable: 'large',
  maxBookingDays: 365,
  minRentalHours: 4,
  maxRentalHours: 12
};
```

### 5.2 Push Cambios
```bash
git add .
git commit -m "🔧 Configure production URLs"
git push
```

---

## 🎯 **PASO 6: TESTING Y VERIFICACIÓN (5 minutos)**

### 6.1 Verificar URLs
- **Frontend**: `https://tu-usuario.github.io/party-rentals-ecosystem`
- **API**: `https://tu-sitio.netlify.app/.netlify/functions/availability`
- **Database**: Panel Supabase → Table Editor

### 6.2 Test Completo del Sistema
1. **Abrir frontend** en navegador
2. **Navegar al calendario** de reservas
3. **Seleccionar fecha** futura
4. **Llenar formulario** de prueba
5. **Enviar reserva** y verificar confirmación
6. **Verificar en Supabase** que se guardó la reserva

---

## 🌟 **PASO 7: DOMINIO PERSONALIZADO (OPCIONAL)**

### 7.1 Si Quieres Dominio Propio
```bash
# 1. Comprar dominio en:
# - Namecheap ($10/año)
# - GoDaddy ($12/año)  
# - Google Domains ($12/año)

# 2. En GitHub Pages Settings:
# Custom domain: tudominio.com
# Enforce HTTPS: ✅

# 3. En tu proveedor de dominio:
# CNAME record: www → tu-usuario.github.io
# A records: @ → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
```

---

## ✅ **CHECKLIST FINAL**

- [ ] ✅ Repositorio GitHub creado y código subido
- [ ] ✅ GitHub Pages activado y funcionando
- [ ] ✅ Base de datos Supabase configurada con tablas
- [ ] ✅ API Netlify desplegada y funcionando
- [ ] ✅ Frontend conectado con backend
- [ ] ✅ Test completo del flujo de reserva
- [ ] ✅ Sistema 100% funcional y generando ingresos

---

## 🎉 **¡FELICITACIONES!**

**Tu sistema de alquiler de inflables está VIVO y funcionando:**

- 🎨 **Frontend profesional** en GitHub Pages
- 🗄️ **Base de datos robusta** en Supabase  
- 🌐 **API escalable** en Netlify
- 💰 **Costo total**: $0/mes (hasta que crezcas)
- 📈 **Escalabilidad**: Hasta 100,000 usuarios/mes gratis

**¡Ya puedes empezar a recibir reservas reales!** 🎈💰

---

## 🆘 **SI ALGO NO FUNCIONA**

1. **Verifica URLs** en config.js
2. **Revisa Console** del navegador (F12)
3. **Check Netlify Logs** en dashboard
4. **Verifica Supabase** → API → Settings
5. **GitHub Pages Status** en repository settings

**¿Necesitas ayuda?** ¡Pregúntame cualquier paso específico! 🚀
