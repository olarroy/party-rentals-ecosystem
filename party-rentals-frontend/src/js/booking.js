/**
 * PARTY RENTALS - BOOKING SYSTEM
 * Sistema de calendario interactivo y gestión de reservas
 */

class BookingSystem {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedInflatable = 'large';
    this.availabilityData = new Map();
    this.isLoading = false;
    
    // Precios base
    this.pricing = {
      large: {
        weekday: 150,
        weekend: 200,
        holiday: 250
      },
      small: {
        weekday: 100,
        weekend: 130,
        holiday: 160
      }
    };
    
    // Días festivos (ejemplo)
    this.holidays = new Set([
      '2025-01-01', '2025-04-18', '2025-05-01', '2025-07-20',
      '2025-08-07', '2025-10-12', '2025-11-01', '2025-12-08', '2025-12-25'
    ]);
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderCalendar();
    this.loadAvailabilityData();
    this.updatePricing();
  }

  bindEvents() {
    // Navegación del calendario
    document.getElementById('prev-month')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
      this.loadAvailabilityData();
    });

    document.getElementById('next-month')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
      this.loadAvailabilityData();
    });

    // Selector de inflable
    document.querySelectorAll('.inflatable-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectInflatable(e.target.dataset.inflatable);
      });
    });

    // Formulario de reserva
    document.getElementById('booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBookingSubmit(e);
    });

    // Validación en tiempo real
    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  selectInflatable(type) {
    this.selectedInflatable = type;
    
    // Actualizar botones
    document.querySelectorAll('.inflatable-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-inflatable="${type}"]`).classList.add('active');
    
    // Recargar disponibilidad y precios
    this.loadAvailabilityData();
    this.updatePricing();
    this.updateSelectedDateInfo();
  }

  renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year');
    
    if (!grid || !monthYear) return;

    // Actualizar título
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

    // Limpiar grid
    const dayHeaders = grid.querySelectorAll('.day-header');
    grid.innerHTML = '';
    
    // Restaurar headers
    dayHeaders.forEach(header => grid.appendChild(header));

    // Obtener primer día del mes y días en el mes
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generar celdas
    const today = new Date();
    const currentMonth = this.currentDate.getMonth();
    
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      
      const cell = this.createDayCell(cellDate, currentMonth, today);
      grid.appendChild(cell);
    }
  }

  createDayCell(date, currentMonth, today) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    
    const indicator = document.createElement('div');
    indicator.className = 'availability-indicator';
    
    cell.appendChild(dayNumber);
    cell.appendChild(indicator);

    // Clases de estado
    if (date.getMonth() !== currentMonth) {
      cell.classList.add('other-month');
    }
    
    if (this.isSameDay(date, today)) {
      cell.classList.add('today');
    }
    
    if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
      cell.classList.add('selected');
    }
    
    if (date < today && !this.isSameDay(date, today)) {
      cell.classList.add('unavailable');
    } else {
      cell.addEventListener('click', () => this.selectDate(date));
    }

    // Indicador de disponibilidad
    this.updateAvailabilityIndicator(cell, date, indicator);
    
    return cell;
  }

  updateAvailabilityIndicator(cell, date, indicator) {
    const dateStr = this.formatDate(date);
    const availability = this.availabilityData.get(dateStr);
    
    if (!availability) {
      // Mostrar dot por defecto (disponible)
      const dot = document.createElement('div');
      dot.className = 'availability-dot';
      indicator.appendChild(dot);
      return;
    }

    // Mostrar disponibilidad por inflable
    const inflatables = ['large', 'small'];
    inflatables.forEach(type => {
      const dot = document.createElement('div');
      dot.className = 'availability-dot';
      
      if (availability[type] === 'busy') {
        dot.classList.add('busy');
      } else if (availability[type] === 'partial') {
        dot.classList.add('partial');
      }
      
      indicator.appendChild(dot);
    });
  }

  selectDate(date) {
    if (date < new Date() && !this.isSameDay(date, new Date())) {
      return;
    }

    this.selectedDate = new Date(date);
    this.renderCalendar();
    this.updateSelectedDateInfo();
    this.updatePricing();
    this.scrollToForm();
  }

  updateSelectedDateInfo() {
    const container = document.getElementById('selected-date-info');
    if (!container) return;

    if (!this.selectedDate) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    
    const dateStr = this.formatDateSpanish(this.selectedDate);
    const dayType = this.getDayType(this.selectedDate);
    const availability = this.getAvailabilityStatus(this.selectedDate);
    
    container.innerHTML = `
      <h3>Fecha Seleccionada</h3>
      <div class="date-details">
        <div class="date-item">
          <span class="date-label">Fecha:</span>
          <span class="date-value">${dateStr}</span>
        </div>
        <div class="date-item">
          <span class="date-label">Tipo de día:</span>
          <span class="date-value">${dayType}</span>
        </div>
        <div class="date-item">
          <span class="date-label">Inflable ${this.selectedInflatable}:</span>
          <span class="date-value" style="color: ${availability.color}">
            ${availability.text}
          </span>
        </div>
      </div>
    `;
  }

  updatePricing() {
    const container = document.getElementById('pricing-info');
    if (!container || !this.selectedDate) {
      container?.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    
    const dayType = this.getDayType(this.selectedDate);
    const basePrice = this.pricing[this.selectedInflatable][dayType];
    const setupFee = 25;
    const cleaningFee = 15;
    const total = basePrice + setupFee + cleaningFee;
    
    container.innerHTML = `
      <h3>Resumen de Precios</h3>
      <div class="pricing-breakdown">
        <div class="pricing-item">
          <span>Alquiler inflable (${dayType}):</span>
          <span class="price-amount">$${basePrice}</span>
        </div>
        <div class="pricing-item">
          <span>Instalación y setup:</span>
          <span class="price-amount">$${setupFee}</span>
        </div>
        <div class="pricing-item">
          <span>Limpieza:</span>
          <span class="price-amount">$${cleaningFee}</span>
        </div>
        <div class="pricing-item total">
          <span>Total:</span>
          <span class="price-amount">$${total}</span>
        </div>
      </div>
    `;
  }

  async loadAvailabilityData() {
    this.isLoading = true;
    this.showLoading();
    
    try {
      // Simular llamada a API
      await this.delay(500);
      
      // Generar datos de disponibilidad simulados
      const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
      const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.formatDate(d);
        
        // Simular disponibilidad aleatoria
        const availability = {
          large: Math.random() > 0.3 ? 'available' : 'busy',
          small: Math.random() > 0.2 ? 'available' : 'busy'
        };
        
        this.availabilityData.set(dateStr, availability);
      }
      
      this.renderCalendar();
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  async handleBookingSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.showLoading();
    
    try {
      const formData = new FormData(event.target);
      const bookingData = {
        date: this.formatDate(this.selectedDate),
        inflatable: this.selectedInflatable,
        customer: {
          name: formData.get('customer-name'),
          email: formData.get('customer-email'),
          phone: formData.get('customer-phone'),
          address: formData.get('customer-address')
        },
        event: {
          type: formData.get('event-type'),
          guests: parseInt(formData.get('guest-count')),
          hours: parseInt(formData.get('rental-hours')),
          notes: formData.get('special-requests')
        },
        pricing: this.calculateTotalPrice()
      };
      
      // Simular envío a API
      await this.delay(1000);
      const result = await this.submitBooking(bookingData);
      
      if (result.success) {
        this.showSuccessMessage(result.bookingId);
        this.resetForm();
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      this.showError('Error al procesar la reserva. Por favor intente nuevamente.');
    } finally {
      this.hideLoading();
    }
  }

  async submitBooking(bookingData) {
    // Simular API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          bookingId: 'BR' + Date.now(),
          message: 'Reserva creada exitosamente'
        });
      }, 1000);
    });
  }

  validateForm() {
    let isValid = true;
    
    if (!this.selectedDate) {
      this.showError('Por favor seleccione una fecha');
      return false;
    }
    
    const requiredFields = [
      'customer-name',
      'customer-email',
      'customer-phone',
      'customer-address',
      'event-type',
      'guest-count',
      'rental-hours'
    ];
    
    requiredFields.forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Limpiar errores previos
    this.clearFieldError(field);
    
    // Validar campo requerido
    if (!value) {
      isValid = false;
      message = 'Este campo es requerido';
    } else {
      // Validaciones específicas
      switch (field.name) {
        case 'customer-email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Ingrese un email válido';
          }
          break;
          
        case 'customer-phone':
          const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            message = 'Ingrese un teléfono válido';
          }
          break;
          
        case 'guest-count':
          const guests = parseInt(value);
          if (guests < 1 || guests > 200) {
            isValid = false;
            message = 'Número de invitados debe estar entre 1 y 200';
          }
          break;
          
        case 'rental-hours':
          const hours = parseInt(value);
          if (hours < 4 || hours > 12) {
            isValid = false;
            message = 'Horas de alquiler debe estar entre 4 y 12';
          }
          break;
      }
    }
    
    if (!isValid) {
      this.showFieldError(field, message);
    } else {
      field.classList.add('success');
    }
    
    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.form-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  clearFieldError(field) {
    field.classList.remove('error', 'success');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  showSuccessMessage(bookingId) {
    const container = document.getElementById('booking-form-section');
    container.innerHTML = `
      <div class="success-message">
        <h3>¡Reserva Confirmada!</h3>
        <p>Su reserva ha sido creada exitosamente.</p>
        <p><strong>ID de Reserva:</strong> ${bookingId}</p>
        <p>Recibirá un email de confirmación en breve.</p>
        <button class="btn btn-white mt-lg" onclick="location.reload()">
          Nueva Reserva
        </button>
      </div>
    `;
  }

  calculateTotalPrice() {
    if (!this.selectedDate) return 0;
    
    const dayType = this.getDayType(this.selectedDate);
    const basePrice = this.pricing[this.selectedInflatable][dayType];
    const setupFee = 25;
    const cleaningFee = 15;
    
    return {
      base: basePrice,
      setup: setupFee,
      cleaning: cleaningFee,
      total: basePrice + setupFee + cleaningFee
    };
  }

  // Utility functions
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  formatDateSpanish(date) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  getDayType(date) {
    const dateStr = this.formatDate(date);
    
    if (this.holidays.has(dateStr)) {
      return 'holiday';
    }
    
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend';
    }
    
    return 'weekday';
  }

  getAvailabilityStatus(date) {
    const dateStr = this.formatDate(date);
    const availability = this.availabilityData.get(dateStr);
    
    if (!availability) {
      return { text: 'Disponible', color: '#51cf66' };
    }
    
    const status = availability[this.selectedInflatable];
    
    switch (status) {
      case 'available':
        return { text: 'Disponible', color: '#51cf66' };
      case 'busy':
        return { text: 'No disponible', color: '#ff6b6b' };
      case 'partial':
        return { text: 'Disponibilidad limitada', color: '#ffc947' };
      default:
        return { text: 'Consultame', color: '#9e9e9e' };
    }
  }

  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  scrollToForm() {
    document.getElementById('booking-form-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  showLoading() {
    const loader = document.createElement('div');
    loader.id = 'booking-loader';
    loader.className = 'loading';
    loader.innerHTML = `
      <div class="spinner"></div>
      <span class="loading-text">Procesando...</span>
    `;
    
    document.body.appendChild(loader);
  }

  hideLoading() {
    const loader = document.getElementById('booking-loader');
    if (loader) {
      loader.remove();
    }
  }

  showError(message) {
    // Implement error display
    alert(message); // Temporary - replace with better UI
  }

  resetForm() {
    document.getElementById('booking-form')?.reset();
    this.selectedDate = null;
    this.updateSelectedDateInfo();
    this.updatePricing();
    this.renderCalendar();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calendar-grid')) {
    window.bookingSystem = new BookingSystem();
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookingSystem;
}
