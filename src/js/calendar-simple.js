/**
 * SISTEMA DE RESERVAS - CALENDARIO FUNCIONAL
 * Versión simplificada que garantiza funcionalidad básica
 */

console.log('🚀 Cargando sistema de reservas...');

class BookingCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedInflatables = new Set(['large']); // Cambio a Set para múltiples selecciones
    this.availabilityData = new Map();
    
    // Datos de inflables
    this.inflatables = {
      large: {
        name: 'Castillo Grande Premium',
        weekday_price: 150.00,
        weekend_price: 200.00,
        holiday_price: 250.00
      },
      small: {
        name: 'Casa de Rebote Pequeña',
        weekday_price: 100.00,
        weekend_price: 130.00,
        holiday_price: 160.00
      }
    };
    
    // Días festivos
    this.holidays = new Set([
      '2025-01-01', '2025-04-18', '2025-05-01', '2025-07-20',
      '2025-08-07', '2025-10-12', '2025-11-01', '2025-12-08', '2025-12-25'
    ]);
    
    console.log('✅ Datos inicializados');
    this.init();
  }

  init() {
    console.log('🔄 Inicializando componentes...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('🎯 Configurando eventos y calendario...');
    
    this.bindEvents();
    this.generateAvailability();
    this.renderCalendar();
    this.updatePricing();
    
    console.log('✅ Sistema completamente inicializado');
  }

  bindEvents() {
    console.log('🔗 Configurando eventos...');
    
    // Navegación del calendario
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        console.log('⬅️ Mes anterior');
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generateAvailability();
        this.renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        console.log('➡️ Mes siguiente');
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generateAvailability();
        this.renderCalendar();
      });
    }

    // Botones de selector de inflable
    const buttons = document.querySelectorAll('.inflatable-btn');
    console.log(`📍 Encontrados ${buttons.length} botones de inflable`);
    
    buttons.forEach((btn, index) => {
      const type = btn.getAttribute('data-inflatable');
      console.log(`📍 Botón ${index}: ${type}`);
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`🎯 Seleccionando inflable: ${type}`);
        this.selectInflatable(type);
      });
    });

    // Campos del formulario que afectan el precio
    const hoursSelect = document.getElementById('rental-hours');
    if (hoursSelect) {
      hoursSelect.addEventListener('change', () => {
        console.log('🕐 Horas cambiadas');
        this.updatePricing();
      });
    }
  }

  selectInflatable(type) {
    console.log(`🎈 Toggle inflable: ${type}`);
    
    if (!type || !this.inflatables[type]) {
      console.error('❌ Tipo de inflable inválido:', type);
      return;
    }

    // Toggle selección múltiple
    if (this.selectedInflatables.has(type)) {
      // Si ya está seleccionado, lo quitamos (solo si hay más de uno)
      if (this.selectedInflatables.size > 1) {
        this.selectedInflatables.delete(type);
        console.log(`➖ Quitado: ${type}`);
      } else {
        console.log(`⚠️ No se puede quitar el último inflable seleccionado`);
        return;
      }
    } else {
      // Si no está seleccionado, lo agregamos
      this.selectedInflatables.add(type);
      console.log(`➕ Agregado: ${type}`);
    }

    // Actualizar botones
    this.updateInflatableButtons();

    // Actualizar resumen de selección
    this.updateSelectionSummary();

    // Actualizar disponibilidad y precios
    this.generateAvailability();
    this.renderCalendar();
    this.updatePricing();
    
    console.log(`✅ Inflables seleccionados:`, Array.from(this.selectedInflatables));
  }

  updateInflatableButtons() {
    const buttons = document.querySelectorAll('.inflatable-btn');
    buttons.forEach(btn => {
      const btnType = btn.getAttribute('data-inflatable');
      const icon = btn.querySelector('.selection-icon');
      
      if (this.selectedInflatables.has(btnType)) {
        btn.classList.add('active');
        if (icon) {
          icon.classList.remove('fa-circle');
          icon.classList.add('fa-check-circle');
        }
        console.log(`✅ Activado botón: ${btnType}`);
      } else {
        btn.classList.remove('active');
        if (icon) {
          icon.classList.remove('fa-check-circle');
          icon.classList.add('fa-circle');
        }
        console.log(`⭕ Desactivado botón: ${btnType}`);
      }
    });
  }

  updateSelectionSummary() {
    const summary = document.getElementById('selection-summary');
    if (!summary) return;

    const count = this.selectedInflatables.size;
    const selectedNames = Array.from(this.selectedInflatables)
      .map(type => this.inflatables[type].name)
      .join(' + ');

    summary.innerHTML = `
      <span class="selected-count">
        ${count} inflable${count > 1 ? 's' : ''} seleccionado${count > 1 ? 's' : ''}: 
        <strong>${selectedNames}</strong>
      </span>
    `;
  }

  generateAvailability() {
    console.log('🔄 Generando disponibilidad...');
    
    const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Limpiar datos previos
    this.availabilityData.clear();
    
    // Generar disponibilidad para cada día del mes
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = this.formatDate(d);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const today = new Date();
      const isPast = d < today;
      
      let status;
      if (isPast) {
        status = 'past';
      } else if (isWeekend) {
        // Fines de semana más ocupados
        status = Math.random() > 0.4 ? 'available' : 'busy';
      } else {
        // Entre semana más disponibilidad
        status = Math.random() > 0.2 ? 'available' : 'busy';
      }
      
      this.availabilityData.set(dateStr, status);
    }
    
    console.log(`✅ Disponibilidad generada para ${this.availabilityData.size} días`);
  }

  renderCalendar() {
    console.log('🗓️ Renderizando calendario...');
    
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year');
    
    if (!grid) {
      console.error('❌ No se encontró calendar-grid');
      return;
    }
    
    if (!monthYear) {
      console.error('❌ No se encontró month-year');
      return;
    }

    // Actualizar título del mes
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

    // Guardar headers de días
    const headers = grid.querySelectorAll('.day-header');
    
    // Limpiar grid pero mantener headers
    grid.innerHTML = '';
    headers.forEach(header => grid.appendChild(header));

    // Calcular fechas del calendario
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const today = new Date();
    const currentMonth = this.currentDate.getMonth();
    
    // Generar celdas de días
    let cellsAdded = 0;
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      
      const cell = this.createDayCell(cellDate, currentMonth, today);
      grid.appendChild(cell);
      cellsAdded++;
    }
    
    console.log(`✅ Calendario renderizado con ${cellsAdded} celdas`);
  }

  createDayCell(date, currentMonth, today) {
    const cell = document.createElement('div');
    const dateStr = this.formatDate(date);
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = this.isSameDay(date, today);
    const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
    const isPast = date < today;
    
    // Clases CSS
    let classes = ['calendar-day'];
    
    if (!isCurrentMonth) {
      classes.push('other-month');
    }
    if (isToday) {
      classes.push('today');
    }
    if (isSelected) {
      classes.push('selected');
    }
    if (isPast) {
      classes.push('past');
    } else {
      const availability = this.availabilityData.get(dateStr);
      if (availability) {
        classes.push(availability);
      }
    }
    
    cell.className = classes.join(' ');
    cell.textContent = date.getDate();
    
    // Hacer clickeable si no es pasado y está en el mes actual
    if (!isPast && isCurrentMonth) {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', () => {
        console.log(`📅 Fecha seleccionada: ${dateStr}`);
        this.selectDate(date);
      });
    }
    
    return cell;
  }

  selectDate(date) {
    const dateStr = this.formatDate(date);
    const availability = this.availabilityData.get(dateStr);
    
    if (availability === 'busy') {
      console.log('❌ Fecha no disponible');
      alert('Esta fecha no está disponible. Por favor selecciona otra fecha.');
      return;
    }
    
    console.log(`✅ Fecha seleccionada: ${dateStr}`);
    this.selectedDate = new Date(date);
    
    // Re-renderizar calendario para mostrar selección
    this.renderCalendar();
    
    // Actualizar información de fecha seleccionada
    this.updateSelectedDateInfo();
    
    // Actualizar precios
    this.updatePricing();
    
    // Scroll al formulario
    this.scrollToForm();
  }

  updateSelectedDateInfo() {
    const container = document.getElementById('selected-date-info');
    if (!container || !this.selectedDate || this.selectedInflatables.size === 0) {
      if (container) container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    const dateStr = this.formatDateSpanish(this.selectedDate);
    const dayType = this.getDayType(this.selectedDate);
    const selectedNames = Array.from(this.selectedInflatables)
      .map(type => this.inflatables[type].name)
      .join(' + ');
    
    container.innerHTML = `
      <div class="selected-date-card">
        <h3><i class="fas fa-calendar-check"></i> Reserva Seleccionada</h3>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <p><strong>Tipo de día:</strong> ${dayType}</p>
        <p><strong>Inflables:</strong> ${selectedNames}</p>
        ${this.selectedInflatables.size > 1 ? '<p class="multi-selection-note"><i class="fas fa-star"></i> <strong>¡Reserva múltiple con descuento!</strong></p>' : ''}
      </div>
    `;
  }

  updatePricing() {
    const container = document.getElementById('pricing-info');
    if (!container || !this.selectedDate || this.selectedInflatables.size === 0) {
      if (container) container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    
    const dayType = this.getDayType(this.selectedDate);
    const hours = parseInt(document.getElementById('rental-hours')?.value) || 6;
    
    // Calcular precios para cada inflable seleccionado
    let totalInflatables = 0;
    let itemsHTML = '';
    
    Array.from(this.selectedInflatables).forEach(type => {
      const inflatable = this.inflatables[type];
      
      // Calcular precio base según el día
      let basePrice;
      switch (dayType) {
        case 'festivo':
          basePrice = inflatable.holiday_price;
          break;
        case 'fin de semana':
          basePrice = inflatable.weekend_price;
          break;
        default:
          basePrice = inflatable.weekday_price;
      }
      
      // Ajustar por horas (precio base es para 6 horas)
      const hourlyRate = basePrice / 6;
      const adjustedPrice = hourlyRate * hours;
      totalInflatables += adjustedPrice;
      
      itemsHTML += `
        <div class="pricing-item">
          <span>${inflatable.name} (${hours}h):</span>
          <span class="price-amount">€${adjustedPrice.toFixed(2)}</span>
        </div>
      `;
    });
    
    // Calcular descuento por múltiples inflables
    const multiInflatableDiscount = this.selectedInflatables.size > 1 ? totalInflatables * 0.10 : 0;
    const discountedTotal = totalInflatables - multiInflatableDiscount;
    
    // Tarifas adicionales
    const setupFee = 25.00 * this.selectedInflatables.size; // Setup por inflable
    const cleaningFee = 15.00; // Una sola limpieza
    const total = discountedTotal + setupFee + cleaningFee;
    
    // Generar HTML para mostrar precios
    let discountHTML = '';
    if (multiInflatableDiscount > 0) {
      discountHTML = `
        <div class="pricing-item discount">
          <span><i class="fas fa-tags"></i> Descuento múltiples inflables (10%):</span>
          <span class="price-amount discount-amount">-€${multiInflatableDiscount.toFixed(2)}</span>
        </div>
      `;
    }
    
    container.innerHTML = `
      <div class="pricing-card">
        <h3><i class="fas fa-euro-sign"></i> Resumen de Precios</h3>
        <div class="pricing-breakdown">
          ${itemsHTML}
          ${discountHTML}
          <div class="pricing-item">
            <span>Instalación y montaje (${this.selectedInflatables.size} inflable${this.selectedInflatables.size > 1 ? 's' : ''}):</span>
            <span class="price-amount">€${setupFee.toFixed(2)}</span>
          </div>
          <div class="pricing-item">
            <span>Limpieza final:</span>
            <span class="price-amount">€${cleaningFee.toFixed(2)}</span>
          </div>
          <div class="pricing-item total">
            <span><strong>Total:</strong></span>
            <span class="price-amount"><strong>€${total.toFixed(2)}</strong></span>
          </div>
        </div>
        <p class="pricing-note">
          <i class="fas fa-info-circle"></i>
          Día ${dayType} - ${this.selectedInflatables.size > 1 ? '¡Descuento aplicado por múltiples inflables!' : 'Precios incluyen IVA'}
        </p>
        ${this.selectedInflatables.size > 1 ? '<div class="multi-rental-badge"><i class="fas fa-star"></i> ¡Reserva Múltiple!</div>' : ''}
      </div>
    `;
    
    console.log(`💰 Precios actualizados: €${total.toFixed(2)}`);
  }

  // Métodos auxiliares
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  formatDateSpanish(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  getDayType(date) {
    const dateStr = this.formatDate(date);
    const dayOfWeek = date.getDay();
    
    if (this.holidays.has(dateStr)) {
      return 'festivo';
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'fin de semana';
    } else {
      return 'entre semana';
    }
  }

  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  scrollToForm() {
    const formSection = document.getElementById('booking-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Método para manejar el envío del formulario
  async handleFormSubmission(formData) {
    console.log('📋 Procesando reserva múltiple...');

    try {
      // Generar ID único para la reserva
      const bookingId = `PQF${Date.now()}`;
      
      // Preparar datos de la reserva
      const reservationData = {
        bookingId: bookingId,
        rentalDate: this.formatDate(this.selectedDate),
        selectedInflatables: Array.from(this.selectedInflatables),
        totalPrice: this.calculateTotalPrice(),
        customerName: formData.get('customer-name'),
        customerEmail: formData.get('customer-email'),
        customerPhone: formData.get('customer-phone'),
        setupAddress: formData.get('customer-address'),
        eventType: formData.get('event-type'),
        guestCount: parseInt(formData.get('guest-count')),
        rentalHours: parseInt(formData.get('rental-hours')),
        specialRequests: formData.get('special-requests') || '',
        createdAt: new Date().toISOString()
      };

      console.log('📝 Datos de reserva preparados:', reservationData);

      // 1. Enviar notificación por email al cliente
      if (window.EmailService) {
        const emailService = new window.EmailService();
        const customerEmailResult = await emailService.sendCustomerConfirmation(reservationData);
        console.log('📧 Email cliente:', customerEmailResult);
      }

      // 2. Enviar notificación por email al propietario
      if (window.EmailService) {
        const emailService = new window.EmailService();
        const ownerEmailResult = await emailService.sendOwnerNotification(reservationData);
        console.log('📧 Email propietario:', ownerEmailResult);
      }

      // 3. Enviar notificación Telegram al propietario
      if (window.TelegramIntegration) {
        const telegramService = new window.TelegramIntegration();
        const telegramResult = await telegramService.sendBookingNotification(reservationData);
        console.log('📱 Telegram:', telegramResult);
      }

      // 4. Guardar en base de datos (Supabase)
      if (window.supabaseClient) {
        const dbResult = await this.saveToDatabase(reservationData);
        console.log('💾 Base de datos:', dbResult);
      }

      // 5. Fallback local
      this.saveToLocalStorage(reservationData);

      return {
        success: true,
        bookingId: bookingId,
        message: 'Reserva confirmada exitosamente'
      };

    } catch (error) {
      console.error('❌ Error procesando reserva:', error);
      return {
        success: false,
        message: 'Error procesando la reserva. Por favor, inténtalo de nuevo.'
      };
    }
  }

  async saveToDatabase(reservationData) {
    try {
      const { data, error } = await window.supabaseClient
        .from('reservations')
        .insert([{
          booking_id: reservationData.bookingId,
          rental_date: reservationData.rentalDate,
          inflatable_types: reservationData.selectedInflatables,
          total_price: reservationData.totalPrice,
          customer_name: reservationData.customerName,
          customer_email: reservationData.customerEmail,
          customer_phone: reservationData.customerPhone,
          setup_address: reservationData.setupAddress,
          event_type: reservationData.eventType,
          guest_count: reservationData.guestCount,
          rental_hours: reservationData.rentalHours,
          special_requests: reservationData.specialRequests,
          status: 'confirmed',
          created_at: reservationData.createdAt
        }]);

      if (error) throw error;

      console.log('✅ Reserva guardada en Supabase');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error guardando en Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  saveToLocalStorage(reservationData) {
    try {
      const savedReservations = JSON.parse(localStorage.getItem('pequefest_reservations') || '[]');
      savedReservations.push(reservationData);
      localStorage.setItem('pequefest_reservations', JSON.stringify(savedReservations));
      console.log('✅ Reserva guardada localmente');
    } catch (error) {
      console.error('❌ Error guardando localmente:', error);
    }
  }

  calculateTotalPrice() {
    if (!this.selectedDate || this.selectedInflatables.size === 0) return 0;

    const dayType = this.getDayType(this.selectedDate);
    const hours = parseInt(document.getElementById('rental-hours')?.value) || 6;
    
    // Calcular total de inflables
    let totalInflatables = 0;
    Array.from(this.selectedInflatables).forEach(type => {
      const inflatable = this.inflatables[type];
      let basePrice;
      
      switch (dayType) {
        case 'festivo':
          basePrice = inflatable.holiday_price;
          break;
        case 'fin de semana':
          basePrice = inflatable.weekend_price;
          break;
        default:
          basePrice = inflatable.weekday_price;
      }
      
      const hourlyRate = basePrice / 6;
      const adjustedPrice = hourlyRate * hours;
      totalInflatables += adjustedPrice;
    });
    
    // Descuento por múltiples inflables
    const multiInflatableDiscount = this.selectedInflatables.size > 1 ? totalInflatables * 0.10 : 0;
    const discountedTotal = totalInflatables - multiInflatableDiscount;
    
    // Tarifas adicionales
    const setupFee = 25.00 * this.selectedInflatables.size;
    const cleaningFee = 15.00;
    
    return discountedTotal + setupFee + cleaningFee;
  }
}

// Inicializar cuando el DOM esté listo
console.log('📋 Preparando inicialización...');

let bookingSystem = null;

function initBookingSystem() {
  console.log('🎬 Iniciando sistema de reservas...');
  try {
    bookingSystem = new BookingCalendar();
    console.log('✅ Sistema de reservas iniciado correctamente');
  } catch (error) {
    console.error('❌ Error iniciando sistema:', error);
  }
}

// Múltiples formas de asegurar la inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookingSystem);
} else {
  initBookingSystem();
}

// Backup por si acaso
setTimeout(() => {
  if (!bookingSystem) {
    console.log('🔄 Inicialización de backup...');
    initBookingSystem();
  }
}, 1000);

// Event listener para el formulario de reservas
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (!bookingSystem || !bookingSystem.selectedDate || bookingSystem.selectedInflatables.size === 0) {
        alert('Por favor, selecciona una fecha y al menos un inflable antes de enviar el formulario.');
        return;
      }

      console.log('📝 Enviando formulario de reserva...');
      
      // Mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(form);
        const result = await bookingSystem.handleFormSubmission(formData);

        if (result.success) {
          // Mostrar mensaje de éxito
          showSuccessMessage(result.bookingId, result.message);
          form.reset();
          
          // Reset del sistema
          bookingSystem.selectedDate = null;
          bookingSystem.selectedInflatables.clear();
          bookingSystem.selectedInflatables.add('large'); // Volver a selección por defecto
          bookingSystem.renderCalendar();
          bookingSystem.updateInflatableButtons();
          bookingSystem.updateSelectedDateInfo();
          bookingSystem.updatePricing();
        } else {
          throw new Error(result.message || 'Error procesando la reserva');
        }

      } catch (error) {
        console.error('❌ Error en formulario:', error);
        alert('Error: ' + error.message);
      } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

function showSuccessMessage(reservationId, message) {
  const formSection = document.getElementById('booking-form-section');
  if (formSection) {
    formSection.innerHTML = `
      <div class="success-message">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>¡Reserva Confirmada!</h3>
        <p>${message}</p>
        <div class="booking-details">
          <p><strong>ID de Reserva:</strong> ${reservationId}</p>
          <p><strong>Estado:</strong> Pendiente de confirmación</p>
        </div>
        <p class="success-note">Nos pondremos en contacto contigo para confirmar los detalles.</p>
        <button class="btn btn-primary mt-lg" onclick="location.reload()">
          <i class="fas fa-plus"></i> Nueva Reserva
        </button>
      </div>
    `;
  }
}

console.log('📄 Script de calendario cargado completamente');
