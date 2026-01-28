export namespace VendingTypes {
  export interface Item {
    id: string;
    name: string;
    price: number;
    count?: number;
    quantity?: number;
  }

  export interface Machine {
    machineId: string;
    floor: number;
    machineNumber: number;
    city: string;
    ownerId: string;
    items: Item[];
  }

  export interface NearbyMachine {
    floor: number;
    machine_number: number;
  }
}
