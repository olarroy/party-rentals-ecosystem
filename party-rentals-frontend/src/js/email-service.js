/**
 * Sistema de emails para Pequefest.com
 * Confirmaciones para cliente y notificaciones para propietario
 */
class EmailService {
    constructor() {
        // Obtener configuración desde ConfigManager
        const config = window.configManager?.getEmailConfig() || {
            serviceId: 'YOUR_SERVICE_ID',
            publicKey: 'YOUR_PUBLIC_KEY',
            enabled: false
        };
        
        this.serviceId = config.serviceId;
        this.publicKey = config.publicKey;
        this.isEnabled = config.enabled;
        
        // Templates
        this.templates = {
            customerConfirmation: config.customerTemplate || 'YOUR_CUSTOMER_TEMPLATE_ID',
            ownerNotification: config.ownerTemplate || 'YOUR_OWNER_TEMPLATE_ID'
        };
        
        console.log('📧 Email Service - Pequefest.com iniciado');
        console.log('📧 Estado:', this.isEnabled ? 'HABILITADO' : 'SIMULACIÓN');
    }
    
    /**
     * Envía confirmación al cliente
     */
    async sendCustomerConfirmation(bookingData) {
        const emailData = this.formatCustomerEmail(bookingData);
        
        if (!this.isEnabled) {
            console.log('📧 Email deshabilitado - Confirmación simulada');
            this.simulateCustomerEmail(emailData);
            return { success: true, simulated: true };
        }
        
        try {
            const response = await this.sendEmail(
                this.templates.customerConfirmation,
                emailData
            );
            console.log('📧 Email de confirmación enviado al cliente');
            return { success: true, response };
        } catch (error) {
            console.error('❌ Error enviando email al cliente:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Envía notificación al propietario  
     */
    async sendOwnerNotification(bookingData) {
        const emailData = this.formatOwnerEmail(bookingData);
        
        if (!this.isEnabled) {
            console.log('📧 Email deshabilitado - Notificación simulada');
            this.simulateOwnerEmail(emailData);
            return { success: true, simulated: true };
        }
        
        try {
            const response = await this.sendEmail(
                this.templates.ownerNotification,
                emailData
            );
            console.log('📧 Email de notificación enviado al propietario');
            return { success: true, response };
        } catch (error) {
            console.error('❌ Error enviando email al propietario:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Formatea datos para email del cliente
     */
    formatCustomerEmail(booking) {
        const selectedInflatables = booking.selectedInflatables || ['large'];
        const inflatablesText = selectedInflatables.map(type => {
            const config = {
                'large': 'Castillo Grande Premium',
                'small': 'Casa de Rebote Pequeña'
            };
            return config[type] || type;
        }).join(' + ');
        
        const isMultiple = selectedInflatables.length > 1;
        const discountText = isMultiple ? 'Descuento múltiple (10%) aplicado' : '';
        
        return {
            to_name: booking.customerName,
            to_email: booking.customerEmail,
            booking_id: booking.bookingId,
            rental_date: this.formatDate(booking.rentalDate),
            rental_hours: booking.rentalHours || 8,
            inflatable_types: inflatablesText,
            guest_count: booking.guestCount || 'No especificado',
            event_type: booking.eventType || 'Celebración',
            setup_address: booking.setupAddress,
            special_requests: booking.specialRequests || 'Ninguna',
            total_price: `€${booking.totalPrice?.toFixed(0) || '0'}`,
            discount_info: discountText,
            company_name: 'Pequefest.com',
            company_email: '(pendiente configuración)',
            company_phone: '(pendiente configuración)',
            website: 'pequefest.com'
        };
    }
    
    /**
     * Formatea datos para email del propietario
     */
    formatOwnerEmail(booking) {
        const customerData = this.formatCustomerEmail(booking);
        
        return {
            ...customerData,
            to_name: 'Oscar Larroy',
            to_email: 'oscarlarroy@gmail.com', // Email real para notificaciones
            // to_email: 'info@pequefest.com', // TODO: Cambiar cuando esté configurado
            notification_type: 'Nueva Reserva',
            phone_number: booking.customerPhone,
            created_at: new Date().toLocaleString('es-ES')
        };
    }
    
    /**
     * Envía email usando EmailJS
     */
    async sendEmail(templateId, templateParams) {
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS no está cargado');
        }
        
        return await emailjs.send(
            this.serviceId,
            templateId,
            templateParams,
            this.publicKey
        );
    }
    
    /**
     * Simula email del cliente
     */
    simulateCustomerEmail(emailData) {
        console.log(`
📧 PEQUEFEST.COM - SIMULACIÓN EMAIL CLIENTE
==========================================
Para: ${emailData.to_email}
Asunto: ¡Reserva confirmada! - Pequefest.com

Estimado/a ${emailData.to_name},

¡Gracias por elegir Pequefest.com para tu celebración!

📋 DETALLES DE TU RESERVA:
• ID de Reserva: ${emailData.booking_id}
• Fecha: ${emailData.rental_date}
• Duración: ${emailData.rental_hours} horas
• Inflables: ${emailData.inflatable_types}
• Invitados: ${emailData.guest_count}
• Total: ${emailData.total_price}
${emailData.discount_info ? `• ${emailData.discount_info}` : ''}

📍 DIRECCIÓN DE MONTAJE:
${emailData.setup_address}

🚛 PRÓXIMOS PASOS:
• Te llamaremos 24h antes del evento
• Montaje incluido 1 hora antes
• Desmontaje al final del alquiler

¡Que disfrutes tu fiesta!

Pequefest.com - Diversión sin límites
📧 info@pequefest.com | 📱 +34 123 456 789
==========================================
        `);
    }
    
    /**
     * Simula email del propietario
     */
    simulateOwnerEmail(emailData) {
        console.log(`
📧 PEQUEFEST.COM - SIMULACIÓN EMAIL PROPIETARIO
===============================================
Para: oscarlarroy@gmail.com
Asunto: 🎈 Nueva Reserva - ${emailData.booking_id}

NUEVA RESERVA RECIBIDA:

Cliente: ${emailData.to_name}
Email: ${emailData.to_email}
Teléfono: ${emailData.phone_number}

Fecha: ${emailData.rental_date}
Inflables: ${emailData.inflatable_types}
Total: ${emailData.total_price}

Dirección: ${emailData.setup_address}

ACCIONES REQUERIDAS:
✓ Confirmar disponibilidad
✓ Llamar cliente 24h antes
✓ Preparar equipo

Pequefest.com - Panel de Control
===============================================
        `);
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
    
    /**
     * Prueba configuración de email
     */
    async testConnection() {
        if (!this.isEnabled) {
            return { 
                success: true, 
                message: 'Email deshabilitado - Modo simulación activo' 
            };
        }
        
        try {
            const testData = {
                to_name: 'Test',
                to_email: 'test@pequefest.com',
                message: 'Test desde Pequefest.com - Sistema funcionando'
            };
            
            await this.sendEmail('test_template', testData);
            return { success: true, message: 'Configuración email OK' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Exportar para uso global
window.EmailService = EmailService;
