# GUÍA COMPLETA: WhatsApp Business Cloud API + n8n

## 📱 CONFIGURACIÓN WHATSAPP BUSINESS CLOUD API

### 1. Crear App en Meta for Developers
1. Ve a: https://developers.facebook.com/
2. Crea una nueva app
3. Selecciona "Business" como tipo de app
4. Agrega el producto "WhatsApp Business"

### 2. Configurar Números de Teléfono
1. Ve a WhatsApp > API Setup
2. Agrega tu número de teléfono de negocio
3. Verifica el número con SMS/llamada
4. Anota el Phone Number ID

### 3. Obtener Credenciales
- **Access Token**: En WhatsApp > API Setup
- **Phone Number ID**: En la sección de números
- **Webhook Verify Token**: Lo creas tú (ej: "mi_token_secreto_123")
- **App Secret**: En App Settings > Basic

### 4. Configurar Webhook (para recibir mensajes)
- **Webhook URL**: https://tu-n8n.com/webhook/whatsapp
- **Verify Token**: tu_token_secreto_123
- **Campos**: messages, messaging_postbacks

## 🔧 EJEMPLO DE CREDENCIALES NECESARIAS:
```
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mi_token_secreto_123
WHATSAPP_APP_SECRET=abcd1234567890
```

## 📋 TEMPLATES DE MENSAJES REQUERIDOS
WhatsApp Business requiere templates pre-aprobados para enviar mensajes:

### Template: Confirmación de Reserva
- **Nombre**: reservation_confirmation
- **Categoría**: TRANSACTIONAL
- **Contenido**:
```
¡Hola {{1}}! 🎉

Tu reserva ha sido confirmada:
📅 Fecha: {{2}}
🎈 Inflables: {{3}}
💰 Total: {{4}}
🆔 ID: {{5}}

Nos contactaremos contigo 24h antes del evento.

¡Gracias por elegirnos! 🎊
```

### Template: Recordatorio
- **Nombre**: event_reminder
- **Categoría**: UTILITY
- **Contenido**:
```
¡Hola {{1}}! 🔔

Recordatorio de tu evento mañana:
📅 {{2}}
🎈 {{3}}
📍 Dirección: {{4}}

¡Nos vemos pronto! 🎉
```
