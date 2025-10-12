/**
 * JEST SETUP - Test Environment Configuration
 * Configuración global para tests del frontend
 */

// Mock de APIs del navegador
global.fetch = jest.fn();
global.FormData = jest.fn();
global.URLSearchParams = jest.fn();

// Mock de requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(clearTimeout);

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock de window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn()
};

// Mock de console para tests más limpios
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Mock de setTimeout y setInterval
jest.useFakeTimers();

// Configuración global de tests
beforeEach(() => {
  // Limpiar todos los mocks antes de cada test
  jest.clearAllMocks();
  
  // Reset de localStorage y sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset de fetch mock
  fetch.mockClear();
  
  // Reset de timers
  jest.clearAllTimers();
});

afterEach(() => {
  // Limpiar después de cada test
  jest.restoreAllMocks();
});

// Helper functions para tests
global.testHelpers = {
  // Crear evento mock
  createMockEvent: (type, target = {}) => ({
    type,
    target,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    currentTarget: target
  }),
  
  // Crear elemento DOM mock
  createMockElement: (tagName = 'div', attributes = {}) => ({
    tagName: tagName.toUpperCase(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn()
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    getAttribute: jest.fn(attr => attributes[attr]),
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    style: {},
    innerHTML: '',
    textContent: '',
    value: '',
    dataset: {},
    parentNode: null,
    children: [],
    ...attributes
  }),
  
  // Simular respuesta de API
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Map([
      ['content-type', 'application/json']
    ])
  }),
  
  // Esperar por próximo tick del event loop
  waitForNextTick: () => new Promise(resolve => setImmediate(resolve)),
  
  // Simular delay
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Matchers personalizados para Jest
expect.extend({
  // Verificar que un elemento tenga una clase CSS
  toHaveClass(received, className) {
    const pass = received.classList && received.classList.contains && 
                 received.classList.contains(className);
    
    if (pass) {
      return {
        message: () => `expected element not to have class "${className}"`,
        pass: true
      };
    } else {
      return {
        message: () => `expected element to have class "${className}"`,
        pass: false
      };
    }
  },
  
  // Verificar que un elemento esté visible
  toBeVisible(received) {
    const pass = received.style && 
                 received.style.display !== 'none' && 
                 received.style.visibility !== 'hidden';
    
    if (pass) {
      return {
        message: () => 'expected element not to be visible',
        pass: true
      };
    } else {
      return {
        message: () => 'expected element to be visible',
        pass: false
      };
    }
  }
});

// Suprimir warnings específicos en tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
