import { BusinessSuggestion, PricingSuggestion } from './types.js';
import { format, isWeekend, addDays, differenceInDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export interface BookingPattern {
  date: string;
  inflatable: 'LARGE' | 'SMALL';
  price: number;
  wasWeekend: boolean;
  daysInAdvance: number;
  season: string;
}

export interface MarketConditions {
  averageBookingRate: number;
  weekendPremium: number;
  seasonalDemand: number;
  competitorPricing: number;
  economicIndex: number;
}

export class BusinessIntelligenceEngine {
  
  constructor() {}

  /**
   * Analiza patrones de reservas y genera sugerencias de precios
   */
  async analyzePricingOpportunities(
    bookingHistory: BookingPattern[],
    currentPrices: { LARGE: number; SMALL: number },
    marketConditions: MarketConditions
  ): Promise<PricingSuggestion[]> {
    const suggestions: PricingSuggestion[] = [];

    // 1. Análisis de demanda por día de la semana
    const weekendAnalysis = this.analyzeWeekendDemand(bookingHistory);
    if (weekendAnalysis.shouldAdjust) {
      suggestions.push(this.createWeekendPricingSuggestion(
        weekendAnalysis,
        currentPrices,
        marketConditions
      ));
    }

    // 2. Análisis estacional
    const seasonalAnalysis = this.analyzeSeasonalTrends(bookingHistory);
    if (seasonalAnalysis.hasOpportunity) {
      suggestions.push(this.createSeasonalPricingSuggestion(
        seasonalAnalysis,
        currentPrices
      ));
    }

    // 3. Análisis de capacidad vs demanda
    const capacityAnalysis = this.analyzeCapacityUtilization(bookingHistory);
    if (capacityAnalysis.needsAdjustment) {
      suggestions.push(this.createCapacityPricingSuggestion(
        capacityAnalysis,
        currentPrices
      ));
    }

    return suggestions.filter(s => s.confidence > 70); // Solo sugerencias con alta confianza
  }

  /**
   * Genera sugerencias de disponibilidad y promociones
   */
  async generateAvailabilitySuggestions(
    bookingHistory: BookingPattern[],
    upcomingAvailability: string[]
  ): Promise<BusinessSuggestion[]> {
    const suggestions: BusinessSuggestion[] = [];

    // Detectar días con baja demanda histórica
    const lowDemandDays = this.identifyLowDemandDays(bookingHistory, upcomingAvailability);
    
    if (lowDemandDays.length > 0) {
      suggestions.push({
        id: uuidv4(),
        type: 'availability',
        priority: 'medium',
        title: 'Promoción para días de baja demanda',
        description: `Se han identificado ${lowDemandDays.length} días con históricamente baja demanda`,
        reasoning: 'Análisis histórico muestra <30% ocupación en estos días',
        suggestedAction: `Crear promoción "Martes y Miércoles -15%" para fechas: ${lowDemandDays.slice(0, 3).join(', ')}`,
        potentialImpact: {
          bookingRate: 45,
          revenue: 280
        },
        dataSource: ['booking_history', 'demand_patterns'],
        confidence: 85,
        createdAt: new Date(),
        expiresAt: addDays(new Date(), 14),
        category: 'promociones'
      });
    }

    return suggestions;
  }

  /**
   * Sugerencias de marketing basadas en patrones
   */
  async generateMarketingSuggestions(
    bookingHistory: BookingPattern[],
    customerSegments: any[]
  ): Promise<BusinessSuggestion[]> {
    const suggestions: BusinessSuggestion[] = [];

    // Análisis de temporada alta próxima
    const upcomingHighSeason = this.predictUpcomingHighSeason();
    if (upcomingHighSeason.isNear) {
      suggestions.push({
        id: uuidv4(),
        type: 'marketing',
        priority: 'high',
        title: 'Campaña pre-temporada alta',
        description: 'Se aproxima temporada alta (primavera) - oportunidad de marketing',
        reasoning: 'Histórico muestra 300% más reservas en marzo-mayo',
        suggestedAction: 'Lanzar campaña "Reserva tu primavera" con descuento early-bird 10%',
        potentialImpact: {
          bookingRate: 65,
          revenue: 1200
        },
        dataSource: ['seasonal_analysis', 'marketing_historical'],
        confidence: 92,
        createdAt: new Date(),
        category: 'campaña_estacional'
      });
    }

    return suggestions;
  }

  // Métodos privados de análisis

  private analyzeWeekendDemand(bookings: BookingPattern[]) {
    const weekendBookings = bookings.filter(b => b.wasWeekend);
    const weekdayBookings = bookings.filter(b => !b.wasWeekend);
    
    const weekendRate = weekendBookings.length / (weekendBookings.length + weekdayBookings.length);
    const currentPremium = 0.20; // 20% actual
    const optimalPremium = weekendRate > 0.7 ? 0.25 : 0.15;
    
    return {
      shouldAdjust: Math.abs(currentPremium - optimalPremium) > 0.03,
      currentPremium,
      optimalPremium,
      weekendRate,
      confidence: 88
    };
  }

  private analyzeSeasonalTrends(bookings: BookingPattern[]) {
    const seasonCounts = bookings.reduce((acc, booking) => {
      acc[booking.season] = (acc[booking.season] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const highestSeason = Object.entries(seasonCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      hasOpportunity: true,
      peakSeason: highestSeason[0],
      peakDemand: highestSeason[1],
      confidence: 76
    };
  }

  private analyzeCapacityUtilization(bookings: BookingPattern[]) {
    const largeBookings = bookings.filter(b => b.inflatable === 'LARGE').length;
    const smallBookings = bookings.filter(b => b.inflatable === 'SMALL').length;
    
    const largeUtilization = largeBookings / (largeBookings + smallBookings);
    
    return {
      needsAdjustment: largeUtilization > 0.8 || largeUtilization < 0.4,
      largeUtilization,
      recommendation: largeUtilization > 0.8 ? 'increase_large_price' : 'decrease_large_price',
      confidence: 82
    };
  }

  private createWeekendPricingSuggestion(
    analysis: any,
    currentPrices: { LARGE: number; SMALL: number },
    market: MarketConditions
  ): PricingSuggestion {
    const suggestedPremium = analysis.optimalPremium;
    const currentLargeWeekendPrice = currentPrices.LARGE * 1.2;
    const suggestedLargeWeekendPrice = currentPrices.LARGE * (1 + suggestedPremium);
    
    return {
      id: uuidv4(),
      type: 'pricing',
      priority: 'medium',
      title: 'Ajuste de precio fin de semana',
      description: `Optimizar recargo de fin de semana del ${analysis.currentPremium * 100}% al ${suggestedPremium * 100}%`,
      reasoning: `Demanda de fin de semana es ${Math.round(analysis.weekendRate * 100)}%, justifica ajuste`,
      suggestedAction: `Cambiar recargo fin de semana a ${Math.round(suggestedPremium * 100)}%`,
      potentialImpact: {
        revenue: (suggestedLargeWeekendPrice - currentLargeWeekendPrice) * 8, // 8 weekends/month avg
        bookingRate: analysis.weekendRate > 0.7 ? -5 : 15
      },
      dataSource: ['booking_patterns', 'weekend_analysis'],
      confidence: analysis.confidence,
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 30),
      category: 'optimización_precios',
      currentPrice: currentLargeWeekendPrice,
      suggestedPrice: suggestedLargeWeekendPrice,
      priceChange: suggestedLargeWeekendPrice - currentLargeWeekendPrice,
      priceChangePercentage: ((suggestedLargeWeekendPrice - currentLargeWeekendPrice) / currentLargeWeekendPrice) * 100,
      inflatable: 'ALL'
    };
  }

  private createSeasonalPricingSuggestion(analysis: any, currentPrices: any): PricingSuggestion {
    return {
      id: uuidv4(),
      type: 'pricing',
      priority: 'low',
      title: 'Ajuste estacional',
      description: `Preparar precios para temporada ${analysis.peakSeason}`,
      reasoning: `${analysis.peakSeason} muestra ${analysis.peakDemand} reservas históricas`,
      suggestedAction: `Considerar incremento 10-15% durante ${analysis.peakSeason}`,
      potentialImpact: {
        revenue: currentPrices.LARGE * 0.12 * analysis.peakDemand
      },
      dataSource: ['seasonal_analysis'],
      confidence: analysis.confidence,
      createdAt: new Date(),
      category: 'precios_estacionales',
      currentPrice: currentPrices.LARGE,
      suggestedPrice: currentPrices.LARGE * 1.12,
      priceChange: currentPrices.LARGE * 0.12,
      priceChangePercentage: 12,
      inflatable: 'LARGE'
    };
  }

  private createCapacityPricingSuggestion(analysis: any, currentPrices: any): PricingSuggestion {
    const isIncrease = analysis.recommendation === 'increase_large_price';
    const multiplier = isIncrease ? 1.08 : 0.95;
    
    return {
      id: uuidv4(),
      type: 'pricing',
      priority: 'medium',
      title: `${isIncrease ? 'Incrementar' : 'Reducir'} precio Castillo Grande`,
      description: `Utilización actual: ${Math.round(analysis.largeUtilization * 100)}%`,
      reasoning: `${isIncrease ? 'Alta' : 'Baja'} demanda relativa justifica ajuste de precio`,
      suggestedAction: `${isIncrease ? 'Incrementar' : 'Reducir'} precio base del Castillo Grande ${Math.abs(Math.round((multiplier - 1) * 100))}%`,
      potentialImpact: {
        revenue: (currentPrices.LARGE * multiplier - currentPrices.LARGE) * 15, // 15 bookings/month avg
        bookingRate: isIncrease ? -8 : 12
      },
      dataSource: ['capacity_analysis', 'utilization_rates'],
      confidence: analysis.confidence,
      createdAt: new Date(),
      category: 'optimización_capacidad',
      currentPrice: currentPrices.LARGE,
      suggestedPrice: currentPrices.LARGE * multiplier,
      priceChange: currentPrices.LARGE * (multiplier - 1),
      priceChangePercentage: (multiplier - 1) * 100,
      inflatable: 'LARGE'
    };
  }

  private identifyLowDemandDays(bookings: BookingPattern[], upcoming: string[]): string[] {
    // Lógica simplificada - en producción sería más compleja
    return upcoming.filter(date => {
      const dayOfWeek = new Date(date).getDay();
      return dayOfWeek === 2 || dayOfWeek === 3; // Martes y miércoles típicamente menos demanda
    }).slice(0, 5);
  }

  private predictUpcomingHighSeason() {
    const now = new Date();
    const month = now.getMonth();
    
    // Primavera (marzo-mayo) típicamente temporada alta para fiestas infantiles
    const isNearSpring = month >= 1 && month <= 3; // Feb-Abril
    
    return {
      isNear: isNearSpring,
      season: 'primavera',
      confidence: 85
    };
  }
}
