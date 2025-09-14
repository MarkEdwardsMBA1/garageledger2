// Wizard Step Validation Schemas
// Clean, focused validation for each wizard step

import { z } from 'zod';
import { ServiceDateSchema, OdometerSchema, CostSchema, ShopNameSchema, VehicleIdSchema } from './baseSchemas';

/**
 * Shop Service Step 1 - Basic Information
 * Required: date, odometer, totalCost, shopName, vehicleId
 */
export const ShopStep1Schema = z.object({
  vehicleId: VehicleIdSchema,
  date: ServiceDateSchema,
  mileage: OdometerSchema,
  totalCost: CostSchema,
  shopName: ShopNameSchema,
  // Optional fields
  shopAddress: z.string().max(200).optional(),
  shopPhone: z.string().max(20).optional(), 
  shopEmail: z.string().email().optional().or(z.literal(''))
});

/**
 * DIY Service Step 1 - Basic Information  
 * Required: date, odometer, vehicleId
 */
export const DIYStep1Schema = z.object({
  vehicleId: VehicleIdSchema,
  date: ServiceDateSchema,
  mileage: OdometerSchema
});

// Export inferred types
export type ShopStep1Data = z.infer<typeof ShopStep1Schema>;
export type DIYStep1Data = z.infer<typeof DIYStep1Schema>;