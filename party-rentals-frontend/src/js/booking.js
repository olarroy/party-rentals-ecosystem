
document.addEventListener('DOMContentLoaded', async () => {

  // --- 0. Init Supabase ---
  const supabaseUrl = window.CONFIG ? window.CONFIG.SUPABASE_URL : 'MISSING_URL';
  const supabaseKey = window.CONFIG ? window.CONFIG.SUPABASE_ANON_KEY : 'MISSING_KEY';

  const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

  if (!supabase) {
    console.error("Supabase client not initialized.");
  }

  // --- 1. State ---
  const state = {
    inflatable: 'LARGE', // 'LARGE', 'SMALL', 'PACK'
    price: 80,
    date: null,
    allBookings: [] // Array of { date: 'YYYY-MM-DD', type: 'LARGE' }
  };

  // --- 2. Element Refs ---
  const summaryInfl = document.getElementById('summary-infl');
  const summaryDate = document.getElementById('summary-date');
  const summaryPrice = document.getElementById('summary-price');
  const radios = document.getElementsByName('inflatable');
  const bookingForm = document.getElementById('booking-form');

  // Custom Modal Refs
  const modal = document.getElementById('custom-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalIcon = document.getElementById('modal-icon');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // --- 3. Helper Functions ---
  function showModal(title, message, isSuccess = true) {
    if (!modal) {
      alert(message);
      return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalIcon.textContent = isSuccess ? '🎉' : '⚠️';

    if (isSuccess) {
      modalCloseBtn.textContent = '¡Genial!';
      modalCloseBtn.style.backgroundColor = 'var(--accent-color)';
    } else {
      modalCloseBtn.textContent = 'Entendido';
      modalCloseBtn.style.backgroundColor = 'var(--error-color)';
    }

    modal.classList.remove('hidden');
  }

  function hideModal() {
    if (modal) modal.classList.add('hidden');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);
  if (modal) modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  // --- 4. Logic Functions ---

  function getPriceForType(type) {
    switch (type) {
      case 'LARGE': return 80;
      case 'SMALL': return 60;
      case 'PACK': return 130;
      default: return 80;
    }
  }

  // IMPORTANT: Smart Availability Logic
  function getBlockedDatesForCurrentType() {
    const currentType = state.inflatable;

    // Filter bookings that conflict with current selection
    const conflictingBookings = state.allBookings.filter(b => {
      const bookedType = b.inflatable_type;

      if (currentType === 'PACK') {
        // If I want the PACK, I need BOTH to be free.
        // So ANY booking blocks me.
        return true;
      }

      if (currentType === 'LARGE') {
        // Large blocked by 'LARGE' or 'PACK' (since PACK includes Large)
        return bookedType === 'LARGE' || bookedType === 'PACK';
      }

      if (currentType === 'SMALL') {
        // Small blocked by 'SMALL' or 'PACK'
        return bookedType === 'SMALL' || bookedType === 'PACK';
      }

      return false;
    });

    return conflictingBookings.map(b => b.event_date);
  }


  // --- 5. Async Fetch ---
  async function fetchAllBookings() {
    if (!supabase) return [];

    try {
      // Fetch date AND type
      const { data, error } = await supabase
        .from('bookings')
        .select('event_date, inflatable_type')
        .neq('status', 'cancelled');

      if (error) throw error;

      return data;

    } catch (err) {
      console.error('Error fetching bookings:', err);
      return [];
    }
  }

  // --- 6. Init ---

  // Load Data
  state.allBookings = await fetchAllBookings();
  console.log("Todas las reservas:", state.allBookings);

  const initialBlockedDates = getBlockedDatesForCurrentType();

  // Flatpickr
  const calendar = flatpickr("#datePicker", {
    inline: true,
    locale: "es",
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: initialBlockedDates,
    onChange: (selectedDates, dateStr) => {
      state.date = selectedDates[0];
      updatePriceWithDate(state.date);
      updateUI();
    }
  });

  // Inflatable Radio Logic
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.inflatable = e.target.value;

      // 1. Update Price Base
      state.price = getPriceForType(state.inflatable);

      // 2. Check weekend increment
      if (state.date) updatePriceWithDate(state.date);

      // 3. REFRESH CALENDAR AVAILABILITY
      // This fixes the bug!
      const newBlockedDates = getBlockedDatesForCurrentType();
      calendar.set('disable', newBlockedDates);

      // Check if currently selected date is now blocked
      if (state.date) {
        const dateStr = state.date.toISOString().split('T')[0];
        if (newBlockedDates.includes(dateStr)) {
          // Oops, selected date is taken for this new item
          calendar.clear();
          state.date = null;
          showModal('Fecha no disponible', 'La fecha que tenías seleccionada está ocupada para este hinchable. Por favor, elige otra.', false);
        }
      }

      updateUI();
    });
  });

  function updatePriceWithDate(date) {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    let base = getPriceForType(state.inflatable);

    if (isWeekend) {
      // Add 20% or fixed amount? 
      // Previous logic was exact +20. Let's keep it simple.
      // Maybe +20 for single, +30 for pack? 
      // Let's do +20% roughly. 
      // Large(80)->100(+20), Small(60)->80(+20). Pack(130)->160(+30)?
      if (state.inflatable === 'PACK') base += 30;
      else base += 20;
    }
    state.price = base;
  }

  function updateUI() {
    if (state.inflatable === 'LARGE') summaryInfl.textContent = 'Castillo Grande';
    else if (state.inflatable === 'SMALL') summaryInfl.textContent = 'Castillo Pequeño';
    else summaryInfl.textContent = 'Pack Completo (2)';

    summaryPrice.textContent = `€${state.price}`;

    if (state.date) {
      summaryDate.textContent = state.date.toLocaleDateString('es-ES');
    } else {
      summaryDate.textContent = '--/--/----';
    }
  }

  // --- 7. Submit ---
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.date) {
      showModal('¡Ups!', 'Por favor, selecciona una fecha.', false);
      return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Procesando...';

    const formData = new FormData(bookingForm);

    const year = state.date.getFullYear();
    const month = String(state.date.getMonth() + 1).padStart(2, '0');
    const day = String(state.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const bookingPayload = {
      customer_name: formData.get('customer-name'),
      customer_email: 'no-email@provided.com',
      customer_phone: formData.get('customer-phone') || '',
      event_date: dateStr,
      inflatable_type: state.inflatable,
      total_price: state.price,
      status: 'pending'
    };

    try {
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select();

      if (error) throw error;

      showModal('¡Reserva Confirmada!', 'Nos pondremos en contacto contigo pronto por WhatsApp.', true);

    } catch (err) {
      console.error("Booking error:", err);
      showModal('Error', `Error al guardar: ${err.message}`, false);
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Confirmar Reserva';
    }
  });

  updateUI();
});
