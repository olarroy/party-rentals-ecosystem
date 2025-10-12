/**
 * PARTY RENTALS - BOOKING SYSTEM
 * Sistema de calendario interactivo y gestión de reservas con Supabase
 */

class BookingSystem {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedInflatable = 'large';
    this.availabilityData = new Map();
    this.inflatables = new Map(); // Cache de inflables desde la base de datos
    this.isLoading = false;
    
    // Días festivos (ejemplo)
    this.holidays = new Set([
      '2025-01-01', '2025-04-18', '2025-05-01', '2025-07-20',
      '2025-08-07', '2025-10-12', '2025-11-01', '2025-12-08', '2025-12-25'
    ]);
    
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Inicializando sistema de reservas...');
      
      // Inicializar componentes básicos primero (sin Supabase)
      this.bindEvents();
      this.renderCalendar();
      this.updatePricing();
      
      console.log('✅ Calendario básico inicializado');
      
      // Intentar conectar con Supabase de forma asíncrona
      // this.initializeSupabase();
      
      // Por ahora usar datos simulados
      this.initializeFallbackData();
      this.loadSimulatedAvailability();
      
    } catch (error) {
      console.error('❌ Error inicializando sistema básico:', error);
      // Aún así mostrar el calendario básico
      this.renderCalendar();
    }
  }

  async initializeSupabase() {
    try {
      this.showLoading(true, 'Conectando con base de datos...');
      
      // Cargar inflables desde la base de datos
      await this.loadInflatables();
      
      // Cargar disponibilidad real
      await this.loadAvailabilityData();
      
      console.log('✅ Conexión con Supabase establecida');
    } catch (error) {
      console.error('❌ Error conectando con Supabase:', error);
      console.log('📍 Usando datos simulados como fallback');
      
      // Usar datos simulados como fallback
      this.initializeFallbackData();
      this.loadSimulatedAvailability();
    } finally {
      this.showLoading(false);
    }
  }

  // Datos de fallback si Supabase no está disponible
  initializeFallbackData() {
    this.inflatables.set('large', [{
      id: 'fallback-large',
      name: 'Castillo Grande Premium',
      size: 'large',
      weekday_price: 150.00,
      weekend_price: 200.00,
      holiday_price: 250.00
    }]);
    
    this.inflatables.set('small', [{
      id: 'fallback-small', 
      name: 'Casa de Rebote Pequeña',
      size: 'small',
      weekday_price: 100.00,
      weekend_price: 130.00,
      holiday_price: 160.00
    }]);
    
    console.log('✅ Datos de fallback inicializados');
  }

  // Cargar inflables desde Supabase
  async loadInflatables() {
    try {
      const inflatables = await supabaseService.getInflatables();
      
      // Almacenar en cache por tamaño
      inflatables.forEach(inflatable => {
        if (!this.inflatables.has(inflatable.size)) {
          this.inflatables.set(inflatable.size, []);
        }
        this.inflatables.get(inflatable.size).push(inflatable);
      });
      
      console.log('✅ Inflables cargados:', this.inflatables);
    } catch (error) {
      console.error('❌ Error cargando inflables:', error);
      throw error;
    }
  }

  init() {
    this.bindEvents();
    this.renderCalendar();
    this.loadAvailabilityData();
    this.updatePricing();
  }

  bindEvents() {
    // Navegación del calendario
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
        this.loadAvailabilityData();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
        this.loadAvailabilityData();
      });
    }

    // Selector de inflable - Mejorado con debug
    const inflatableBtns = document.querySelectorAll('.inflatable-btn');
    console.log('📍 Found inflatable buttons:', inflatableBtns.length);
    
    inflatableBtns.forEach((btn, index) => {
      console.log(`📍 Button ${index}:`, btn.dataset.inflatable, btn.textContent.trim());
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.target.dataset.inflatable || e.currentTarget.dataset.inflatable;
        console.log('🎯 Clicked inflatable type:', type);
        this.selectInflatable(type);
      });
    });

    // Formulario de reserva
    const form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBookingSubmit(e);
      });
    }

    // Validación en tiempo real
    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  selectInflatable(type) {
    if (!type) {
      console.error('❌ selectInflatable called without type');
      return;
    }

    console.log('🎯 Selecting inflatable:', type);
    this.selectedInflatable = type;
    
    // Actualizar botones - Mejorado con debug
    const allBtns = document.querySelectorAll('.inflatable-btn');
    console.log('📍 Found buttons for update:', allBtns.length);
    
    allBtns.forEach(btn => {
      btn.classList.remove('active');
      console.log('🔄 Removed active from:', btn.dataset.inflatable);
    });
    
    const targetBtn = document.querySelector(`[data-inflatable="${type}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
      console.log('✅ Added active to:', type);
    } else {
      console.error('❌ Target button not found for type:', type);
    }
    
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
    
    try {
      // Obtener inflables desde cache local
      const inflatables = this.inflatables.get(this.selectedInflatable) || [];
      
      if (!inflatables.length) {
        container.innerHTML = '<p class="error-message">No hay inflables disponibles para esta fecha</p>';
        return;
      }
      
      // Usar el primer inflable disponible
      const inflatable = inflatables[0];
      
      // Calcular precios
      const dayType = this.getDayType(this.selectedDate);
      const hours = parseInt(document.getElementById('rental-hours')?.value) || 6;
      
      let basePrice;
      if (dayType === 'holiday') {
        basePrice = inflatable.holiday_price;
      } else if (dayType === 'weekend') {
        basePrice = inflatable.weekend_price;
      } else {
        basePrice = inflatable.weekday_price;
      }
      
      // Ajustar por horas (precio base es para 6 horas)
      const hourlyRate = basePrice / 6;
      const adjustedPrice = hourlyRate * hours;
      
      const setupFee = 25.00;
      const cleaningFee = 15.00;
      const total = adjustedPrice + setupFee + cleaningFee;
      
      container.innerHTML = `
        <h3>Resumen de Precios</h3>
        <div class="pricing-breakdown">
          <div class="pricing-item">
            <span>Alquiler inflable (${dayType}, ${hours}h):</span>
            <span class="price-amount">€${adjustedPrice.toFixed(2)}</span>
          </div>
          <div class="pricing-item">
            <span>Instalación y setup:</span>
            <span class="price-amount">€${setupFee.toFixed(2)}</span>
          </div>
          <div class="pricing-item">
            <span>Limpieza:</span>
            <span class="price-amount">€${cleaningFee.toFixed(2)}</span>
          </div>
          <div class="pricing-item total">
            <span>Total:</span>
            <span class="price-amount">€${total.toFixed(2)}</span>
          </div>
        </div>
        <p class="pricing-note">
          <i class="fas fa-info-circle"></i>
          Inflable: ${inflatable.name}
        </p>
      `;
    } catch (error) {
      console.error('❌ Error actualizando precios:', error);
      container.innerHTML = '<p class="error-message">Error obteniendo precios</p>';
    }
  }

  async loadAvailabilityData() {
    this.isLoading = true;
    this.showLoading(true, 'Verificando disponibilidad...');
    
    try {
      // Obtener rango de fechas del mes actual
      const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
      const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
      
      // Obtener reservas existentes del mes
      const rentals = await supabaseService.getRentalsInRange(
        this.formatDate(startDate),
        this.formatDate(endDate)
      );
      
      // Limpiar datos de disponibilidad
      this.availabilityData.clear();
      
      // Verificar disponibilidad día por día
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.formatDate(d);
        
        // Verificar disponibilidad para cada tamaño
        const [largeAvailability, smallAvailability] = await Promise.all([
          supabaseService.checkAvailability('large', dateStr),
          supabaseService.checkAvailability('small', dateStr)
        ]);
        
        const availability = {
          large: largeAvailability.some(item => item.is_available) ? 'available' : 'busy',
          small: smallAvailability.some(item => item.is_available) ? 'available' : 'busy'
        };
        
        this.availabilityData.set(dateStr, availability);
      }
      
      this.renderCalendar();
      console.log('✅ Disponibilidad cargada desde Supabase');
    } catch (error) {
      console.error('❌ Error cargando disponibilidad:', error);
      // Fallback a disponibilidad simulada
      this.loadSimulatedAvailability();
    } finally {
      this.isLoading = false;
      this.showLoading(false);
    }
  }

  // Método de fallback para disponibilidad simulada
  async loadSimulatedAvailability() {
    console.log('📍 Cargando disponibilidad simulada...');
    
    const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Simular disponibilidad
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = this.formatDate(d);
      
      // Simular disponibilidad aleatoria pero con lógica
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPast = d < new Date();
      
      let availability;
      if (isPast) {
        availability = { large: 'past', small: 'past' };
      } else if (isWeekend) {
        // Fines de semana menos disponibilidad
        availability = {
          large: Math.random() > 0.6 ? 'available' : 'busy',
          small: Math.random() > 0.4 ? 'available' : 'busy'
        };
      } else {
        // Entre semana más disponibilidad
        availability = {
          large: Math.random() > 0.3 ? 'available' : 'busy',
          small: Math.random() > 0.2 ? 'available' : 'busy'
        };
      }
      
      this.availabilityData.set(dateStr, availability);
    }
    
    this.renderCalendar();
    console.log('✅ Disponibilidad simulada cargada');
  }

  async handleBookingSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.showLoading(true, 'Procesando reserva...');
    
    try {
      const formData = new FormData(event.target);
      
      // Validar fecha seleccionada
      if (!this.selectedDate) {
        throw new Error('Por favor selecciona una fecha');
      }
      
      // Validar disponibilidad una vez más antes de proceder
      const dateStr = this.formatDate(this.selectedDate);
      const availability = await supabaseService.checkAvailability(this.selectedInflatable, dateStr);
      
      if (!availability.some(item => item.is_available)) {
        throw new Error('Lo sentimos, la fecha seleccionada ya no está disponible');
      }
      
      // Obtener el inflable específico
      const availableInflatable = availability.find(item => item.is_available);
      const inflatable = await supabaseService.getInflatableById(availableInflatable.inflatable_id);
      
      if (!inflatable) {
        throw new Error('Error obteniendo información del inflable');
      }
      
      // Crear o actualizar cliente
      const customerData = {
        name: formData.get('customer-name'),
        email: formData.get('customer-email'),
        phone: formData.get('customer-phone'),
        address: formData.get('customer-address')
      };
      
      const customer = await supabaseService.upsertCustomer(customerData);
      
      // Calcular precios
      const hours = parseInt(formData.get('rental-hours')) || 6;
      const pricing = supabaseService.calculateRentalPrice(inflatable, dateStr, hours);
      
      // Preparar datos de la reserva
      const rentalData = {
        customer_id: customer.id,
        inflatable_id: inflatable.id,
        rental_date: dateStr,
        rental_hours: hours,
        guest_count: parseInt(formData.get('guest-count')),
        event_type: formData.get('event-type'),
        setup_address: customerData.address,
        special_requests: formData.get('special-requests'),
        base_price: pricing.basePrice,
        setup_fee: pricing.setupFee,
        cleaning_fee: pricing.cleaningFee,
        total_price: pricing.totalPrice,
        status: 'pending',
        payment_status: 'pending'
      };
      
      // Crear la reserva en Supabase
      const rental = await supabaseService.createRental(rentalData);
      
      console.log('✅ Reserva creada exitosamente:', rental.booking_id);
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage(rental.booking_id, rental.total_price);
      
      // Limpiar formulario y recargar disponibilidad
      this.resetForm();
      await this.loadAvailabilityData();
      
    } catch (error) {
      console.error('❌ Error en reserva:', error);
      this.showError(error.message || 'Error al procesar la reserva. Por favor intente nuevamente.');
    } finally {
      this.showLoading(false);
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

  showSuccessMessage(bookingId, totalPrice = null) {
    const container = document.getElementById('booking-form-section');
    const priceInfo = totalPrice ? `<p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>` : '';
    
    container.innerHTML = `
      <div class="success-message">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>¡Reserva Confirmada!</h3>
        <p>Su reserva ha sido creada exitosamente en nuestra base de datos.</p>
        <div class="booking-details">
          <p><strong>ID de Reserva:</strong> ${bookingId}</p>
          ${priceInfo}
          <p><strong>Estado:</strong> Pendiente de confirmación</p>
        </div>
        <p class="success-note">Nos pondremos en contacto con usted para confirmar los detalles de instalación.</p>
        <button class="btn btn-primary mt-lg" onclick="location.reload()">
          <i class="fas fa-plus"></i> Nueva Reserva
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
    // Create a better error display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 1rem;
      border-radius: 4px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-exclamation-triangle"></i>
        <strong>Error:</strong>
      </div>
      <p style="margin: 0.5rem 0;">${message}</p>
      <button onclick="this.parentElement.remove()" 
              style="position: absolute; top: 5px; right: 10px; background: none; border: none; color: white; font-size: 1.2em; cursor: pointer;">&times;</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
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
  console.log('🚀 DOM Content Loaded - Initializing Booking System');
  
  const calendarGrid = document.getElementById('calendar-grid');
  const inflatableBtns = document.querySelectorAll('.inflatable-btn');
  
  console.log('📍 Calendar grid found:', !!calendarGrid);
  console.log('📍 Inflatable buttons found:', inflatableBtns.length);
  
  if (calendarGrid) {
    console.log('✅ Initializing BookingSystem');
    window.bookingSystem = new BookingSystem();
    
    // Debug: Test button clicks manually
    setTimeout(() => {
      console.log('🔧 Setting up manual button debug');
      inflatableBtns.forEach(btn => {
        console.log('🔧 Button:', btn.dataset.inflatable, 'has active class:', btn.classList.contains('active'));
      });
    }, 1000);
  } else {
    console.warn('⚠️ Calendar grid not found - BookingSystem not initialized');
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookingSystem;
}
