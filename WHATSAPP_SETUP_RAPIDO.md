# 🚀 GUÍA RÁPIDA: Implementar WhatsApp en 30 minutos

## ✅ OPCIÓN MÁS FÁCIL: n8n Cloud

### 1. Crear cuenta n8n Cloud (5 min)
- Ve a: https://n8n.cloud/
- Registro gratuito
- Plan gratuito: 5,000 ejecuciones/mes (más que suficiente)

### 2. Configurar WhatsApp Business API (10 min)  
- Ve a: https://developers.facebook.com/
- Crear App → Business → WhatsApp
- Obtener:
  - **Access Token**: `EAAxxxxxxx...`
  - **Phone Number ID**: `1234567890123456`
  - **Verify Token**: `tu-token-personalizado`

### 3. Importar workflow en n8n (5 min)
- Copia el contenido de `n8n-workflow-whatsapp.json`
- En n8n Cloud: "Import from JSON"
- Pegar el JSON y guardar

### 4. Configurar credenciales (5 min)
- En n8n: Settings → Credentials
- Crear "WhatsApp Business Account":
  - Access Token: `EAAxxxxxxx...`
  - Phone Number ID: `1234567890123456`
- Crear "Gmail" (para emails de confirmación)

### 5. Obtener URL del webhook (2 min)
- En el nodo "Webhook - Nueva Reserva"
- Copiar la URL generada: `https://xxx.app.n8n.cloud/webhook/party-rentals`

### 6. Activar en tu sitio web (3 min)
```javascript
// En src/js/n8n-integration.js cambiar estas líneas:
this.webhookURL = 'https://xxx.app.n8n.cloud/webhook/party-rentals';
this.isEnabled = true; // ¡CAMBIAR A TRUE!
```

## 📱 CONFIGURACIÓN WHATSAPP DETALLADA

### Meta for Developers - Paso a paso:

1. **Crear App**:
   - Tipo: Business
   - Categoría: Other
   - Nombre: "FiestaInflables Bot"

2. **Configurar WhatsApp**:
   - Add Product: WhatsApp
   - API Setup → Get started
   - **Temporary access token** (válido 24h para testing)
   - **Permanent access token** (para producción)

3. **Webhook Configuration**:
   - Callback URL: `https://xxx.app.n8n.cloud/webhook/whatsapp-verify`
   - Verify Token: `party-rentals-verify-2025`
   - Subscribe to: `messages`

4. **Número de teléfono**:
   - Add phone number → Tu número personal
   - Verificar con código SMS
   - ¡Ya puedes recibir mensajes de prueba!

## 🔧 PERSONALIZACIÓN MENSAJES

### Cliente (confirmación):
```
🎉 ¡Reserva Confirmada - FiestaInflables!

📋 Detalles de tu reserva:
• 📅 Fecha: {fecha}
• 🎈 Inflables: {inflables}
• ⏰ Duración: {horas} horas
• 💰 Total: €{total}

🆔 ID Reserva: {id}

📞 Próximos pasos:
• Te llamaremos 24h antes del evento
• ¡Que disfrutes la fiesta! 🎊

FiestaInflables - Tu diversión es nuestra pasión ✨
```

### Propietario (notificación):
```
🔔 NUEVA RESERVA

👤 Cliente: {nombre}
📱 Teléfono: {telefono}
📅 Fecha: {fecha}
🎈 Inflables: {inflables}
💰 Total: €{total}
📍 Dirección: {direccion}

⚡ Confirmar disponibilidad y llamar cliente
```

## 💰 COSTOS REALES

### WhatsApp Cloud API:
- **Gratuito**: 1,000 conversaciones/mes
- **Después**: ~€0.005 por conversación
- **Para inflables**: Máximo €5-10/mes

### n8n Cloud:
- **Gratuito**: 5,000 ejecuciones/mes
- **Starter**: €20/mes (50,000 ejecuciones)
- **Para inflables**: Plan gratuito suficiente

### Total estimado: **€0-5/mes** 🎯

## ⚡ TESTING RÁPIDO

### 1. Probar webhook:
```bash
curl -X POST https://xxx.app.n8n.cloud/webhook/party-rentals \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: party-rentals-2025-secure" \
  -d '{
    "reservation": {
      "id": "TEST001",
      "date": "2025-10-15",
      "inflatable_types": ["large"],
      "total_price": 175.50,
      "customer": {
        "name": "Test User",
        "phone": "+34123456789",
        "email": "test@test.com",
        "address": "Test Address"
      },
      "event": {
        "hours": 6,
        "guests": 25
      }
    }
  }'
```

### 2. Verificar en WhatsApp:
- Deberías recibir mensaje de confirmación
- El propietario recibe notificación

## 🔥 ALTERNATIVAS RÁPIDAS

### Si WhatsApp es complicado:

**Telegram (Más fácil)**:
- Bot API gratuito e ilimitado
- Setup en 5 minutos
- @BotFather para crear bot

**Solo Email**:
- Gmail/Outlook gratuito
- Configuración automática
- HTML bonito con CSS

**Slack/Discord**:
- Para notificaciones internas
- Webhooks directos
- Muy fácil de configurar

## 📞 ¿NECESITAS AYUDA?

Si encuentras algún problema:
1. Revisa los logs en n8n Cloud
2. Verifica tokens en Meta for Developers  
3. Confirma que el webhook esté activo
4. Prueba con Postman/curl primero

¡El 90% de problemas son tokens incorrectos o webhooks mal configurados! 🤖
