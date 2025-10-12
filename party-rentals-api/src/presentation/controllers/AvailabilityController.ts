import express from 'express';
import { 
  CheckAvailabilityUseCase, 
  CheckAvailabilityRequest,
  CheckAvailabilityResponse 
} from 'party-rentals-core';
import { SupabaseInflatableRepository } from '../infrastructure/repositories/SupabaseInflatableRepository';
import { SupabaseRentalRepository } from '../infrastructure/repositories/SupabaseRentalRepository';
import { createClient } from '@supabase/supabase-js';

export class AvailabilityController {
  private checkAvailabilityUseCase: CheckAvailabilityUseCase;

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize repositories
    const inflatableRepository = new SupabaseInflatableRepository(supabase);
    const rentalRepository = new SupabaseRentalRepository(supabase);

    // Initialize use case
    this.checkAvailabilityUseCase = new CheckAvailabilityUseCase(
      inflatableRepository,
      rentalRepository
    );
  }

  async checkAvailability(req: express.Request, res: express.Response): Promise<void> {
    try {
      const request: CheckAvailabilityRequest = {
        inflatableId: req.query.inflatableId as string,
        size: req.query.size as string,
        date: req.query.date as string
      };

      // Validation
      if (!request.date) {
        res.status(400).json({
          error: 'Date is required',
          message: 'Please provide a valid date in YYYY-MM-DD format'
        });
        return;
      }

      if (!request.inflatableId && !request.size) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Either inflatableId or size must be provided'
        });
        return;
      }

      const response: CheckAvailabilityResponse = await this.checkAvailabilityUseCase.execute(request);

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}
