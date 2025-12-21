import { supabase } from '../db/client.js';
import { BusinessIntelligenceEngine, BookingPattern } from '../core/BusinessIntelligenceEngine.js';

export class QueryHandler {
    private biEngine: BusinessIntelligenceEngine;

    constructor() {
        this.biEngine = new BusinessIntelligenceEngine();
    }

    async handleMessage(message: string): Promise<string> {
        const lowerMsg = message.toLowerCase();

        // 1. Consultar Reservas (Rentals)
        if (lowerMsg.includes('reservas') || lowerMsg.includes('bookings')) {
            return await this.getRecentRentals();
        }

        // 2. Consultar Clientes (Customers)
        if (lowerMsg.includes('clientes') || lowerMsg.includes('customers')) {
            return await this.getRecentCustomers();
        }

        // 3. Consultar Inflables (Inflatables)
        if (lowerMsg.includes('inflables') || lowerMsg.includes('inflatables')) {
            return await this.getInflatablesStatus();
        }

        // 4. IA Suggestions
        if (lowerMsg.includes('sugerencias') || lowerMsg.includes('analizar') || lowerMsg.includes('suggestions')) {
            return await this.getAISuggestions();
        }

        // 5. Ayuda / Default
        return `
🤖 **Hola, soy tu Asistente MCP**

Puedo ayudarte a consultar datos y **analizar tu negocio** con IA.
Prueba con estos comandos:

📅 *"Ver últimas reservas"*
👥 *"Ver clientes recientes"*
🎈 *"Estado de los inflables"*
🧠 *"Dame sugerencias de IA"* (Nuevo!)

`;
    }

    private async getRecentRentals(): Promise<string> {
        // ... (existing code)
        const { data, error } = await supabase
            .from('rentals')
            .select(`
        id,
        rental_date,
        total_price,
        status,
        customers (name),
        inflatables (name)
      `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) return `❌ Error consultando reservas: ${error.message}`;
        if (!data || data.length === 0) return "📭 No hay reservas recientes.";

        let response = "📅 **Últimas 5 Reservas:**\n\n";
        data.forEach((r: any) => {
            response += `🔹 **${new Date(r.rental_date).toLocaleDateString()}**\n`;
            response += `   💰 ${r.total_price}€ - ${r.status}\n`;
            const customerName = r.customers?.name || 'Cliente';
            const inflatableName = r.inflatables?.name || 'Inflable';
            response += `   👤 ${customerName} | 🎈 ${inflatableName}\n`;
            response += `   🆔 Ref: ${r.id.slice(0, 8)}...\n\n`;
        });
        return response;
    }

    private async getRecentCustomers(): Promise<string> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .limit(5);

        if (error) return `❌ Error consultando clientes: ${error.message}`;

        let response = "👥 **Clientes Recientes:**\n\n";
        data?.forEach((c: any) => {
            response += `👤 **${c.name}**\n`;
            response += `   📧 ${c.email}\n`;
            response += `   📱 ${c.phone}\n\n`;
        });
        return response;
    }

    private async getInflatablesStatus(): Promise<string> {
        const { data, error } = await supabase
            .from('inflatables')
            .select('*');

        if (error) return `❌ Error consultando inflables: ${error.message}`;

        let response = "🎈 **Estado de Inflables:**\n\n";
        data?.forEach((i: any) => {
            const statusIcon = i.is_available ? '✅' : '❌';
            response += `${statusIcon} **${i.name || i.size}**\n`;
            response += `   💰 Precio base: ${i.price_per_day}€\n\n`;
        });
        return response;
    }

    private async getAISuggestions(): Promise<string> {
        // Obtener datos reales para el análisis
        const { data: rentals } = await supabase
            .from('rentals')
            .select('rental_date, total_price, inflatables(size, price_per_day)');

        if (!rentals || rentals.length === 0) return "🧠 Necesito más datos históricos para generar sugerencias.";

        // Transformar datos para el motor de BI
        const bookingHistory: BookingPattern[] = rentals.map((r: any) => ({
            date: r.rental_date,
            inflatable: r.inflatables?.size || 'LARGE',
            price: r.total_price,
            wasWeekend: new Date(r.rental_date).getDay() === 0 || new Date(r.rental_date).getDay() === 6,
            daysInAdvance: 7, // Mock data for now
            season: 'spring' // Mock data
        }));

        const currentPrices = { LARGE: 100, SMALL: 80 }; // Mock, idealmente leer de DB
        const marketConditions = {
            averageBookingRate: 0.5,
            weekendPremium: 0.2,
            seasonalDemand: 1.0,
            competitorPricing: 0.9,
            economicIndex: 1.0
        };

        const suggestions = await this.biEngine.analyzePricingOpportunities(bookingHistory, currentPrices, marketConditions);

        if (suggestions.length === 0) return "✅ Todo parece optimizado. No tengo sugerencias nuevas por ahora.";

        let response = "🧠 **Sugerencias de Inteligencia de Negocio:**\n\n";
        suggestions.forEach((s, idx) => {
            response += `💡 **${idx + 1}. ${s.title}**\n`;
            response += `   _${s.reasoning}_\n`;
            response += `   🎯 Acción: ${s.suggestedAction}\n`;
            response += `   💰 Impacto: +${s.potentialImpact.revenue}€/mes est.\n\n`;
        });

        return response;
    }
}
