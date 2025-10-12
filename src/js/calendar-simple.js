/**
 * SISTEMA DE RESERVAS - CALENDARIO FUNCIONAL
 * Versión simplificada que garantiza funcionalidad básica
 */

console.log('🚀 Cargando sistema de reservas...');

class BookingCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedInflatable = 'large';
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
    console.log(`🎈 Cambiando a inflable: ${type}`);
    
    if (!type || !this.inflatables[type]) {
      console.error('❌ Tipo de inflable inválido:', type);
      return;
    }

    this.selectedInflatable = type;

    // Actualizar botones
    const buttons = document.querySelectorAll('.inflatable-btn');
    buttons.forEach(btn => {
      const btnType = btn.getAttribute('data-inflatable');
      if (btnType === type) {
        btn.classList.add('active');
        console.log(`✅ Activado botón: ${btnType}`);
      } else {
        btn.classList.remove('active');
        console.log(`⭕ Desactivado botón: ${btnType}`);
      }
    });

    // Actualizar disponibilidad y precios
    this.generateAvailability();
    this.renderCalendar();
    this.updatePricing();
    
    console.log(`✅ Inflable cambiado a: ${type}`);
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
    if (!container || !this.selectedDate) {
      if (container) container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    const dateStr = this.formatDateSpanish(this.selectedDate);
    const dayType = this.getDayType(this.selectedDate);
    const inflatable = this.inflatables[this.selectedInflatable];
    
    container.innerHTML = `
      <div class="selected-date-card">
        <h3><i class="fas fa-calendar-check"></i> Fecha Seleccionada</h3>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <p><strong>Tipo de día:</strong> ${dayType}</p>
        <p><strong>Inflable:</strong> ${inflatable.name}</p>
      </div>
    `;
  }

  updatePricing() {
    const container = document.getElementById('pricing-info');
    if (!container || !this.selectedDate) {
      if (container) container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    
    const inflatable = this.inflatables[this.selectedInflatable];
    const dayType = this.getDayType(this.selectedDate);
    const hours = parseInt(document.getElementById('rental-hours')?.value) || 6;
    
    // Calcular precio base
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
    
    const setupFee = 25.00;
    const cleaningFee = 15.00;
    const total = adjustedPrice + setupFee + cleaningFee;
    
    container.innerHTML = `
      <div class="pricing-card">
        <h3><i class="fas fa-euro-sign"></i> Resumen de Precios</h3>
        <div class="pricing-breakdown">
          <div class="pricing-item">
            <span>Alquiler ${inflatable.name} (${hours}h):</span>
            <span class="price-amount">€${adjustedPrice.toFixed(2)}</span>
          </div>
          <div class="pricing-item">
            <span>Instalación y montaje:</span>
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
          Día ${dayType} - Precios incluyen IVA
        </p>
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

console.log('📄 Script de calendario cargado completamente');
