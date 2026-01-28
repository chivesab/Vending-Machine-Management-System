export namespace SupplierTypes {
  export interface User {
    id: string;
    email: string;
    name: string;
    companyId: string;
    role: 'restock' | 'normal' | 'admin';
  }

  export interface Company {
    id: string;
    name: string;
    users: User[];
  }

  export interface Machine {
    id: string;
    name: string;
    companyId: string;
    location: LongLat;
    city: string;
    floor: number;
    machineNumber: number;
    sales: number;
    strategy: Strategy | undefined;
    items: (Item & {
      quantity: number;
      capacity: number;
    })[];
  }

  export interface LongLat {
    longitude: number;
    latitude: number;
  }

  export const STRATEGIES: Strategy[] = ['quarterly', 'semiannually', 'yearly'];
  export type Strategy = 'quarterly' | 'semiannually' | 'yearly';

  export const ML_MODELS = ['linear', 'log', 'lstm'];
  export type MLModel = 'linear' | 'log' | 'lstm';
  // machineId -> ModelName -> Strategy -> itemId -> quantity
  export type Strategies = Record<
    string,
    Record<string, Record<Strategy, Record<string, number>>>
  >;

  export interface MachineGroup {
    machines: Machine[];
    companyId: string;
  }

  export interface Item {
    id: string;
    name: string;
    price: number;
    size: number;
    container: string;
    // What's this for?
    tags: Set<string>;
  }

  export interface Transaction {
    id: string;
    machineId: string;
    items: {
      itemId: string;
      name: string;
      unitPrice: number;
      quantity: number;
    }[];
    totalPrice: number;
    creditCardNumber: string;
    timestamp: Date;
  }

  export interface Sales {
    daily: {
      machines: {
        machineId: string;
        sales: number;
      }[];
      date: string;
    }[];
    items: {
      sales: number;
      name: string;
      itemId: string;
      transactions: number;
    }[];
    transactionSize: {
      size: number;
      count: number;
    }[];
  }
}

export namespace BackendTypes {}

export const DEFAULT_SALT_ROUNDS = 10;
