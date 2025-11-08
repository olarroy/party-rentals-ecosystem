/**
 * INTEGRACIÓN N8N - SISTEMA DE WEBHOOKS
 * Sistema simplificado para enviar reservas a n8n via webhook
 */

class N8NIntegration {
  constructor() {
    // URL del webhook de n8n (se configurará cuando esté listo)
    this.webhookURL = 'https://n8n.yourdomain.com/webhook/party-rentals';
    this.isEnabled = false; // Cambiar a true cuando n8n esté configurado
    
    console.log('🔌 N8N Integration initialized');
  }

  async sendReservation(reservationData) {
    if (!this.isEnabled) {
      console.log('📧 N8N disabled, simulando envío de reserva...');
      return this.simulateReservation(reservationData);
    }

    try {
      console.log('🚀 Enviando reserva a N8N...');
      
      const payload = {
        timestamp: new Date().toISOString(),
        source: 'party-rentals-website',
        reservation: {
          id: this.generateReservationId(),
          date: reservationData.date,
          inflatable_types: reservationData.inflatableTypes,
          total_price: reservationData.totalPrice,
          customer: reservationData.customer,
          event: reservationData.event,
          special_requests: reservationData.specialRequests
        }
      };

      const response = await fetch(this.webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'party-rentals-2025-secure',
          'User-Agent': 'FiestaInflables-Website/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Reserva enviada a N8N exitosamente:', result);
      
      return {
        success: true,
        reservationId: payload.reservation.id,
        message: 'Reserva procesada correctamente'
      };

    } catch (error) {
      console.error('❌ Error enviando a N8N:', error);
      
      // Fallback: guardar localmente para reintento
      this.saveForRetry(reservationData);
      
      return {
        success: false,
        error: error.message,
        message: 'Error temporal. La reserva se ha guardado y se reintentará automáticamente.'
      };
    }
  }

  simulateReservation(reservationData) {
    // Simular procesamiento
    return new Promise((resolve) => {
      setTimeout(() => {
        const reservationId = this.generateReservationId();
        
        console.log('📝 Reserva simulada:', {
          id: reservationId,
          customer: reservationData.customer.name,
          date: reservationData.date,
          inflatables: reservationData.inflatableTypes,
          total: `€${reservationData.totalPrice.toFixed(2)}`
        });
        
        resolve({
          success: true,
          reservationId: reservationId,
          message: 'Reserva recibida correctamente (modo simulación)'
        });
      }, 1500);
    });
  }

  generateReservationId() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-4);
    return `BR${dateStr}-${timeStr}`;
  }

  saveForRetry(reservationData) {
    // Guardar en localStorage para reintento posterior
    const pendingReservations = JSON.parse(localStorage.getItem('pendingReservations') || '[]');
    pendingReservations.push({
      ...reservationData,
      timestamp: Date.now(),
      retryCount: 0
    });
    localStorage.setItem('pendingReservations', JSON.stringify(pendingReservations));
    console.log('💾 Reserva guardada para reintento');
  }

  async retryPendingReservations() {
    if (!this.isEnabled) return;

    const pendingReservations = JSON.parse(localStorage.getItem('pendingReservations') || '[]');
    if (pendingReservations.length === 0) return;

    console.log(`🔄 Reintentando ${pendingReservations.length} reservas pendientes...`);

    const processed = [];
    for (const reservation of pendingReservations) {
      if (reservation.retryCount < 3) {
        const result = await this.sendReservation(reservation);
        if (result.success) {
          processed.push(reservation);
        } else {
          reservation.retryCount++;
        }
      }
    }

    // Remover reservas procesadas exitosamente
    const remaining = pendingReservations.filter(r => !processed.includes(r));
    localStorage.setItem('pendingReservations', JSON.stringify(remaining));
    
    if (processed.length > 0) {
      console.log(`✅ ${processed.length} reservas reintentadas exitosamente`);
    }
  }

  // Configuración para cuando n8n esté listo
  configure(options) {
    this.webhookURL = options.webhookURL || this.webhookURL;
    this.isEnabled = options.enabled || false;
    
    console.log('⚙️ N8N configurado:', {
      url: this.webhookURL,
      enabled: this.isEnabled
    });

    // Reintentar reservas pendientes si se habilita
    if (this.isEnabled) {
      setTimeout(() => this.retryPendingReservations(), 2000);
    }
  }
}

// Crear instancia global
const n8nIntegration = new N8NIntegration();

// Exportar para uso en otros archivos
window.n8nIntegration = n8nIntegration;
