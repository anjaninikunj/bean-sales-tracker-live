
export enum ProductType {
  PAPADI = 'Papadi',
  TUVER = 'Tuver',
  VAL = 'Val',
  CHOLI = 'Choli'
}

export enum AreaType {
  SURAT = 'Surat',
  JAHANGIRPURA = 'Jahangirpura',
  ADAJAN = 'Adajan',
  PAL = 'Pal',
  VESU = 'Vesu'
}

export enum WeightType {
  W250G = '250g',
  W500G = '500g',
  W1KG = '1kg',
  W5KG = '5kg'
}

export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending'
}

export interface SaleOrder {
  id: string;
  product: ProductType;
  date: string;
  customerName: string;
  customerPhone?: string;
  area: AreaType;
  weight: WeightType;
  quantity: number;
  totalPackages: number;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: number;
}

export interface ProductPrice {
  product: ProductType;
  prices: Record<WeightType, number>;
}
