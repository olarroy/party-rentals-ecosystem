
// Import config is handled by type="module" in HTML, but to ensure we get the global config check:
// We rely on window.CONFIG being populated by src/js/config.js

document.addEventListener('DOMContentLoaded', async () => {

  // --- 0. Init Supabase ---
  const supabaseUrl = window.CONFIG ? window.CONFIG.SUPABASE_URL : 'MISSING_URL';
  const supabaseKey = window.CONFIG ? window.CONFIG.SUPABASE_ANON_KEY : 'MISSING_KEY';

  const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

  if (!supabase) {
    console.error("Supabase client not initialized. Check CDN and keys.");
  }

  // --- 1. State ---
  const state = {
    inflatable: 'LARGE',
    price: 80,
    date: null,
    bookedDates: []
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
      alert(message); // Fallback
      return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalIcon.textContent = isSuccess ? '🎉' : '⚠️';

    // Update button style based on type
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

  // Close Modal Event
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideModal);
  }
  // Close on overlay click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });
  }


  // --- 4. Async Fetch Availability ---
  async function fetchBookedDates() {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('event_date')
        .neq('status', 'cancelled');

      if (error) throw error;

      return data.map(b => b.event_date);

    } catch (err) {
      console.error('Error fetching bookings:', err);
      return [];
    }
  }

  // --- 5. Logic & UI ---

  // Load Data
  state.bookedDates = await fetchBookedDates();
  console.log("Fechas ocupadas:", state.bookedDates);

  // Flatpickr Init
  flatpickr("#datePicker", {
    inline: true,
    locale: "es",
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: state.bookedDates,
    onChange: (selectedDates, dateStr) => {
      state.date = selectedDates[0];
      updatePriceWithDate(state.date);
      updateUI();
    }
  });

  // Inflatable logic
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.inflatable = e.target.value;
      // Update Price Logic
      state.price = state.inflatable === 'LARGE' ? 80 : 60;

      // Check weekend increment if date is selected
      if (state.date) updatePriceWithDate(state.date);

      updateUI();
    });
  });

  function updatePriceWithDate(date) {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    let base = state.inflatable === 'LARGE' ? 80 : 60;
    if (isWeekend) base += 20;
    state.price = base;
  }

  function updateUI() {
    summaryInfl.textContent = state.inflatable === 'LARGE' ? 'Castillo Grande' : 'Castillo Pequeño';
    summaryPrice.textContent = `€${state.price}`;

    if (state.date) {
      summaryDate.textContent = state.date.toLocaleDateString('es-ES');
    } else {
      summaryDate.textContent = '--/--/----';
    }
  }

  // --- 6. Form Submission ---
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.date) {
      showModal('¡Ups!', 'Por favor, selecciona una fecha en el calendario antes de continuar.', false);
      return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Procesando...';

    const formData = new FormData(bookingForm);

    // Ensure date is in YYYY-MM-DD local format
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

      // SUCCESS!
      showModal('¡Reserva Confirmada!', 'Nos pondremos en contacto contigo pronto por WhatsApp para confirmar los detalles.', true);

      // Reset form after success logic if needed
      // window.location.href = 'index.html'; // Or keep them on page

    } catch (err) {
      console.error("Booking error:", err);
      showModal('Error', `Hubo un problema al guardar tu reserva: ${err.message}. Inténtalo de nuevo.`, false);

      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Confirmar Reserva';
    }
  });

  // Init UI
  updateUI();
});
