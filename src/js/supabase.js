// =============================================================================
// CLIENTE SUPABASE
// Manejo de todas las operaciones de base de datos con Supabase
// =============================================================================

// Importar Supabase desde CDN
const { createClient } = supabase;

// Importar configuración
import { SUPABASE_CONFIG } from './config.js';

// Crear cliente de Supabase
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// =============================================================================
// CLASE PRINCIPAL PARA MANEJAR SUPABASE
// =============================================================================
class SupabaseService {
    constructor() {
        this.client = supabaseClient;
        this.validateConnection();
    }

    // Validar conexión con Supabase
    async validateConnection() {
        try {
            const { data, error } = await this.client
                .from('inflatables')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Error conectando con Supabase:', error.message);
                return false;
            }
            
            console.log('✅ Conexión con Supabase establecida correctamente');
            return true;
        } catch (err) {
            console.error('❌ Error de conexión:', err);
            return false;
        }
    }

    // =============================================================================
    // OPERACIONES CON INFLABLES
    // =============================================================================

    // Obtener todos los inflables activos
    async getInflatables() {
        try {
            const { data, error } = await this.client
                .from('inflatables')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            
            console.log('✅ Inflables obtenidos:', data.length, 'registros');
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo inflables:', error.message);
            return [];
        }
    }

    // Obtener inflable por ID
    async getInflatableById(id) {
        try {
            const { data, error } = await this.client
                .from('inflatables')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo inflable:', error.message);
            return null;
        }
    }

    // Obtener inflables por tamaño
    async getInflatablesBySize(size) {
        try {
            const { data, error } = await this.client
                .from('inflatables')
                .select('*')
                .eq('size', size)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo inflables por tamaño:', error.message);
            return [];
        }
    }

    // =============================================================================
    // VERIFICACIÓN DE DISPONIBILIDAD
    // =============================================================================

    // Verificar disponibilidad usando la función personalizada de la base de datos
    async checkAvailability(size, date) {
        try {
            const { data, error } = await this.client
                .rpc('check_availability', {
                    inflatable_size_param: size,
                    rental_date_param: date
                });

            if (error) throw error;
            
            console.log(`✅ Disponibilidad para ${size} el ${date}:`, data);
            return data;
        } catch (error) {
            console.error('❌ Error verificando disponibilidad:', error.message);
            return [];
        }
    }

    // Obtener reservas para un rango de fechas (para el calendario)
    async getRentalsInRange(startDate, endDate) {
        try {
            const { data, error } = await this.client
                .from('rentals')
                .select(`
                    rental_date,
                    status,
                    inflatable_id,
                    inflatables (
                        name,
                        size
                    )
                `)
                .gte('rental_date', startDate)
                .lte('rental_date', endDate)
                .not('status', 'eq', 'cancelled');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo reservas:', error.message);
            return [];
        }
    }

    // =============================================================================
    // OPERACIONES CON CLIENTES
    // =============================================================================

    // Crear o actualizar cliente
    async upsertCustomer(customerData) {
        try {
            // Primero verificar si el cliente ya existe por email
            const { data: existingCustomer } = await this.client
                .from('customers')
                .select('id')
                .eq('email', customerData.email)
                .single();

            if (existingCustomer) {
                // Actualizar cliente existente
                const { data, error } = await this.client
                    .from('customers')
                    .update({
                        name: customerData.name,
                        phone: customerData.phone,
                        address: customerData.address
                    })
                    .eq('id', existingCustomer.id)
                    .select()
                    .single();

                if (error) throw error;
                console.log('✅ Cliente actualizado:', data.id);
                return data;
            } else {
                // Crear nuevo cliente
                const { data, error } = await this.client
                    .from('customers')
                    .insert([customerData])
                    .select()
                    .single();

                if (error) throw error;
                console.log('✅ Cliente creado:', data.id);
                return data;
            }
        } catch (error) {
            console.error('❌ Error con cliente:', error.message);
            throw error;
        }
    }

    // =============================================================================
    // OPERACIONES CON RESERVAS
    // =============================================================================

    // Crear nueva reserva
    async createRental(rentalData) {
        try {
            // Generar booking ID único
            const { data: bookingId } = await this.client
                .rpc('generate_booking_id');

            // Preparar datos de la reserva
            const rental = {
                ...rentalData,
                booking_id: bookingId
            };

            const { data, error } = await this.client
                .from('rentals')
                .insert([rental])
                .select(`
                    *,
                    customer:customers(*),
                    inflatable:inflatables(*)
                `)
                .single();

            if (error) throw error;
            
            console.log('✅ Reserva creada:', data.booking_id);
            return data;
        } catch (error) {
            console.error('❌ Error creando reserva:', error.message);
            throw error;
        }
    }

    // Obtener reserva por booking ID
    async getRentalByBookingId(bookingId) {
        try {
            const { data, error } = await this.client
                .from('rentals')
                .select(`
                    *,
                    customer:customers(*),
                    inflatable:inflatables(*)
                `)
                .eq('booking_id', bookingId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo reserva:', error.message);
            return null;
        }
    }

    // =============================================================================
    // FUNCIONES AUXILIARES
    // =============================================================================

    // Calcular precio de reserva
    calculateRentalPrice(inflatable, rentalDate, hours) {
        const dayOfWeek = new Date(rentalDate).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado
        
        // Determinar el precio base según el día
        let basePrice;
        if (isWeekend) {
            basePrice = inflatable.weekend_price;
        } else {
            basePrice = inflatable.weekday_price;
        }
        
        // Ajustar por horas (precio base es para 6 horas)
        const hourlyRate = basePrice / 6;
        const adjustedPrice = hourlyRate * hours;
        
        return {
            basePrice: adjustedPrice,
            setupFee: 25.00,
            cleaningFee: 15.00,
            totalPrice: adjustedPrice + 25.00 + 15.00
        };
    }

    // Validar fecha de reserva
    validateRentalDate(date) {
        const today = new Date();
        const rentalDate = new Date(date);
        const daysDifference = Math.ceil((rentalDate - today) / (1000 * 60 * 60 * 24));
        
        return {
            isValid: daysDifference >= 1 && daysDifference <= 90,
            daysDifference,
            message: daysDifference < 1 ? 'La fecha debe ser al menos 1 día en el futuro' :
                    daysDifference > 90 ? 'No se pueden hacer reservas con más de 90 días de anticipación' :
                    'Fecha válida'
        };
    }
}

// Crear instancia global del servicio
const supabaseService = new SupabaseService();

// Exportar servicio
export default supabaseService;

// También exportar el cliente directo para casos especiales
export { supabaseClient };
