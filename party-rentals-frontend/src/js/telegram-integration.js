/**
 * Integración Telegram para Pequefest.com
 * Notificaciones instantáneas para el propietario
 */
class TelegramIntegration {
    constructor() {
        // Configuración del bot - CAMBIAR ESTOS VALORES
        this.botToken = 'YOUR_BOT_TOKEN_HERE';
        this.chatId = 'YOUR_CHAT_ID_HERE';
        this.isEnabled = false; // Cambiar a true cuando configures el bot
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
        
        console.log('📱 Telegram Integration - Pequefest.com iniciado');
    }
    
    /**
     * Envía notificación de nueva reserva al propietario
     */
    async sendBookingNotification(bookingData) {
        if (!this.isEnabled) {
            console.log('📱 Telegram deshabilitado - Notificación simulada');
            this.simulateNotification(bookingData);
            return { success: true, simulated: true };
        }
        
        try {
            const message = this.formatBookingMessage(bookingData);
            const response = await this.sendMessage(message);
            
            console.log('📱 Notificación Telegram enviada exitosamente');
            return { success: true, response };
        } catch (error) {
            console.error('❌ Error enviando notificación Telegram:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Formatea mensaje de reserva para Telegram
     */
    formatBookingMessage(booking) {
        const selectedInflatables = booking.selectedInflatables || ['large'];
        const inflatablesText = selectedInflatables.map(type => {
            const config = {
                'large': 'Castillo Grande Premium 🏰',
                'small': 'Casa de Rebote Pequeña 🎪'
            };
            return config[type] || type;
        }).join(' + ');
        
        const isMultiple = selectedInflatables.length > 1;
        const badge = isMultiple ? '🎊 RESERVA MÚLTIPLE' : '🎈 NUEVA RESERVA';
        const discount = isMultiple ? '\n✨ *Descuento 10% aplicado*' : '';
        
        return `${badge} - Pequefest.com

🆔 *ID:* ${booking.bookingId}

👤 *Cliente:* ${booking.customerName}
📧 *Email:* ${booking.customerEmail}
📱 *Teléfono:* ${booking.customerPhone}

📅 *Fecha:* ${this.formatDate(booking.rentalDate)}
🕐 *Duración:* ${booking.rentalHours || 8} horas
👥 *Invitados:* ${booking.guestCount || 'No especificado'}

${isMultiple ? '🎊' : '🎈'} *Inflables:* ${inflatablesText}
${booking.eventType ? `🎉 *Evento:* ${booking.eventType}` : ''}

📍 *Dirección de montaje:*
${booking.setupAddress}

💰 *Total:* €${booking.totalPrice?.toFixed(0) || '0'}${discount}

${booking.specialRequests ? `📝 *Notas especiales:*\n${booking.specialRequests}` : ''}

⚡ *Próximos pasos:*
• Confirmar disponibilidad
• Llamar cliente 24h antes
• Preparar equipo de montaje

🌐 Pequefest.com - Diversión sin límites`;
    }
    
    /**
     * Envía mensaje a Telegram
     */
    async sendMessage(text) {
        const url = `${this.apiUrl}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: this.chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * Simula notificación cuando Telegram está deshabilitado
     */
    simulateNotification(booking) {
        console.log(`
🎈 PEQUEFEST.COM - SIMULACIÓN TELEGRAM
======================================
📱 Notificación que recibirías en tu móvil:

${this.formatBookingMessage(booking)}

======================================
💡 Para activar notificaciones Telegram:
1. Crear bot con @BotFather
2. Obtener token y chat_id
3. Configurar en telegram-integration.js
4. Cambiar isEnabled = true
        `);
    }
    
    /**
     * Prueba conexión con Telegram
     */
    async testConnection() {
        if (!this.isEnabled) {
            return { 
                success: true, 
                message: 'Telegram deshabilitado - Modo simulación activo' 
            };
        }
        
        try {
            const response = await this.sendMessage(
                '🎈 Test desde Pequefest.com\n\n✅ Sistema funcionando correctamente'
            );
            return { success: true, message: 'Conexión Telegram OK' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    /**
     * Formatea fecha en español
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }).format(date);
    }
}

// Exportar para uso global
window.TelegramIntegration = TelegramIntegration;
