export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
  isActive: boolean;
}

export interface Source {
  id: string;
  name: string;
  website: string;
  type: 'EXCHANGE_OFFICE' | 'NEWS_AGENCY' | 'CENTRAL_BANK' | 'OTHER';
}

export interface ExchangeRate {
  id: string;
  currencyCode: string;
  rate: string;
  type: 'BUY' | 'SELL';
  sourceId: string;
  source?: Source;
  currency?: Currency;
  createdAt: string;
}

export interface HistoricalRate {
  id: string;
  currencyCode: string;
  buyRate: string;
  sellRate: string;
  sourceId: string;
  recordedAt: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  countryCode: string;
  currencyCode: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  sourceId: string;
  publishedAt: string;
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currencyCode: string;
  forecast: string;
  previous: string;
  actual?: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  eventDate: string;
}

export interface ExchangeOffice {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
