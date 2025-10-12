/**
 * PARTY RENTALS - BOOKING SYSTEM TESTS
 * Tests para el sistema de calendario y reservas
 */

// Mock del DOM y APIs
const mockDOM = () => {
  global.document = {
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    createElement: jest.fn(() => ({
      classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
      addEventListener: jest.fn(),
      appendChild: jest.fn(),
      textContent: '',
      innerHTML: '',
      style: {}
    })),
    addEventListener: jest.fn(),
    body: { appendChild: jest.fn() }
  };
  
  global.window = {
    scrollY: 0,
    innerWidth: 1024,
    addEventListener: jest.fn(),
    scrollTo: jest.fn(),
    PARTY_RENTALS_CONFIG: {
      companyName: 'Test Company',
      phone: '+1234567890',
      email: 'test@test.com'
    }
  };
  
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
};

describe('BookingSystem', () => {
  let BookingSystem;
  let bookingSystem;

  beforeAll(() => {
    mockDOM();
    // Importar la clase después de mockear el DOM
    BookingSystem = require('../src/js/booking.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    bookingSystem = new BookingSystem();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(bookingSystem.currentDate).toBeInstanceOf(Date);
      expect(bookingSystem.selectedDate).toBeNull();
      expect(bookingSystem.selectedInflatable).toBe('large');
      expect(bookingSystem.availabilityData).toBeInstanceOf(Map);
      expect(bookingSystem.isLoading).toBe(false);
    });

    test('should have correct pricing structure', () => {
      expect(bookingSystem.pricing.large).toEqual({
        weekday: 150,
        weekend: 200,
        holiday: 250
      });
      
      expect(bookingSystem.pricing.small).toEqual({
        weekday: 100,
        weekend: 130,
        holiday: 160
      });
    });

    test('should initialize holidays set', () => {
      expect(bookingSystem.holidays).toBeInstanceOf(Set);
      expect(bookingSystem.holidays.has('2025-01-01')).toBe(true);
      expect(bookingSystem.holidays.has('2025-12-25')).toBe(true);
    });
  });

  describe('Date Utilities', () => {
    test('formatDate should return ISO date string', () => {
      const date = new Date('2025-03-15');
      const result = bookingSystem.formatDate(date);
      expect(result).toBe('2025-03-15');
    });

    test('formatDateSpanish should return formatted Spanish date', () => {
      const date = new Date('2025-03-15');
      const result = bookingSystem.formatDateSpanish(date);
      expect(result).toContain('marzo');
      expect(result).toContain('2025');
    });

    test('isSameDay should compare dates correctly', () => {
      const date1 = new Date('2025-03-15T10:00:00');
      const date2 = new Date('2025-03-15T15:30:00');
      const date3 = new Date('2025-03-16T10:00:00');
      
      expect(bookingSystem.isSameDay(date1, date2)).toBe(true);
      expect(bookingSystem.isSameDay(date1, date3)).toBe(false);
    });

    test('getDayType should classify days correctly', () => {
      // Weekday
      const monday = new Date('2025-03-17'); // Monday
      expect(bookingSystem.getDayType(monday)).toBe('weekday');
      
      // Weekend
      const saturday = new Date('2025-03-15'); // Saturday
      expect(bookingSystem.getDayType(saturday)).toBe('weekend');
      
      const sunday = new Date('2025-03-16'); // Sunday
      expect(bookingSystem.getDayType(sunday)).toBe('weekend');
      
      // Holiday
      const newYear = new Date('2025-01-01');
      expect(bookingSystem.getDayType(newYear)).toBe('holiday');
    });
  });

  describe('Pricing Calculations', () => {
    test('calculateTotalPrice should return correct pricing breakdown', () => {
      bookingSystem.selectedDate = new Date('2025-03-17'); // Monday
      bookingSystem.selectedInflatable = 'large';
      
      const pricing = bookingSystem.calculateTotalPrice();
      
      expect(pricing.base).toBe(150); // Weekday price for large
      expect(pricing.setup).toBe(25);
      expect(pricing.cleaning).toBe(15);
      expect(pricing.total).toBe(190);
    });

    test('should calculate weekend pricing correctly', () => {
      bookingSystem.selectedDate = new Date('2025-03-15'); // Saturday
      bookingSystem.selectedInflatable = 'small';
      
      const pricing = bookingSystem.calculateTotalPrice();
      
      expect(pricing.base).toBe(130); // Weekend price for small
      expect(pricing.total).toBe(170); // 130 + 25 + 15
    });

    test('should calculate holiday pricing correctly', () => {
      bookingSystem.selectedDate = new Date('2025-01-01'); // New Year
      bookingSystem.selectedInflatable = 'large';
      
      const pricing = bookingSystem.calculateTotalPrice();
      
      expect(pricing.base).toBe(250); // Holiday price for large
      expect(pricing.total).toBe(290); // 250 + 25 + 15
    });

    test('should return 0 when no date selected', () => {
      bookingSystem.selectedDate = null;
      
      const pricing = bookingSystem.calculateTotalPrice();
      
      expect(pricing).toBe(0);
    });
  });

  describe('Form Validation', () => {
    let mockField;

    beforeEach(() => {
      mockField = {
        value: '',
        name: 'test-field',
        classList: { add: jest.fn(), remove: jest.fn() },
        parentNode: {
          querySelector: jest.fn(),
          appendChild: jest.fn()
        }
      };
    });

    test('should validate required fields', () => {
      mockField.value = '';
      
      const result = bookingSystem.validateField(mockField);
      
      expect(result).toBe(false);
      expect(mockField.classList.add).toHaveBeenCalledWith('error');
    });

    test('should validate email format', () => {
      mockField.name = 'customer-email';
      mockField.value = 'invalid-email';
      
      const result = bookingSystem.validateField(mockField);
      
      expect(result).toBe(false);
      
      mockField.value = 'valid@email.com';
      const validResult = bookingSystem.validateField(mockField);
      
      expect(validResult).toBe(true);
      expect(mockField.classList.add).toHaveBeenCalledWith('success');
    });

    test('should validate phone format', () => {
      mockField.name = 'customer-phone';
      mockField.value = '123';
      
      const result = bookingSystem.validateField(mockField);
      
      expect(result).toBe(false);
      
      mockField.value = '+1 234 567 8900';
      const validResult = bookingSystem.validateField(mockField);
      
      expect(validResult).toBe(true);
    });

    test('should validate guest count range', () => {
      mockField.name = 'guest-count';
      mockField.value = '0';
      
      let result = bookingSystem.validateField(mockField);
      expect(result).toBe(false);
      
      mockField.value = '250';
      result = bookingSystem.validateField(mockField);
      expect(result).toBe(false);
      
      mockField.value = '50';
      result = bookingSystem.validateField(mockField);
      expect(result).toBe(true);
    });

    test('should validate rental hours range', () => {
      mockField.name = 'rental-hours';
      mockField.value = '2';
      
      let result = bookingSystem.validateField(mockField);
      expect(result).toBe(false);
      
      mockField.value = '15';
      result = bookingSystem.validateField(mockField);
      expect(result).toBe(false);
      
      mockField.value = '6';
      result = bookingSystem.validateField(mockField);
      expect(result).toBe(true);
    });
  });

  describe('Availability Management', () => {
    test('getAvailabilityStatus should return correct status', () => {
      const date = new Date('2025-03-15');
      const dateStr = bookingSystem.formatDate(date);
      
      // No data - should be available
      let status = bookingSystem.getAvailabilityStatus(date);
      expect(status.text).toBe('Disponible');
      expect(status.color).toBe('#51cf66');
      
      // Set busy status
      bookingSystem.availabilityData.set(dateStr, {
        large: 'busy',
        small: 'available'
      });
      
      bookingSystem.selectedInflatable = 'large';
      status = bookingSystem.getAvailabilityStatus(date);
      expect(status.text).toBe('No disponible');
      expect(status.color).toBe('#ff6b6b');
      
      // Set partial status
      bookingSystem.availabilityData.set(dateStr, {
        large: 'partial',
        small: 'available'
      });
      
      status = bookingSystem.getAvailabilityStatus(date);
      expect(status.text).toBe('Disponibilidad limitada');
      expect(status.color).toBe('#ffc947');
    });
  });

  describe('Date Selection', () => {
    test('should not allow selection of past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const renderCalendarSpy = jest.spyOn(bookingSystem, 'renderCalendar');
      
      bookingSystem.selectDate(pastDate);
      
      expect(bookingSystem.selectedDate).toBeNull();
      expect(renderCalendarSpy).not.toHaveBeenCalled();
    });

    test('should allow selection of today', () => {
      const today = new Date();
      
      const renderCalendarSpy = jest.spyOn(bookingSystem, 'renderCalendar');
      const updateSelectedDateInfoSpy = jest.spyOn(bookingSystem, 'updateSelectedDateInfo');
      const updatePricingSpy = jest.spyOn(bookingSystem, 'updatePricing');
      
      bookingSystem.selectDate(today);
      
      expect(bookingSystem.selectedDate).toEqual(today);
      expect(renderCalendarSpy).toHaveBeenCalled();
      expect(updateSelectedDateInfoSpy).toHaveBeenCalled();
      expect(updatePricingSpy).toHaveBeenCalled();
    });

    test('should allow selection of future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      bookingSystem.selectDate(futureDate);
      
      expect(bookingSystem.selectedDate).toEqual(futureDate);
    });
  });

  describe('Inflatable Selection', () => {
    test('should update selected inflatable and trigger updates', () => {
      const loadAvailabilityDataSpy = jest.spyOn(bookingSystem, 'loadAvailabilityData');
      const updatePricingSpy = jest.spyOn(bookingSystem, 'updatePricing');
      const updateSelectedDateInfoSpy = jest.spyOn(bookingSystem, 'updateSelectedDateInfo');
      
      // Mock querySelector to return button elements
      document.querySelector = jest.fn((selector) => {
        if (selector.includes('data-inflatable')) {
          return { classList: { add: jest.fn() } };
        }
        return null;
      });
      
      document.querySelectorAll = jest.fn(() => [
        { classList: { remove: jest.fn() } }
      ]);
      
      bookingSystem.selectInflatable('small');
      
      expect(bookingSystem.selectedInflatable).toBe('small');
      expect(loadAvailabilityDataSpy).toHaveBeenCalled();
      expect(updatePricingSpy).toHaveBeenCalled();
      expect(updateSelectedDateInfoSpy).toHaveBeenCalled();
    });
  });

  describe('Booking Submission', () => {
    test('should handle successful booking submission', async () => {
      // Mock successful form validation
      jest.spyOn(bookingSystem, 'validateForm').mockReturnValue(true);
      
      // Mock successful API submission
      jest.spyOn(bookingSystem, 'submitBooking').mockResolvedValue({
        success: true,
        bookingId: 'TEST123',
        message: 'Success'
      });
      
      const showSuccessMessageSpy = jest.spyOn(bookingSystem, 'showSuccessMessage');
      const resetFormSpy = jest.spyOn(bookingSystem, 'resetForm');
      
      // Set up required data
      bookingSystem.selectedDate = new Date('2025-03-20');
      bookingSystem.selectedInflatable = 'large';
      
      // Mock form event
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn(() => ({ textContent: 'Submit', disabled: false }))
        }
      };
      
      // Mock FormData
      global.FormData = jest.fn(() => ({
        get: jest.fn((key) => {
          const mockData = {
            'customer-name': 'John Doe',
            'customer-email': 'john@example.com',
            'customer-phone': '+1234567890',
            'customer-address': '123 Main St',
            'event-type': 'birthday',
            'guest-count': '25',
            'rental-hours': '6',
            'special-requests': 'No special requests'
          };
          return mockData[key];
        })
      }));
      
      await bookingSystem.handleBookingSubmit(mockEvent);
      
      expect(showSuccessMessageSpy).toHaveBeenCalledWith('TEST123');
      expect(resetFormSpy).toHaveBeenCalled();
    });

    test('should handle booking submission errors', async () => {
      jest.spyOn(bookingSystem, 'validateForm').mockReturnValue(true);
      jest.spyOn(bookingSystem, 'submitBooking').mockRejectedValue(new Error('API Error'));
      
      const showErrorSpy = jest.spyOn(bookingSystem, 'showError');
      
      bookingSystem.selectedDate = new Date('2025-03-20');
      
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn(() => ({ textContent: 'Submit', disabled: false }))
        }
      };
      
      global.FormData = jest.fn(() => ({
        get: jest.fn(() => 'mock-value')
      }));
      
      await bookingSystem.handleBookingSubmit(mockEvent);
      
      expect(showErrorSpy).toHaveBeenCalledWith('Error al procesar la reserva. Por favor intente nuevamente.');
    });

    test('should not submit if form validation fails', async () => {
      jest.spyOn(bookingSystem, 'validateForm').mockReturnValue(false);
      const submitBookingSpy = jest.spyOn(bookingSystem, 'submitBooking');
      
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {}
      };
      
      await bookingSystem.handleBookingSubmit(mockEvent);
      
      expect(submitBookingSpy).not.toHaveBeenCalled();
    });
  });

  describe('Calendar Navigation', () => {
    test('should navigate to previous month', () => {
      const initialMonth = bookingSystem.currentDate.getMonth();
      const renderCalendarSpy = jest.spyOn(bookingSystem, 'renderCalendar');
      const loadAvailabilityDataSpy = jest.spyOn(bookingSystem, 'loadAvailabilityData');
      
      // Simulate previous month click
      bookingSystem.currentDate.setMonth(bookingSystem.currentDate.getMonth() - 1);
      bookingSystem.renderCalendar();
      bookingSystem.loadAvailabilityData();
      
      expect(bookingSystem.currentDate.getMonth()).toBe(initialMonth - 1);
      expect(renderCalendarSpy).toHaveBeenCalled();
      expect(loadAvailabilityDataSpy).toHaveBeenCalled();
    });

    test('should navigate to next month', () => {
      const initialMonth = bookingSystem.currentDate.getMonth();
      const renderCalendarSpy = jest.spyOn(bookingSystem, 'renderCalendar');
      const loadAvailabilityDataSpy = jest.spyOn(bookingSystem, 'loadAvailabilityData');
      
      // Simulate next month click
      bookingSystem.currentDate.setMonth(bookingSystem.currentDate.getMonth() + 1);
      bookingSystem.renderCalendar();
      bookingSystem.loadAvailabilityData();
      
      expect(bookingSystem.currentDate.getMonth()).toBe((initialMonth + 1) % 12);
      expect(renderCalendarSpy).toHaveBeenCalled();
      expect(loadAvailabilityDataSpy).toHaveBeenCalled();
    });
  });
});

