# 🎈 Party Rentals Frontend

Frontend web moderno y responsivo para el sistema de alquiler de inflables. Desarrollado con HTML5, CSS3 moderno y JavaScript ES6+.

## ✨ Características

### 🎨 Diseño y UX
- **Diseño responsivo** con mobile-first approach
- **Interfaz moderna** con sistema de design tokens
- **Animaciones fluidas** y efectos de hover
- **Tipografía optimizada** con Google Fonts (Poppins)
- **Paleta de colores vibrante** para transmitir diversión

### 📅 Sistema de Reservas
- **Calendario interactivo** con navegación mes a mes
- **Disponibilidad en tiempo real** con indicadores visuales
- **Sistema de precios dinámico** (días laborables, fines de semana, festivos)
- **Formulario de reserva completo** con validación en tiempo real
- **Confirmación instantánea** de reservas

### 🏰 Gestión de Inflables
- **Selector de inflables** (Grande/Pequeño)
- **Visualización de especificaciones** técnicas
- **Cálculo automático de precios** con desglose detallado
- **Información de disponibilidad** por inflable

## 🏗️ Arquitectura

```
party-rentals-frontend/
├── 📄 index.html              # Página principal
├── 📄 reservas.html           # Sistema de reservas
├── 🎨 favicon.svg             # Icono de la aplicación
├── 📁 src/
│   ├── 🎨 css/
│   │   ├── main.css          # Estilos principales + design system
│   │   └── booking.css       # Estilos específicos del booking
│   └── 📜 js/
│       ├── config.js         # Configuración de la aplicación
│       ├── main.js           # Funcionalidades generales
│       └── booking.js        # Sistema de reservas y calendario
├── 🧪 tests/
│   └── booking.test.js       # Tests del sistema de reservas
├── 📦 package.json           # Dependencias y scripts
└── 📚 README.md              # Esta documentación
```

## 🎯 Páginas y Funcionalidades

### 🏠 Página Principal (`index.html`)
- **Hero section** con propuesta de valor
- **Showcase de inflables** con precios y características
- **Sección de servicios** con información detallada
- **Llamadas a la acción** optimizadas para conversión
- **Footer informativo** con datos de contacto

### 📅 Página de Reservas (`reservas.html`)
- **Calendario visual** con disponibilidad en tiempo real
- **Selector de inflables** con switch entre opciones
- **Formulario completo** con validación avanzada
- **Calculadora de precios** automática
- **Confirmación de reserva** con ID único

## 🛠️ Tecnologías Utilizadas

### Frontend Core
- **HTML5** con semántica moderna
- **CSS3** con Custom Properties (variables CSS)
- **JavaScript ES6+** con módulos y clases
- **Font Awesome** para iconografía
- **Google Fonts** para tipografía

### Herramientas de Desarrollo
- **Jest** para testing unitario
- **ESLint** para linting de JavaScript
- **Prettier** para formateo de código
- **Live Server** para desarrollo local

### Design System
- **Sistema de colores** con variables CSS
- **Tipografía escalable** con rem units
- **Espaciado consistente** con design tokens
- **Breakpoints responsivos** para todos los dispositivos
- **Componentes reutilizables** con metodología BEM

## 🚀 Desarrollo Local

### Prerrequisitos
- Node.js 16+ para herramientas de desarrollo
- Navegador moderno con soporte ES6+
- Servidor web local (Live Server, http-server, etc.)

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repo]
cd party-rentals-frontend

# Instalar dependencias de desarrollo
npm install

