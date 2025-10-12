# 🏛️ Party Rentals Core

**Núcleo del dominio** para el sistema de alquiler de inflables. Implementa **Domain Driven Design (DDD)** con **Test Driven Development (TDD)**.

## 🎯 Arquitectura DDD

### **Domain Layer**
```
src/domain/
├── entities/              # Entidades de negocio
│   ├── Inflatable.ts     # Castillo inflable
│   ├── Rental.ts         # Alquiler
│   └── Customer.ts       # Cliente
├── value-objects/         # Objetos de valor
│   ├── RentalDate.ts     # Fecha de alquiler
│   ├── RentalPrice.ts    # Precio
│   ├── InflatableSize.ts # Tamaño del inflable
│   └── SetupAddress.ts   # Dirección de montaje
├── repositories/          # Contratos de persistencia
│   ├── IInflatableRepository.ts
│   └── IRentalRepository.ts
└── services/             # Servicios de dominio
    ├── RentalService.ts
    ├── AvailabilityService.ts
    └── PricingService.ts
```

### **Application Layer**
```
src/application/
├── use-cases/            # Casos de uso
│   ├── CreateRentalUseCase.ts
│   ├── CheckAvailabilityUseCase.ts
│   ├── CancelRentalUseCase.ts
│   └── ScheduleSetupUseCase.ts
└── ports/               # Interfaces para infraestructura
    ├── IEmailService.ts
    ├── IPaymentService.ts
    └── ISMSService.ts
```

## 🧪 Test Driven Development (TDD)

### **Metodología Red-Green-Refactor**
1. **🔴 RED**: Escribir test que falle
2. **🟢 GREEN**: Código mínimo para pasar
3. **🔄 REFACTOR**: Limpiar código
4. **♻️ REPEAT**: Siguiente feature

### **Estructura de Tests**
```
__tests__/
├── domain/
│   ├── entities/
│   │   ├── Inflatable.test.ts
│   │   ├── Rental.test.ts
│   │   └── Customer.test.ts
│   ├── value-objects/
│   │   ├── RentalDate.test.ts
│   │   ├── RentalPrice.test.ts
│   │   └── InflatableSize.test.ts
│   └── services/
│       ├── RentalService.test.ts
│       └── AvailabilityService.test.ts
└── application/
    └── use-cases/
        ├── CreateRentalUseCase.test.ts
        └── CheckAvailabilityUseCase.test.ts
```

## 🚀 Comandos

### **Desarrollo TDD**
```bash
# Tests en modo watch (TDD)
npm run test:tdd

# Tests normales
npm test

# Coverage completo
npm run test:coverage

# Build
npm run build

# Lint
npm run lint
```

### **Flujo TDD Típico**
```bash
# 1. Ejecutar tests (deben fallar)
npm run test:tdd

# 2. Escribir código mínimo
# 3. Tests pasan (verde)
# 4. Refactor
# 5. Repetir
```

## 🎈 Modelo de Dominio

### **Entidades Principales**

#### **Inflatable (Aggregate Root)**
- Id único
- Nombre (ej: "Castillo Princesas")
- Tamaño (Grande/Pequeño)
- Precio por día
- Estado (Activo/Inactivo)
- Tiempo de montaje
- Imágenes

#### **Rental (Aggregate Root)**
- Id único
- Cliente
- Inflable
- Fecha de alquiler
- Dirección de montaje
- Precio total
- Estado (Pendiente/Confirmado/Completado/Cancelado)

#### **Customer (Entity)**
- Id único
- Nombre completo
- Email
- Teléfono
- Dirección

### **Value Objects**

#### **RentalDate**
- Validación de fechas futuras
- Comparación de fechas
- Formateo

#### **RentalPrice**
- Validación de precios positivos
- Operaciones matemáticas
- Formateo de moneda

#### **InflatableSize**
- Enum: Grande/Pequeño
- Capacidad de niños
- Dimensiones

## 📋 Reglas de Negocio

### **Disponibilidad**
- ✅ Solo 1 inflable grande disponible por día
- ✅ Solo 1 inflable pequeño disponible por día
- ✅ No se puede reservar en fechas pasadas
- ✅ Reservas con mínimo 24h de anticipación

### **Precios**
- 💰 Precio base por día
- 📅 Recargo fines de semana (+20%)
- 🎉 Descuento temporada baja (-15%)
- 🌟 Descuento clientes frecuentes (-10%)

### **Cancelaciones**
- ⏰ Gratis hasta 48h antes
- 💰 50% de recargo 24-48h antes
- ❌ No reembolsable <24h

## 🔗 Integración

Este core es **agnóstico de infraestructura** y se integra con:
- **party-rentals-api**: Implementa repositories
- **party-rentals-mcp-server**: Usa los use cases
- **party-rentals-frontend**: Consume via API

---

**Desarrollado con 💖 usando DDD + TDD + Clean Architecture**
