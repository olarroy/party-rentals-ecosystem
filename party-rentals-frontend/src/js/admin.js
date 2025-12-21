// DOM Elements
const loginOverlay = document.getElementById('loginOverlay');
const dashboardContent = document.getElementById('dashboardContent');
const loginForm = document.getElementById('loginForm');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const logoutBtn = document.getElementById('logoutBtn');

let supabase;

try {
    console.log('Admin JS starting...');
    if (!window.CONFIG) throw new Error('CONFIG not loaded');

    // Init Supabase
    supabase = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
} catch (e) {
    console.error('Init Error:', e);
    alert('Error de inicialización: ' + e.message);
}

// Auth State Listener
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth State Change:', event, session);
    if (session) {
        // User signed in
        loginOverlay.style.display = 'none';
        dashboardContent.style.display = 'block';
        loadDashboardData();
    } else {
        // User signed out
        loginOverlay.style.display = 'flex';
        dashboardContent.style.display = 'none';
    }
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = adminEmailInput.value;
    const password = adminPasswordInput.value;

    console.log('Attempting login for:', email);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('Login successful:', data);

    } catch (err) {
        console.error('Login error:', err);
        alert('Error al entrar: ' + err.message);
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    console.log('Logging out');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
});

// Data Loading
async function loadDashboardData() {
    try {
        // Fetch rentals
        const { data: rentals, error } = await supabase
            .from('rentals')
            .select(`
                *,
                customers (name, email),
                inflatables (name, size)
            `)
            .order('rental_date', { ascending: false });

        if (error) throw error;

        updateKPIs(rentals);
        renderCalendar(rentals);
        renderChart(rentals);
        renderTable(rentals);

    } catch (err) {
        console.error('Error loading data:', err);
        alert('Error cargando datos del dashboard');
    }
}

function renderCalendar(rentals) {
    const calendarEl = document.getElementById('calendar');

    // Transform rentals to events
    const events = rentals.map(r => ({
        title: `${r.customers?.name || 'Cliente'} - ${r.inflatables?.name || 'Inflable'}`,
        start: r.rental_date,
        allDay: true,
        color: r.status === 'confirmed' ? 'var(--success-color)' : 'var(--warning-color)',
        extendedProps: {
            price: r.total_price,
            status: r.status
        }
    }));

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana'
        },
        events: events,
        eventClick: function (info) {
            alert(`Reserva: ${info.event.title}\nEstado: ${info.event.extendedProps.status}\nPrecio: €${info.event.extendedProps.price}`);
        }
    });

    calendar.render();
}

function updateKPIs(rentals) {
    const totalRevenue = rentals.reduce((sum, r) => sum + r.total_price, 0);
    const totalBookings = rentals.length;
    const avgTicket = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Sort slightly differently for "Next Booking" (future dates)
    const futureRentals = rentals
        .filter(r => new Date(r.rental_date) >= new Date())
        .sort((a, b) => new Date(a.rental_date) - new Date(b.rental_date));

    const nextBooking = futureRentals.length > 0
        ? new Date(futureRentals[0].rental_date).toLocaleDateString()
        : 'N/A';

    document.getElementById('totalRevenue').textContent = `€${totalRevenue}`;
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('avgTicket').textContent = `€${Math.round(avgTicket)}`;
    document.getElementById('nextBooking').textContent = nextBooking;
}

function renderChart(rentals) {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    // Group by month (simplified)
    const revenueByMonth = {};
    rentals.forEach(r => {
        const date = new Date(r.rental_date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + r.total_price;
    });

    const labels = Object.keys(revenueByMonth);
    const data = Object.values(revenueByMonth);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ingresos (€)',
                data: data,
                backgroundColor: 'rgba(255, 107, 107, 0.5)',
                borderColor: 'rgba(255, 107, 107, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderTable(rentals) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';

    rentals.slice(0, 10).forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${r.id.slice(0, 8)}</td>
            <td>${new Date(r.rental_date).toLocaleDateString()}</td>
            <td>${r.customers?.name || 'Unknown'}</td>
            <td>${r.inflatables?.name || r.inflatables?.size || 'Item'}</td>
            <td>€${r.total_price}</td>
            <td><span style="    
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                background: ${r.status === 'confirmed' ? '#d4edda' : '#fff3cd'};
                color: ${r.status === 'confirmed' ? '#155724' : '#856404'};
            ">${r.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Initial check
checkAuth();
