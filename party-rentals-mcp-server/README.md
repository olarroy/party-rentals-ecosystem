# 🤖 Party Rentals MCP Server

**MCP Server** especializado en análisis inteligente y sugerencias de optimización para el negocio de alquiler de inflables.

## 🎯 Filosofía: IA Consultora, No Controladora

### **❌ Lo que NO hace:**
- Cambiar precios automáticamente
- Modificar disponibilidad sin autorización
- Ejecutar campañas de marketing automáticamente
- Tomar decisiones comerciales por ti

### **✅ Lo que SÍ hace:**
- **Analiza** patrones de reservas y tendencias
- **Sugiere** optimizaciones basadas en datos
- **Recomienda** estrategias de marketing
- **Informa** sobre oportunidades de negocio
- **Predice** tendencias estacionales

## 🧠 Capacidades de IA

### **1. Análisis de Precios**
```typescript
// Analiza histórico y sugiere ajustes
analyze_pricing_opportunities({
  bookingHistory: [...],
  currentPrices: { LARGE: 80, SMALL: 60 },
  marketConditions: {...}
})
```

**Sugerencias típicas:**
- 📊 "Incrementar recargo fin de semana del 20% al 25% por alta demanda"
- 📉 "Reducir precio Castillo Grande 8% para mejorar ocupación"
- 🗓️ "Aplicar descuento temporal 15% en martes-miércoles"

### **2. Optimización de Disponibilidad**
```typescript
// Identifica oportunidades de promociones
generate_availability_suggestions({
  bookingHistory: [...],
  upcomingAvailability: ['2024-01-15', '2024-01-16', ...]
})
```

**Sugerencias típicas:**
- 🎯 "Promoción 'Martes Feliz' -20% para mejorar ocupación días lentos"
- 📅 "Bloquear sábados en temporada alta para evento corporativo"
- 🎪 "Crear pack 'Fin de semana doble' para maximizar ingresos"

### **3. Insights de Marketing**
```typescript
// Detecta oportunidades de campaña
generate_marketing_insights({
  bookingHistory: [...],
  customerSegments: [...],
  seasonality: {...}
})
```

**Sugerencias típicas:**
- 🌸 "Lanzar campaña 'Primavera Divertida' - temporada alta detectada"
- 👥 "Programa fidelización - 32% clientes repiten reserva"
- 📱 "Campaña SMS para reservas de último momento"

### **4. Reporte de Salud del Negocio**
```typescript
// Dashboard ejecutivo completo
get_business_health_report({
  timeframe: 'month',
  includeForecasting: true
})
```

**Métricas clave:**
- 📈 Crecimiento reservas y ingresos
- 🎯 Tasa de ocupación por inflable
- ⭐ Satisfacción del cliente
- 🔄 Retención y recurrencia
- 📊 Predicciones estacionales

## 🛠️ Configuración

### **1. Instalar Dependencias**
```bash
npm install
```

### **2. Variables de Entorno**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
NODE_ENV=development
```

### **3. Ejecutar Servidor**
```bash
npm run dev
```

## 🔗 Integración con Claude

### **Configurar en Claude Desktop**
```json
{
  "mcpServers": {
    "party-rentals": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/party-rentals-mcp-server"
    }
  }
}
```

### **Uso con Claude**
```
"Analiza las reservas del último mes y sugiere optimizaciones de precio"

"¿Qué días de la próxima semana tienen baja demanda histórica?"

"Genera un reporte de salud del negocio para el último trimestre"
```

## 📊 Algoritmos de IA

### **Análisis de Demanda**
- **Patrones estacionales** - Detecta temporadas altas/bajas
- **Elasticidad de precios** - Correlación precio-demanda
- **Segmentación temporal** - Fin de semana vs días laborables
- **Análsis de competencia** - Benchmark de mercado

### **Predicciones**
- **Forecasting estacional** - Predicción 3-6 meses
- **Optimización de inventory** - Disponibilidad vs demanda
- **Customer Lifetime Value** - Valor del cliente a largo plazo
- **Churn prediction** - Riesgo de pérdida de clientes

### **Optimización**
- **Yield management** - Maximizar ingresos por disponibilidad
- **Dynamic pricing** - Ajuste de precios en tiempo real
- **Campaign targeting** - Segmentación inteligente
- **Resource allocation** - Asignación óptima de recursos

## 🎯 Casos de Uso Reales

### **Escenario 1: Temporada Baja**
```
📊 IA detecta: "Ocupación enero 28% vs 65% histórico"
💡 Sugiere: "Promoción '3x2 enero' para Castillo Pequeño"
📈 Proyección: "+40% reservas, +€800 ingresos adicionales"
```

### **Escenario 2: Alta Demanda Fin de Semana**
```
📊 IA detecta: "Sábados ocupación 95%, lista de espera"
💡 Sugiere: "Incrementar precio sábado +€15 (18.75%)"
📈 Proyección: "Mismo nivel reservas, +€480/mes ingresos"
```

### **Escenario 3: Cliente Recurrente**
```
📊 IA detecta: "Cliente María - 4 reservas, última hace 3 meses"
💡 Sugiere: "Email personalizado descuento 10% cumpleaños hijo"
📈 Proyección: "85% probabilidad reconversión"
```

## 🚀 Roadmap

### **v1.1 - Integraciones**
- [ ] WhatsApp Business API
- [ ] Google Calendar sync
- [ ] Payment gateway analytics
- [ ] Weather API (cancelaciones lluvia)

### **v1.2 - IA Avanzada**
- [ ] Computer vision para inspección inflables
- [ ] Sentiment analysis reseñas clientes
- [ ] Predictive maintenance
- [ ] Optimización rutas entrega

### **v1.3 - Automación**
- [ ] Auto-respuestas inteligentes
- [ ] Scheduling optimizado montaje
- [ ] Inventory management predictivo
- [ ] Dynamic web pricing

---

**🎈 Desarrollado con ❤️ para hacer crecer tu negocio de forma inteligente**
