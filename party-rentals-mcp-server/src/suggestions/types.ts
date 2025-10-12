export interface BusinessSuggestion {
  id: string;
  type: 'pricing' | 'availability' | 'marketing' | 'operations';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string;
  suggestedAction: string;
  potentialImpact: {
    revenue?: number;
    bookingRate?: number;
    customerSatisfaction?: number;
  };
  dataSource: string[];
  confidence: number; // 0-100
  createdAt: Date;
  expiresAt?: Date;
  category: string;
}

export interface PricingSuggestion extends BusinessSuggestion {
  type: 'pricing';
  currentPrice: number;
  suggestedPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  applicableDates?: string[];
  inflatable?: 'LARGE' | 'SMALL' | 'ALL';
}

export interface AvailabilitySuggestion extends BusinessSuggestion {
  type: 'availability';
  targetDates: string[];
  suggestedPromotions?: string[];
  blockedDates?: string[];
}

export interface MarketingSuggestion extends BusinessSuggestion {
  type: 'marketing';
  targetAudience: string;
  channel: 'email' | 'social' | 'web' | 'sms';
  content?: string;
  budget?: number;
}

export interface OperationsSuggestion extends BusinessSuggestion {
  type: 'operations';
  area: 'logistics' | 'inventory' | 'staff' | 'maintenance';
  urgency: 'immediate' | 'soon' | 'planned';
}
