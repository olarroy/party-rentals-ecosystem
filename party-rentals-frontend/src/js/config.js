// Configuración API endpoints
const CONFIG = {
  // Cambiar por tu URL de Netlify cuando despliegues
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8888/api'
    : 'https://party-rentals-api.netlify.app/api',

  // Cambiar por tus credenciales de Supabase
  // En local, se leen de window.ENV (src/js/env.js)
  // En producción, asegúrate de configurar las variables de entorno o inyectarlas
  SUPABASE_URL: (window.ENV && window.ENV.SUPABASE_URL) || 'PLACEHOLDER_URL',
  SUPABASE_ANON_KEY: (window.ENV && window.ENV.SUPABASE_ANON_KEY) || 'PLACEHOLDER_KEY',

  // Configuración de la aplicación
  APP_NAME: 'Pequefest.com',
  COMPANY_EMAIL: 'info@pequefest.com',
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