# Servir archivos localmente
npm run dev
```

### Scripts Disponibles
```bash
npm run dev        # Servidor de desarrollo con Live Server
npm run test       # Ejecutar tests con Jest
npm run test:watch # Tests en modo watch
npm run lint       # Linting con ESLint
npm run format     # Formateo con Prettier
npm run build      # Preparar para producción
```

## ⚙️ Configuración

### Archivo de Configuración (`src/js/config.js`)
```javascript
window.PARTY_RENTALS_CONFIG = {
  // Información de la empresa
  companyName: 'Tu Empresa',
  phone: '+1 234 567 8900',
  email: 'info@tuempresa.com',
  address: 'Tu dirección completa',
  
  // Configuración de API
  apiBaseUrl: 'https://tu-api.netlify.app/.netlify/functions',
  supabaseUrl: 'https://tu-proyecto.supabase.co',
  supabaseAnonKey: 'tu-clave-publica',
  
  // Configuración de la aplicación
  defaultInflatable: 'large',
  maxBookingDays: 365,
  minRentalHours: 4,
  maxRentalHours: 12,
  
  // Precios (opcional - se pueden gestionar desde la API)
  pricing: {
    large: { weekday: 150, weekend: 200, holiday: 250 },
    small: { weekday: 100, weekend: 130, holiday: 160 }
  }
};
```

### Personalización de Estilos
Los estilos principales están organizados con un design system completo:

```css
:root {
  /* Colores principales */
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  --accent-color: #ffe66d;
  
  /* Tipografía */
  --font-family: 'Poppins', sans-serif;
  --font-size-base: 1rem;
  
  /* Espaciado */
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* Componentes */
  --border-radius-md: 0.5rem;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

## 🧪 Testing

### Estructura de Tests
- **Unitarios**: Funciones de utilidad y validación
- **Integración**: Sistema de booking completo
- **E2E**: Flujos de usuario principales (próximamente)

### Ejecutar Tests
```bash
# Tests una vez
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

### Cobertura de Tests
- ✅ Validación de formularios
- ✅ Cálculo de precios
- ✅ Navegación de calendario
- ✅ Gestión de disponibilidad
- ✅ Utilidades de fecha y formato

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Características Móviles
- **Menú hamburguesa** para navegación
- **Calendario optimizado** para touch
- **Formularios adaptados** para móvil
- **Imágenes responsivas** con lazy loading
- **Performance optimizada** para conexiones lentas

## 🚀 Deployment

### GitHub Pages
```bash
# Configurar GitHub Pages en la rama main
# Los archivos se servirán desde la raíz del repositorio
```

### Netlify
```bash
# Build settings:
# Build command: npm run build
# Publish directory: ./
```

### Vercel
```bash
# Detecta automáticamente archivos estáticos
# No requiere configuración adicional
```

## 🔧 API Integration

El frontend está preparado para integrarse con:

### Backend API (Netlify Functions)
- `GET /api/availability` - Obtener disponibilidad de fechas
- `POST /api/bookings` - Crear nueva reserva
- `GET /api/inflatables` - Obtener información de inflables

### Supabase Database
- Consultas directas para disponibilidad
- Inserción de reservas en tiempo real
- Gestión de estado de inflables

## 🎨 Customización

### Colores de Marca
Editar las variables CSS en `src/css/main.css`:
```css
:root {
  --primary-color: #tu-color-primario;
  --secondary-color: #tu-color-secundario;
  --accent-color: #tu-color-acento;
}
```

### Contenido
- Actualizar textos en archivos HTML
- Modificar información de empresa en `config.js`
- Agregar/quitar secciones según necesidades

### Funcionalidades
- Extender validaciones en `booking.js`
- Agregar nuevos tipos de eventos
- Personalizar cálculos de precios

## 📈 Performance

### Optimizaciones Implementadas
- **Lazy loading** de imágenes
- **Minificación** de CSS y JS
- **Compresión** de recursos
- **Caché** de API calls
- **Debounce** en validaciones

### Métricas Target
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **Time to Interactive** < 3s

## 🔒 Seguridad

### Validaciones
- **Client-side** para UX inmediata
- **Server-side** para seguridad real
- **Sanitización** de inputs
- **Rate limiting** en formularios

### Datos Sensibles
- No almacenar información sensible en client
- Usar HTTPS en producción
- Configurar CSP headers

## 🆘 Troubleshooting

### Problemas Comunes

**Error: Calendario no carga**
```javascript
// Verificar que el elemento existe
const calendar = document.getElementById('calendar-grid');
console.log(calendar); // Debe mostrar el elemento
```

**Error: API no responde**
```javascript
// Verificar configuración
console.log(window.PARTY_RENTALS_CONFIG.apiBaseUrl);
```

**Error: Estilos no cargan**
```html
<!-- Verificar rutas de CSS -->
<link rel="stylesheet" href="src/css/main.css">
```

## 🤝 Contribución

1. Fork el repositorio
2. Crear branch de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

- 📧 **Email**: soporte@tuempresa.com
- 💬 **Issues**: GitHub Issues
- 📚 **Documentación**: Wiki del proyecto
