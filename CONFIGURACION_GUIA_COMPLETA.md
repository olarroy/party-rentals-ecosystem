# 🔧 GUÍA DE CONFIGURACIÓN COMPLETA - PEQUEFEST.COM

## 📍 **UBICACIÓN DE LOS ARCHIVOS DE CONFIGURACIÓN**

### 1. **Archivo Principal de Configuración**
```
📂 party-rentals-ecosystem/
├── .env                    # ⚠️ ARCHIVO REAL (editarlo)
├── .env.example           # 📋 Plantilla de referencia
└── src/js/config-manager.js # 🔧 Gestor de configuración
```

## 🎯 **CONFIGURACIONES PRINCIPALES**

### 📧 **1. EMAIL (Para notificaciones)**

#### **Servicios soportados:**
- ✅ **EmailJS** (Recomendado - Gratis)
- ✅ **SendGrid**
- ✅ **Mailgun**

#### **Configuración EmailJS (GRATUITO):**

1. **Crear cuenta en EmailJS:**
   - Ve a: https://www.emailjs.com/
   - Registrate gratis (300 emails/mes gratis)

2. **Obtener credenciales:**
   ```bash
   # En tu .env, configura:
   EMAIL_SERVICE_ID=service_xxxxxxx
   EMAIL_PUBLIC_KEY=pk_xxxxxxx
   EMAIL_CUSTOMER_TEMPLATE=template_xxxxxxx
   EMAIL_OWNER_TEMPLATE=template_xxxxxxx
   EMAIL_ENABLED=true
   ```

3. **Crear plantillas en EmailJS:**
   - **Plantilla Cliente:** Email de confirmación para clientes
   - **Plantilla Propietario:** Notificación de nueva reserva para ti

### 📱 **2. TELEGRAM (Para notificaciones instantáneas)**

#### **Configuración paso a paso:**

1. **Crear Bot de Telegram:**
   ```
   1. Busca @BotFather en Telegram
   2. Envía: /newbot
   3. Nombre: "Pequefest Notificaciones"
   4. Username: "pequefest_bot" (o similar)
   5. Copia el TOKEN que te da
   ```

2. **Obtener tu Chat ID:**
   ```
   1. Busca @userinfobot en Telegram
   2. Envía cualquier mensaje
   3. Copia tu ID numérico
   ```

3. **Configurar en .env:**
   ```bash
   TELEGRAM_BOT_TOKEN=1234567890:AAExxxxxxxxxxxxxxxxxxxxxx
   TELEGRAM_CHAT_ID=123456789
   TELEGRAM_ENABLED=true
   ```

### 💾 **3. BASE DE DATOS (Ya configurada)**
```bash
# Supabase ya está configurado, no tocar
SUPABASE_URL=https://cstixfdstuaagfosnepn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🏢 **4. INFORMACIÓN DEL NEGOCIO**
```bash
BUSINESS_NAME=Pequefest.com
BUSINESS_EMAIL=oscarlarroy@gmail.com     # ✅ Tu email real
BUSINESS_PHONE=+34 XXX XXX XXX           # ❗ Actualizar con tu teléfono
BUSINESS_ADDRESS=Madrid, España
```

## 📝 **EJEMPLO DE CONFIGURACIÓN COMPLETA**

### **Tu archivo .env debería verse así:**
```bash
# === TELEGRAM CONFIGURATION ===
TELEGRAM_BOT_TOKEN=1234567890:AAExxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=123456789
TELEGRAM_ENABLED=true

# === EMAIL CONFIGURATION ===
EMAIL_SERVICE_ID=service_xxxxxxx
EMAIL_PUBLIC_KEY=pk_xxxxxxx
EMAIL_CUSTOMER_TEMPLATE=template_xxxxxxx
EMAIL_OWNER_TEMPLATE=template_xxxxxxx
EMAIL_ENABLED=true

# === BUSINESS CONFIGURATION ===
BUSINESS_NAME=Pequefest.com
BUSINESS_EMAIL=oscarlarroy@gmail.com
BUSINESS_PHONE=+34 666 777 888
BUSINESS_ADDRESS=Madrid, España

# === TESTING MODE ===
TESTING_MODE=false    # Cambiar a false cuando esté todo listo
SIMULATE_NOTIFICATIONS=false
```

## 🔄 **FLUJO DE NOTIFICACIONES**

### **Cuando alguien hace una reserva:**

1. **Cliente recibe:**
   - ✅ Email de confirmación (con detalles de la reserva)

2. **Tú recibes:**
   - ✅ Email con datos del cliente y reserva
   - ✅ Mensaje de Telegram instantáneo
   - ✅ Notificación en dashboard

## 🧪 **MODO TESTING**

### **Para probar las configuraciones:**
```bash
# En .env, mantén:
TESTING_MODE=true
SIMULATE_NOTIFICATIONS=true
```

**Con esto activado:**
- ✅ Las notificaciones se muestran en consola del navegador
- ✅ No se envían emails/Telegram reales
- ✅ Puedes probar sin gastar cuota

## 🚀 **ACTIVAR MODO PRODUCCIÓN**

### **Cuando todo esté configurado:**
```bash
# Cambiar en .env:
TESTING_MODE=false
SIMULATE_NOTIFICATIONS=false
EMAIL_ENABLED=true
TELEGRAM_ENABLED=true
```

## 📊 **VERIFICAR CONFIGURACIÓN**

### **En la consola del navegador verás:**
```javascript
⚙️ Configuración cargada - Modo: TESTING
📊 Status configuración: {
  telegram: "✅ Configurado",
  email: "✅ Configurado", 
  supabase: "✅ Configurado",
  mode: "🚀 Producción"
}
```

## ❗ **IMPORTANTE**

### **Seguridad:**
- ✅ El archivo `.env` NO se sube a GitHub (está en .gitignore)
- ✅ Las credenciales están protegidas
- ✅ Solo tú tienes acceso a la configuración real

### **Costos:**
- 📧 **EmailJS:** 300 emails gratis/mes
- 📱 **Telegram:** Completamente gratis
- 💾 **Supabase:** Ya configurado y gratis

¿Necesitas ayuda configurando algún servicio específico? 🤔
