# GUÍA CONFIGURACIÓN N8N + WHATSAPP CLOUD API
# Instrucciones paso a paso para integrar reservas con WhatsApp

## 1. INSTALAR N8N (Opciones)

### Opción A: Docker (Recomendado)
```bash
# Instalar con Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# O con docker-compose para persistencia
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"  
    environment:
      - WEBHOOK_URL=https://tu-dominio.ngrok.io
    volumes:
      - ~/.n8n:/home/node/.n8n
```

### Opción B: Cloud (Más fácil)
- Ve a: https://n8n.cloud/
- Cuenta gratuita disponible
- Webhooks públicos automáticos

### Opción C: Local con Tunnel
```bash
# Instalar n8n localmente
npm install n8n -g
n8n start

# En otra terminal, crear túnel público con ngrok
ngrok http 5678
# Te da URL pública como: https://abc123.ngrok.io
```

## 2. CONFIGURAR WHATSAPP EN N8N

### Credentials necesarias:
- **Access Token**: De Meta for Developers
- **Phone Number ID**: Tu número de WhatsApp Business
- **Verify Token**: Token personalizado para webhook

### Workflow básico para reservas:
1. **Webhook** → Recibe reserva del sitio web
2. **Set variables** → Prepara datos del mensaje
3. **WhatsApp node** → Envía confirmación al cliente
4. **WhatsApp node** → Notifica al propietario
5. **Spreadsheet/Database** → Guarda reserva

## 3. EJEMPLO WORKFLOW COMPLETO

```json
{
  "nodes": [
    {
      "name": "Webhook - Reserva",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "party-rentals"
      }
    },
    {
      "name": "Preparar datos",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "cliente_phone",
              "value": "={{$json.reservation.customer.phone}}"
            },
            {
              "name": "mensaje_cliente", 
              "value": "🎉 ¡Reserva confirmada!\n\n📅 Fecha: {{$json.reservation.date}}\n🎈 Inflables: {{$json.reservation.inflatable_types.join(', ')}}\n💰 Total: €{{$json.reservation.total_price}}\n🆔 ID: {{$json.reservation.id}}\n\n¡Nos pondremos en contacto para coordinar la instalación!"
            },
            {
              "name": "mensaje_propietario",
              "value": "🔔 NUEVA RESERVA\n\n👤 Cliente: {{$json.reservation.customer.name}}\n📱 Teléfono: {{$json.reservation.customer.phone}}\n📅 Fecha: {{$json.reservation.date}}\n🎈 Inflables: {{$json.reservation.inflatable_types.join(', ')}}\n💰 Total: €{{$json.reservation.total_price}}\n📍 Dirección: {{$json.reservation.customer.address}}\n🆔 ID: {{$json.reservation.id}}"
            }
          ]
        }
      }
    },
    {
      "name": "WhatsApp - Cliente",
      "type": "n8n-nodes-base.whatsApp",
      "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$json.cliente_phone}}",
        "message": "={{$json.mensaje_cliente}}"
      }
    },
    {
      "name": "WhatsApp - Propietario", 
      "type": "n8n-nodes-base.whatsApp",
      "parameters": {
        "operation": "sendMessage",
        "messageType": "text", 
        "recipientPhoneNumber": "+34123456789",
        "message": "={{$json.mensaje_propietario}}"
      }
    },
    {
      "name": "Guardar en Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "append",
        "values": {
          "A": "={{$json.reservation.id}}",
          "B": "={{$json.reservation.date}}",
          "C": "={{$json.reservation.customer.name}}",
          "D": "={{$json.reservation.customer.phone}}",
          "E": "={{$json.reservation.total_price}}"
        }
      }
    }
  ]
}
```

## 4. CONFIGURACIÓN AVANZADA

### Mensajes con formato:
```javascript
// Mensaje rico con emojis y formato
const mensaje = `
🎉 *¡Reserva Confirmada!*

📋 *Detalles de tu reserva:*
• 📅 Fecha: ${fecha}
• 🎈 Inflables: ${inflables}  
• ⏰ Duración: ${horas} horas
• 👥 Invitados: ${invitados}
• 💰 Total: €${total}

🆔 *ID Reserva:* ${id}

📞 *Próximos pasos:*
• Te llamaremos 24h antes
• Instalación 1h antes del evento  
• ¡Que disfrutes la fiesta! 🎊

_FiestaInflables - Tu diversión es nuestra pasión_
`;
```

### Webhook con verificación:
```javascript
// Verificar origen de la reserva
if (request.headers['x-webhook-secret'] !== 'tu-token-secreto') {
  return { error: 'Unauthorized' };
}

// Validar datos requeridos
const required = ['customer', 'date', 'total_price'];
for (const field of required) {
  if (!request.body.reservation[field]) {
    return { error: `Missing field: ${field}` };
  }
}
```

## 5. URL DEL WEBHOOK PARA TU CÓDIGO

Una vez configurado n8n, actualiza en tu código:

```javascript
// En src/js/n8n-integration.js
this.webhookURL = 'https://tu-n8n-instance.com/webhook/party-rentals';
this.isEnabled = true;
```

## 6. TESTING Y DEBUGGING

### Variables de entorno para testing:
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_ID`  
- `WHATSAPP_VERIFY_TOKEN`
- `PROPIETARIO_PHONE`

### Logs útiles:
- Activar logs de WhatsApp en n8n
- Verificar delivery status de mensajes
- Monitorear rate limits de API

## 7. COSTOS ESTIMADOS (MUY BAJO)

Para negocio de inflables:
- **0-50 reservas/mes**: €0 (gratuito)
- **50-200 reservas/mes**: €1-5/mes
- **200+ reservas/mes**: €10-20/mes

## 8. ALTERNATIVAS SI NO QUIERES WHATSAPP

- **Telegram**: Más fácil de configurar, también gratuito
- **Email**: Gmail/Outlook, completamente gratis
- **SMS**: Twilio (más caro pero más directo)
- **Slack/Discord**: Para notificaciones internas
```
