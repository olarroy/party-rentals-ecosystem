
// Import config is handled by type="module" in HTML, but here we can just use the global Supabase object from CDN

document.addEventListener('DOMContentLoaded', async () => {

  // --- 0. Init Supabase ---
  // Reads from window.ENV (injected by src/js/env.js) or standard config
  const supabaseUrl = (window.ENV && window.ENV.SUPABASE_URL) || 'MISSING_URL';
  const supabaseKey = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || 'MISSING_KEY';

  // Check if Supabase client is available (CDN)
  const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

  if (!supabase) {
    console.error("Supabase client not initialized. Check CDN and keys.");
  }

  // --- 1. State ---
  const state = {
    inflatable: 'LARGE',
    price: 80,
    date: null,
    bookedDates: [] // ['2024-10-15', '2024-10-20']
  };

  // --- 2. Element Refs ---
  const summaryInfl = document.getElementById('summary-infl');
  const summaryDate = document.getElementById('summary-date');
  const summaryPrice = document.getElementById('summary-price');
  const radios = document.getElementsByName('inflatable');
  const bookingForm = document.getElementById('booking-form');
  let calendarInstance = null; // Flatpickr instance

  // --- 3. Async Fetch Availability ---
  async function fetchBookedDates() {
    if (!supabase) return [];

    // Simular network delay para UX
    // await new Promise(r => setTimeout(r, 500));

    try {
      // Select bookings where status is NOT cancelled
      const { data, error } = await supabase
        .from('bookings')
        .select('event_date')
        .neq('status', 'cancelled'); // Don't block cancelled dates

      if (error) throw error;

      // Map dates to YYYY-MM-DD
      return data.map(b => b.event_date);

    } catch (err) {
      console.error('Error fetching bookings:', err);
      return []; // Fail safe: show all available if error
    }
  }

  // --- 4. Logic & UI ---

  // Init Loading State for Calendar
  // (Optional: add a spinner overlay)

  // Load Data
  state.bookedDates = await fetchBookedDates();
  console.log("Fechas ocupadas:", state.bookedDates);

  // --- 5. Flatpickr Init ---
  // Custom styles for booked dates are handled by 'disable'

  calendarInstance = flatpickr("#datePicker", {
    inline: true,
    locale: "es",
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: state.bookedDates, // THIS BLOCKS THE DATES
    onChange: (selectedDates, dateStr) => {
      state.date = selectedDates[0];
      updatePriceWithDate(state.date);
      updateUI();
    },
    onDayCreate: function (dObj, dStr, fp, dayElem) {
      // Optional: Add custom class to booked dates for specific styling if 'disable' isn't enough
      // But 'disable' automatically adds 'flatpickr-disabled' class
    }
  });

  // --- 6. Inflatable logic ---
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
    if (isWeekend) base += 20; // +20€ fines de semana
    state.price = base;
  }

  function updateUI() {
    // Update Text
    summaryInfl.textContent = state.inflatable === 'LARGE' ? 'Castillo Grande' : 'Castillo Pequeño';
    summaryPrice.textContent = `€${state.price}`;

    if (state.date) {
      summaryDate.textContent = state.date.toLocaleDateString('es-ES');
    } else {
      summaryDate.textContent = '--/--/----';
    }
  }

  // --- 7. Form Submission ---
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.date) {
      alert('⚠️ Por favor, selecciona una fecha en el calendario.');
      return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Procesando...';

    const formData = new FormData(bookingForm);

    const bookingPayload = {
      customer_name: formData.get('customer-name'),
      customer_email: 'no-email@provided.com', // Optional in UI, maybe add hidden field or restore input
      customer_phone: formData.get('customer-phone'),
      event_date: state.date.toISOString().split('T')[0], // YYYY-MM-DD
      inflatable_type: state.inflatable,
      total_price: state.price,
      status: 'pending' // Default status
    };

    try {
      if (!supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select();

      if (error) throw error;

      alert('✅ ¡Reserva Confirmada! Nos pondremos en contacto contigo.');
      window.location.href = 'index.html';

    } catch (err) {
      console.error("Booking error:", err);
      alert('❌ Error al guardar reserva. Inténtalo de nuevo.');
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Confirmar Reserva';
    }
  });

  // Init UI
  updateUI();
});
