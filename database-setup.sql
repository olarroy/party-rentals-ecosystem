-- =============================================================================
-- PARTY RENTALS DATABASE SETUP
-- Script SQL completo para configurar todas las tablas en Supabase
-- =============================================================================

-- 1. TABLA DE INFLABLES
-- Almacena la información de los castillos inflables disponibles
CREATE TABLE inflatables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL CHECK (size IN ('large', 'small')),
  capacity INTEGER NOT NULL,
  weekday_price DECIMAL(10,2) NOT NULL,
  weekend_price DECIMAL(10,2) NOT NULL,
  holiday_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  specifications JSONB,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABLA DE CLIENTES
-- Información de los clientes que hacen reservas
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA DE RESERVAS
-- Registro completo de todas las reservas realizadas
CREATE TABLE rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  inflatable_id UUID REFERENCES inflatables(id) NOT NULL,
  rental_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  rental_hours INTEGER NOT NULL,
  guest_count INTEGER NOT NULL,
  event_type VARCHAR(100),
  setup_address TEXT NOT NULL,
  special_requests TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  setup_fee DECIMAL(10,2) DEFAULT 25.00,
  cleaning_fee DECIMAL(10,2) DEFAULT 15.00,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ÍNDICES PARA MEJOR PERFORMANCE
-- Optimización de consultas frecuentes
CREATE INDEX idx_rentals_date ON rentals(rental_date);
CREATE INDEX idx_rentals_inflatable ON rentals(inflatable_id);
CREATE INDEX idx_rentals_customer ON rentals(customer_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_inflatables_size ON inflatables(size);
CREATE INDEX idx_inflatables_active ON inflatables(is_active);

-- 5. TRIGGERS PARA ACTUALIZAR TIMESTAMPS AUTOMÁTICAMENTE
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_inflatables_updated_at BEFORE UPDATE ON inflatables 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. INSERTAR DATOS DE EJEMPLO
-- Inflables iniciales para el negocio
INSERT INTO inflatables (name, size, capacity, weekday_price, weekend_price, holiday_price, description, specifications) VALUES
(
    'Castillo Grande Premium', 
    'large', 
    15, 
    150.00, 
    200.00, 
    250.00, 
    'Castillo inflable grande perfecto para fiestas con muchos invitados. Incluye tobogán y área de juegos.', 
    '{"dimensions": "6x6x4 metros", "weight_limit": "500kg", "age_range": "3-12 años", "features": ["Tobogán", "Área de salto", "Red de seguridad", "Ventilador incluido"]}'
),
(
    'Casa de Rebote Pequeña', 
    'small', 
    8, 
    100.00, 
    130.00, 
    160.00, 
    'Casa inflable compacta ideal para espacios reducidos y fiestas íntimas. Perfecta para jardines pequeños.', 
    '{"dimensions": "4x4x3 metros", "weight_limit": "300kg", "age_range": "2-10 años", "features": ["Área de salto", "Red de seguridad", "Ventilador incluido", "Fácil setup"]}'
);

-- 7. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- Seguridad a nivel de fila para proteger los datos
ALTER TABLE inflatables ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS DE SEGURIDAD
-- Permitir lectura pública de inflables activos
CREATE POLICY "Allow public read active inflatables" ON inflatables 
    FOR SELECT USING (is_active = true);

-- Permitir inserción de nuevos clientes desde la aplicación
CREATE POLICY "Allow insert customers" ON customers 
    FOR INSERT WITH CHECK (true);

-- Permitir lectura de clientes por email (para validación)
CREATE POLICY "Allow read customers by email" ON customers 
    FOR SELECT USING (true);

-- Permitir inserción de nuevas reservas
CREATE POLICY "Allow insert rentals" ON rentals 
    FOR INSERT WITH CHECK (true);

-- Permitir lectura de reservas por fecha (para disponibilidad)
CREATE POLICY "Allow read rentals for availability" ON rentals 
    FOR SELECT USING (true);

-- 9. FUNCIÓN PARA VERIFICAR DISPONIBILIDAD
-- Función personalizada para verificar si un inflable está disponible en una fecha
CREATE OR REPLACE FUNCTION check_availability(
    inflatable_size_param VARCHAR(20),
    rental_date_param DATE
)
RETURNS TABLE(
    inflatable_id UUID,
    name VARCHAR(100),
    is_available BOOLEAN,
    conflicting_rentals INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id as inflatable_id,
        i.name,
        CASE 
            WHEN COUNT(r.id) = 0 THEN true 
            ELSE false 
        END as is_available,
        COUNT(r.id)::INTEGER as conflicting_rentals
    FROM inflatables i
    LEFT JOIN rentals r ON i.id = r.inflatable_id 
        AND r.rental_date = rental_date_param 
        AND r.status NOT IN ('cancelled')
    WHERE i.size = inflatable_size_param 
        AND i.is_active = true
    GROUP BY i.id, i.name
    ORDER BY i.name;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCIÓN PARA GENERAR BOOKING ID ÚNICO
-- Genera IDs únicos para las reservas
CREATE OR REPLACE FUNCTION generate_booking_id()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_id VARCHAR(50);
    done BOOL;
BEGIN
    done := false;
    WHILE NOT done LOOP
        new_id := 'BR' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
        done := NOT EXISTS(SELECT 1 FROM rentals WHERE booking_id = new_id);
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 11. VISTA PARA ESTADÍSTICAS RÁPIDAS
-- Vista para obtener estadísticas del negocio fácilmente
CREATE VIEW rental_stats AS
SELECT 
    DATE_TRUNC('month', rental_date) as month,
    COUNT(*) as total_rentals,
    SUM(total_price) as total_revenue,
    AVG(total_price) as avg_price,
    COUNT(DISTINCT customer_id) as unique_customers
FROM rentals 
WHERE status NOT IN ('cancelled')
GROUP BY DATE_TRUNC('month', rental_date)
ORDER BY month DESC;

-- 12. COMENTARIOS EN TABLAS
-- Documentación de las tablas para futuros desarrolladores
COMMENT ON TABLE inflatables IS 'Catálogo de inflables disponibles para alquiler';
COMMENT ON TABLE customers IS 'Información de clientes que realizan reservas';
COMMENT ON TABLE rentals IS 'Registro completo de reservas realizadas';
COMMENT ON FUNCTION check_availability IS 'Verifica disponibilidad de inflables por fecha';
COMMENT ON FUNCTION generate_booking_id IS 'Genera IDs únicos para reservas';
COMMENT ON VIEW rental_stats IS 'Estadísticas mensuales de rentals y revenue';

-- ✅ SCRIPT COMPLETO - EJECUTAR TODO EN SUPABASE SQL EDITOR
