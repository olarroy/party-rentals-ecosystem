# 🤖 GUÍA RÁPIDA: Configurar Telegram para Pequefest.com

## 🎯 ¿Qué conseguirás?

✅ **Notificaciones instantáneas** en tu móvil cuando alguien haga una reserva  
✅ **Información completa** de cada reserva: cliente, fecha, inflables, total  
✅ **100% gratuito** para siempre  
✅ **Setup en 5 minutos**

---

## 📱 PASO 1: Crear el Bot de Telegram

### 1.1 Abrir Telegram
- Abre **Telegram** en tu móvil o computadora
- Si no lo tienes, descárgalo: https://telegram.org

### 1.2 Buscar BotFather
- En la búsqueda, escribe: **@BotFather**
- Selecciona el bot oficial (tiene ✅ verificado)
- Toca **"Start"** o envía `/start`

### 1.3 Crear nuevo bot
```
Envía: /newbot

BotFather te preguntará:
1. "Alright, a new bot. How are we going to call it?"
   Responde: Pequefest Reservas Bot

2. "Good. Now let's choose a username for your bot."
   Responde: pequefest_reservas_bot
   (debe terminar en _bot)
```

### 1.4 ¡Listo! Copia tu token
BotFather te dará un mensaje como:
```
Done! Congratulations on your new bot. You will find it at t.me/pequefest_reservas_bot

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789

Keep your token secure and store it safely, it can be used by anyone to control your bot.
```

**🔑 COPIA ESE TOKEN** - Lo necesitarás en el paso 3.

---

## 💬 PASO 2: Obtener tu Chat ID

### 2.1 Enviar mensaje a tu bot
- Busca tu bot: **@pequefest_reservas_bot** (o el nombre que elegiste)
- Envía cualquier mensaje, por ejemplo: "Hola"

### 2.2 Obtener el Chat ID
- Abre tu navegador web
- Ve a esta URL (cambia TU_TOKEN por el token del paso 1):

```
https://api.telegram.org/botTU_TOKEN/getUpdates

Ejemplo:
https://api.telegram.org/bot1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789/getUpdates
```

### 2.3 Encontrar tu Chat ID
Verás algo como:
```json
{
  "ok": true,
  "result": [
    {
      "message": {
        "chat": {
          "id": 123456789,
          "first_name": "Tu Nombre",
          "type": "private"
        }
      }
    }
  ]
}
```

**🔑 COPIA ESE ID** (en este ejemplo: 123456789)

---

## ⚙️ PASO 3: Configurar en tu sitio web

### 3.1 Abrir el archivo de configuración
Navega a: `src/js/telegram-integration.js`

### 3.2 Cambiar los valores
Busca estas líneas al principio del archivo:
```javascript
this.botToken = 'YOUR_BOT_TOKEN_HERE';
this.chatId = 'YOUR_CHAT_ID_HERE';
this.isEnabled = false;
```

Cámbialas por:
```javascript
this.botToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789'; // Tu token del paso 1
this.chatId = '123456789'; // Tu chat ID del paso 2
this.isEnabled = true; // ¡IMPORTANTE: cambiar a true!
```

### 3.3 Guardar el archivo
Guarda los cambios con `Ctrl+S`

---

## 🧪 PASO 4: Probar que funciona

### 4.1 Hacer una reserva de prueba
- Ve a tu sitio: https://olarroy.github.io/party-rentals-ecosystem
- Haz clic en **"Reservar"**
- Selecciona una fecha futura
- Rellena el formulario con datos de prueba
- Envía la reserva

### 4.2 ¡Recibir notificación!
En unos segundos deberías recibir en Telegram:
```
🎈 NUEVA RESERVA - Pequefest.com

🆔 ID: PQF1699123456789

👤 Cliente: Test User
📧 Email: test@test.com
📱 Teléfono: +34123456789

📅 Fecha: lunes, 15 de octubre de 2025
🕐 Duración: 8 horas
👥 Invitados: 25

🎈 Inflables: Castillo Grande Premium

📍 Dirección de montaje:
Calle Test 123, Madrid

💰 Total: €175

⚡ Próximos pasos:
• Confirmar disponibilidad
• Llamar cliente 24h antes
• Preparar equipo de montaje

🌐 Pequefest.com - Diversión sin límites
```

---

## 🔧 RESOLUCIÓN DE PROBLEMAS

### ❌ No recibo notificaciones
1. **Verifica el token**: ¿Copiaste bien el token completo?
2. **Verifica el chat ID**: ¿Es el número correcto?
3. **¿Está habilitado?**: `this.isEnabled = true`
4. **Envía mensaje al bot**: Asegúrate de haber enviado al menos un mensaje

### ❌ Error "Bot was blocked by the user"
- Busca tu bot en Telegram y envíale un mensaje
- Toca "Start" o "/start"

### ❌ Error "Invalid token"
- El token debe incluir tanto números como letras
- Formato: `1234567890:ABCdefGHIjklMNO`
- No incluyas espacios ni comillas extra

### ❌ Bot no responde
- Los bots de Telegram no responden automáticamente
- Solo envían notificaciones cuando hay reservas
- Para probar, haz una reserva en tu sitio web

---

## ✨ PERSONALIZACIÓN

### Cambiar el mensaje de notificación
En `telegram-integration.js`, busca la función `formatBookingMessage()` y modifica el texto.

### Añadir más información
Puedes agregar campos como:
- Dirección del evento
- Tipo de celebración  
- Notas especiales
- Hora preferida de montaje

### Notificar a múltiples personas
Si quieres que varias personas reciban notificaciones:
1. Cada persona debe enviar un mensaje al bot
2. Obtener su chat ID siguiendo el paso 2
3. Crear un array de chat IDs en la configuración

---

## 🎯 SIGUIENTE NIVEL

### EmailJS (para emails profesionales)
- Regístrate en https://emailjs.com (gratis)
- Configura templates de email bonitos
- Confirmación automática al cliente

### Base de datos
- Las reservas ya se guardan en Supabase
- Acceso desde: https://supabase.com
- Panel de administración incluido

---

## 📞 ¿NECESITAS AYUDA?

Si algo no funciona:
1. **Revisa la consola** del navegador (F12)
2. **Verifica los tokens** otra vez
3. **Prueba enviar mensaje** manualmente al bot
4. **Reinicia el navegador** después de los cambios

¡El 90% de problemas son tokens incorrectos o el bot no habilitado (`isEnabled = false`)!

---

## 🎊 ¡FELICIDADES!

Ya tienes notificaciones instantáneas para **Pequefest.com**:

✅ **Cliente**: Recibe email de confirmación  
✅ **Propietario**: Email + notificación Telegram instantánea  
✅ **Costo**: €0 (completamente gratis)  
✅ **Profesionalidad**: 10/10  

**¡Tu sistema de reservas está completo!** 🎈✨
