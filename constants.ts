
import { ProductType, WeightType, AreaType } from './types';

export const AREAS = [
  AreaType.SURAT, 
  AreaType.JAHANGIRPURA, 
  AreaType.ADAJAN, 
  AreaType.PAL, 
  AreaType.VESU
];

export const PRODUCTS = [
  ProductType.PAPADI, 
  ProductType.TUVER,
  ProductType.VAL,
  ProductType.CHOLI
];

export const WEIGHTS = [
  WeightType.W250G, 
  WeightType.W500G, 
  WeightType.W1KG,
  WeightType.W5KG
];

export const PRICING: Record<ProductType, Record<WeightType, number>> = {
  [ProductType.PAPADI]: {
    [WeightType.W250G]: 45,
    [WeightType.W500G]: 85,
    [WeightType.W1KG]: 160,
    [WeightType.W5KG]: 750,
  },
  [ProductType.TUVER]: {
    [WeightType.W250G]: 50,
    [WeightType.W500G]: 95,
    [WeightType.W1KG]: 180,
    [WeightType.W5KG]: 850,
  },
  [ProductType.VAL]: {
    [WeightType.W250G]: 40,
    [WeightType.W500G]: 75,
    [WeightType.W1KG]: 140,
    [WeightType.W5KG]: 650,
  },
  [ProductType.CHOLI]: {
    [WeightType.W250G]: 35,
    [WeightType.W500G]: 65,
    [WeightType.W1KG]: 120,
    [WeightType.W5KG]: 550,
  },
};
