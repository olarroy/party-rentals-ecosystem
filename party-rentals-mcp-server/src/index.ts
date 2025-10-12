import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { BusinessIntelligenceEngine, BookingPattern, MarketConditions } from './suggestions/BusinessIntelligenceEngine.js';
import { BusinessSuggestion, PricingSuggestion } from './suggestions/types.js';

class PartyRentalsMCPServer {
  private server: Server;
  private biEngine: BusinessIntelligenceEngine;

  constructor() {
    this.server = new Server(
      {
        name: 'party-rentals-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.biEngine = new BusinessIntelligenceEngine();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // Lista de herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_pricing_opportunities',
            description: 'Analiza patrones de reservas y sugiere optimizaciones de precios (NO ejecuta cambios)',
            inputSchema: {
              type: 'object',
              properties: {
                bookingHistory: {
                  type: 'array',
                  description: 'Histórico de reservas para análisis',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string' },
                      inflatable: { type: 'string', enum: ['LARGE', 'SMALL'] },
                      price: { type: 'number' },
                      wasWeekend: { type: 'boolean' },
                      daysInAdvance: { type: 'number' },
                      season: { type: 'string' }
                    }
                  }
                },
                currentPrices: {
                  type: 'object',
                  properties: {
                    LARGE: { type: 'number' },
                    SMALL: { type: 'number' }
                  }
                },
                marketConditions: {
                  type: 'object',
                  properties: {
                    averageBookingRate: { type: 'number' },
                    weekendPremium: { type: 'number' },
                    seasonalDemand: { type: 'number' },
                    competitorPricing: { type: 'number' },
                    economicIndex: { type: 'number' }
                  }
                }
              },
              required: ['bookingHistory', 'currentPrices']
            }
          },
          {
            name: 'generate_availability_suggestions',
            description: 'Genera sugerencias para optimizar disponibilidad y crear promociones',
            inputSchema: {
              type: 'object',
              properties: {
                bookingHistory: {
                  type: 'array',
                  description: 'Histórico de reservas',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string' },
                      inflatable: { type: 'string' },
                      price: { type: 'number' },
                      wasWeekend: { type: 'boolean' },
                      daysInAdvance: { type: 'number' },
                      season: { type: 'string' }
                    }
                  }
                },
                upcomingAvailability: {
                  type: 'array',
                  description: 'Fechas próximas disponibles',
                  items: { type: 'string' }
                }
              },
              required: ['bookingHistory', 'upcomingAvailability']
            }
          },
          {
            name: 'generate_marketing_insights',
            description: 'Analiza datos y sugiere estrategias de marketing',
            inputSchema: {
              type: 'object',
              properties: {
                bookingHistory: { type: 'array' },
                customerSegments: { type: 'array' },
                seasonality: { type: 'object' }
              },
              required: ['bookingHistory']
            }
          },
          {
            name: 'get_business_health_report',
            description: 'Genera reporte completo del estado del negocio con métricas clave',
            inputSchema: {
              type: 'object',
              properties: {
                timeframe: { 
                  type: 'string', 
                  enum: ['week', 'month', 'quarter', 'year'],
                  description: 'Período a analizar'
                },
                includeForecasting: {
                  type: 'boolean',
                  description: 'Incluir predicciones futuras'
                }
              },
              required: ['timeframe']
            }
          }
        ]
      };
    });

    // Manejo de llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_pricing_opportunities':
            return await this.handlePricingAnalysis(args);
          
          case 'generate_availability_suggestions':
            return await this.handleAvailabilitySuggestions(args);
          
          case 'generate_marketing_insights':
            return await this.handleMarketingInsights(args);
          
          case 'get_business_health_report':
            return await this.handleBusinessHealthReport(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool ${name} not found`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private async handlePricingAnalysis(args: any) {
    const { bookingHistory, currentPrices, marketConditions } = args;
    
    const suggestions = await this.biEngine.analyzePricingOpportunities(
      bookingHistory as BookingPattern[],
      currentPrices,
      marketConditions as MarketConditions
    );

    return {
      content: [
        {
          type: 'text',
          text: this.formatPricingSuggestions(suggestions)
        }
      ]
    };
  }

  private async handleAvailabilitySuggestions(args: any) {
    const { bookingHistory, upcomingAvailability } = args;
    
    const suggestions = await this.biEngine.generateAvailabilitySuggestions(
      bookingHistory as BookingPattern[],
      upcomingAvailability
    );

    return {
      content: [
        {
          type: 'text',
          text: this.formatAvailabilitySuggestions(suggestions)
        }
      ]
    };
  }

  private async handleMarketingInsights(args: any) {
    const { bookingHistory, customerSegments } = args;
    
    const suggestions = await this.biEngine.generateMarketingSuggestions(
      bookingHistory as BookingPattern[],
      customerSegments || []
    );

    return {
      content: [
        {
          type: 'text',
          text: this.formatMarketingSuggestions(suggestions)
        }
      ]
    };
  }

  private async handleBusinessHealthReport(args: any) {
    const { timeframe, includeForecasting } = args;
    
    // Mock data para demostración
    const report = {
      period: timeframe,
      metrics: {
        totalBookings: 47,
        revenue: 3280,
        averageBookingValue: 69.8,
        occupancyRate: 73.2,
        customerSatisfaction: 4.7,
        repeatCustomerRate: 32
      },
      trends: {
        bookingsGrowth: '+15.3%',
        revenueGrowth: '+12.8%',
        seasonalForecast: includeForecasting ? 'Temporada alta próxima (+40% demanda esperada)' : null
      },
      alerts: [
        'Oportunidad: Martes y miércoles con baja ocupación (35%)',
        'Sugerencia: Incrementar precio fin de semana 5% por alta demanda'
      ]
    };

    return {
      content: [
        {
          type: 'text',
          text: this.formatBusinessHealthReport(report)
        }
      ]
    };
  }

  // Métodos de formateo para presentar sugerencias

  private formatPricingSuggestions(suggestions: PricingSuggestion[]): string {
    if (suggestions.length === 0) {
      return '📊 **ANÁLISIS DE PRECIOS**\n\n✅ Los precios actuales están optimizados. No se requieren ajustes en este momento.';
    }

    let output = '📊 **SUGERENCIAS DE OPTIMIZACIÓN DE PRECIOS**\n\n';
    output += '⚠️ *Estas son SUGERENCIAS para tu consideración. NO se ejecutarán automáticamente.*\n\n';

    suggestions.forEach((suggestion, index) => {
      output += `## ${index + 1}. ${suggestion.title}\n`;
      output += `**Prioridad:** ${suggestion.priority.toUpperCase()}\n`;
      output += `**Confianza:** ${suggestion.confidence}%\n\n`;
      
      output += `**💡 Análisis:**\n${suggestion.reasoning}\n\n`;
      
      output += `**🎯 Sugerencia:**\n${suggestion.suggestedAction}\n\n`;
      
      output += `**💰 Precio actual:** €${suggestion.currentPrice}\n`;
      output += `**💰 Precio sugerido:** €${suggestion.suggestedPrice.toFixed(2)}\n`;
      output += `**📈 Cambio:** ${suggestion.priceChange > 0 ? '+' : ''}€${suggestion.priceChange.toFixed(2)} (${suggestion.priceChangePercentage.toFixed(1)}%)\n\n`;
      
      if (suggestion.potentialImpact.revenue) {
        output += `**📊 Impacto estimado:**\n`;
        output += `- Ingresos: ${suggestion.potentialImpact.revenue > 0 ? '+' : ''}€${suggestion.potentialImpact.revenue}/mes\n`;
        if (suggestion.potentialImpact.bookingRate) {
          output += `- Reservas: ${suggestion.potentialImpact.bookingRate > 0 ? '+' : ''}${suggestion.potentialImpact.bookingRate}%\n`;
        }
      }
      
      output += `\n**⏰ Válido hasta:** ${suggestion.expiresAt?.toLocaleDateString() || 'Sin límite'}\n`;
      output += `\n---\n\n`;
    });

    output += '🤖 **Recuerda:** Estas sugerencias se basan en análisis de datos históricos. La decisión final siempre es tuya.';
    
    return output;
  }

  private formatAvailabilitySuggestions(suggestions: BusinessSuggestion[]): string {
    if (suggestions.length === 0) {
      return '📅 **ANÁLISIS DE DISPONIBILIDAD**\n\n✅ No se detectaron oportunidades de optimización en este momento.';
    }

    let output = '📅 **SUGERENCIAS DE DISPONIBILIDAD Y PROMOCIONES**\n\n';
    
    suggestions.forEach((suggestion, index) => {
      output += `## ${index + 1}. ${suggestion.title}\n`;
      output += `**Prioridad:** ${suggestion.priority.toUpperCase()}\n`;
      output += `**Confianza:** ${suggestion.confidence}%\n\n`;
      
      output += `**💡 Análisis:**\n${suggestion.reasoning}\n\n`;
      output += `**🎯 Acción recomendada:**\n${suggestion.suggestedAction}\n\n`;
      
      if (suggestion.potentialImpact.bookingRate) {
        output += `**📊 Impacto esperado:**\n`;
        output += `- Tasa de reservas: +${suggestion.potentialImpact.bookingRate}%\n`;
        if (suggestion.potentialImpact.revenue) {
          output += `- Ingresos adicionales: +€${suggestion.potentialImpact.revenue}/mes\n`;
        }
      }
      
      output += `\n---\n\n`;
    });

    return output;
  }

  private formatMarketingSuggestions(suggestions: BusinessSuggestion[]): string {
    if (suggestions.length === 0) {
      return '📣 **ANÁLISIS DE MARKETING**\n\n✅ Las estrategias actuales están funcionando bien.';
    }

    let output = '📣 **SUGERENCIAS DE MARKETING**\n\n';
    
    suggestions.forEach((suggestion, index) => {
      output += `## ${index + 1}. ${suggestion.title}\n`;
      output += `**Prioridad:** ${suggestion.priority.toUpperCase()}\n`;
      output += `**Confianza:** ${suggestion.confidence}%\n\n`;
      
      output += `**💡 Oportunidad detectada:**\n${suggestion.reasoning}\n\n`;
      output += `**🎯 Campaña sugerida:**\n${suggestion.suggestedAction}\n\n`;
      
      if (suggestion.potentialImpact.revenue) {
        output += `**📊 ROI estimado:**\n`;
        output += `- Ingresos adicionales: +€${suggestion.potentialImpact.revenue}\n`;
        if (suggestion.potentialImpact.bookingRate) {
          output += `- Incremento reservas: +${suggestion.potentialImpact.bookingRate}%\n`;
        }
      }
      
      output += `\n---\n\n`;
    });

    return output;
  }

  private formatBusinessHealthReport(report: any): string {
    let output = '📊 **REPORTE DE SALUD DEL NEGOCIO**\n\n';
    
    output += `**Período:** ${report.period}\n\n`;
    
    output += '## 📈 Métricas Clave\n';
    output += `- **Reservas totales:** ${report.metrics.totalBookings}\n`;
    output += `- **Ingresos:** €${report.metrics.revenue}\n`;
    output += `- **Valor medio por reserva:** €${report.metrics.averageBookingValue}\n`;
    output += `- **Tasa de ocupación:** ${report.metrics.occupancyRate}%\n`;
    output += `- **Satisfacción cliente:** ${report.metrics.customerSatisfaction}/5\n`;
    output += `- **Clientes recurrentes:** ${report.metrics.repeatCustomerRate}%\n\n`;
    
    output += '## 📊 Tendencias\n';
    output += `- **Crecimiento reservas:** ${report.trends.bookingsGrowth}\n`;
    output += `- **Crecimiento ingresos:** ${report.trends.revenueGrowth}\n`;
    if (report.trends.seasonalForecast) {
      output += `- **Predicción:** ${report.trends.seasonalForecast}\n`;
    }
    output += '\n';
    
    if (report.alerts.length > 0) {
      output += '## 🚨 Alertas y Oportunidades\n';
      report.alerts.forEach((alert: string, index: number) => {
        output += `${index + 1}. ${alert}\n`;
      });
    }
    
    return output;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Party Rentals MCP Server running on stdio');
  }
}

const server = new PartyRentalsMCPServer();
server.run().catch(console.error);