describe('PartyRentalsUtils', () => {
  beforeAll(() => {
    mockDOM();
    // Import utilities after mocking DOM
    require('../src/js/main.js');
  });

  test('isValidEmail should validate email addresses', () => {
    expect(window.PartyRentalsUtils.isValidEmail('test@example.com')).toBe(true);
    expect(window.PartyRentalsUtils.isValidEmail('invalid-email')).toBe(false);
    expect(window.PartyRentalsUtils.isValidEmail('test@')).toBe(false);
    expect(window.PartyRentalsUtils.isValidEmail('@domain.com')).toBe(false);
  });

  test('isValidPhone should validate phone numbers', () => {
    expect(window.PartyRentalsUtils.isValidPhone('+1 234 567 8900')).toBe(true);
    expect(window.PartyRentalsUtils.isValidPhone('1234567890')).toBe(true);
    expect(window.PartyRentalsUtils.isValidPhone('123')).toBe(false);
    expect(window.PartyRentalsUtils.isValidPhone('abc')).toBe(false);
  });

  test('isMobile should detect mobile devices', () => {
    window.innerWidth = 500;
    expect(window.PartyRentalsUtils.isMobile()).toBe(true);
    
    window.innerWidth = 1024;
    expect(window.PartyRentalsUtils.isMobile()).toBe(false);
  });

  test('debounce should delay function execution', (done) => {
    let called = false;
    const debouncedFn = window.PartyRentalsUtils.debounce(() => {
      called = true;
    }, 100);
    
    debouncedFn();
    expect(called).toBe(false);
    
    setTimeout(() => {
      expect(called).toBe(true);
      done();
    }, 150);
  });
});
