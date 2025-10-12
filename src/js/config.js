// Configuración API endpoints
const CONFIG = {
  // Cambiar por tu URL de Netlify cuando despliegues
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://party-rentals-api.netlify.app/api'
    : 'http://localhost:8888/api',
    
  // Credenciales de Supabase actualizadas
  SUPABASE_URL: 'https://cstixfdstuaagfosnepn.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdGl4ZmRzdHVhYWdmb3NuZXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTAwMTksImV4cCI6MjA3NTc4NjAxOX0.3ZUvkvFUhFGzIno_-SmJx_C9t8q2idFI54jGh8U3R-E',
  
  // Configuración de la aplicación
  APP_NAME: 'FiestaInflables',
  COMPANY_EMAIL: 'info@fiestainflables.com',
  COMPANY_PHONE: '+34 123 456 789',
  
  // Precios base (se obtienen de la API, estos son fallback)
  PRICES: {
    LARGE: 80,
    SMALL: 60,
    WEEKEND_PREMIUM: 0.20 // 20%
  },
  
  // Configuración del calendario
  CALENDAR: {
    MONTHS_TO_SHOW: 3,
    MIN_ADVANCE_DAYS: 1,
    MAX_ADVANCE_DAYS: 365
  },
  
  // Mensajes de la aplicación
  MESSAGES: {
    BOOKING_SUCCESS: '¡Reserva confirmada! Te enviaremos un email con los detalles.',
    BOOKING_ERROR: 'Hubo un error al procesar tu reserva. Por favor, inténtalo de nuevo.',
    AVAILABILITY_ERROR: 'Error al verificar disponibilidad. Comprueba tu conexión.',
    FORM_VALIDATION_ERROR: 'Por favor, completa todos los campos requeridos.'
  }
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Hacer disponible globalmente
window.CONFIG = CONFIG;
