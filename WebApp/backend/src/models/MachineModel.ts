import * as _ from 'lodash';

import { SupplierTypes } from '../../../shared/SupplierTypes';
import { VendingTypes } from '../../../shared/VendingTypes';
import { connection } from '../database/Connection';
import { constrcutINClause } from './utlis';
import { paymentModel } from './PaymentModel';
import { roundToTwoDecimals } from '../../../shared/utils';

class MachineModel {
  async getMachinesForUser(
    companyId: string
  ): Promise<SupplierTypes.Machine[]> {
    const conn = await connection;

    const machines = await conn.query(`
      SELECT *
      FROM vending_machines 
      WHERE company_id="${companyId}"
    `);

    const items = await conn.query<SupplierTypes.Machine['items']>(`
      SELECT * 
      FROM machine_items mi
      INNER JOIN items i
      ON mi.item_id = i.id
      WHERE machine_id in ${constrcutINClause(machines.map(({ id }: { id: string }) => id))}
    `);

    const payments = await paymentModel.getPaymentsForMachines(
      machines.map(({ id }: { id: string }) => id)
    );

    return aggregateMachines(machines, items as any, payments);
  }

  async getMachine(
    machineId: string
  ): Promise<VendingTypes.Machine | undefined> {
    const conn = await connection;

    const machines = await conn.query(`
      SELECT id, floor, machine_number, company_id, city
      FROM vending_machines 
      WHERE id="${machineId}"
    `);

    const machine = machines[0];

    if (!machine) {
      return undefined;
    }

    const items = await conn.query(`
      SELECT * 
      FROM machine_items mi
      INNER JOIN items i
      ON mi.item_id = i.id
      WHERE machine_id="${machineId}"
    `);

    return aggregateVMItems(machine, items);
  }

  async getAllMachineIds(): Promise<string[]> {
    const conn = await connection;

    const machines = await conn.query(`
      SELECT id 
      FROM vending_machines
    `);

    return machines.map(({ id }: any) => id);
  }

  async restockMachine(
    machineId: string
  ): Promise<SupplierTypes.Machine | undefined> {
    const conn = await connection;

    await conn.query(`
      UPDATE machine_items SET quantity=capacity where machine_id='${machineId}'
    `);

    return this.getMachineForSupplier(machineId);
  }

  async updateCapacity(
    machineId: string,
    companyId: string,
    strategy: SupplierTypes.Strategy | undefined,
    items: SupplierTypes.Machine['items']
  ): Promise<SupplierTypes.Machine[]> {
    const conn = await connection;
    const machine = await conn.query(
      `SELECT * from vending_machines WHERE id='${machineId}'`
    );
    if (machine.length === 0) {
      throw new Error(`Machine ${machineId} does not exist.`);
    }

    if (strategy != null) {
      await conn.query(`
        UPDATE vending_machines SET strategy='${strategy}' WHERE id='${machineId}'
      `);
    }

    for (const item of items) {
      await conn.query(`
        UPDATE machine_items SET capacity=${item.capacity} where machine_id='${machineId}' AND item_id='${item.id}'
      `);
    }

    return this.getMachinesForUser(companyId);
  }

  async getMachineForSupplier(
    machineId: string
  ): Promise<SupplierTypes.Machine | undefined> {
    const conn = await connection;

    const machine = (
      await conn.query(`
      SELECT *
      FROM vending_machines 
      WHERE id="${machineId}"
    `)
    )[0];

    const items = await conn.query(`
      SELECT * 
      FROM machine_items mi
      INNER JOIN items i
      ON mi.item_id = i.id
      WHERE machine_id="${machineId}"
    `);

    const sales = await paymentModel.getSalesForMachine(machineId);

    return {
      id: machine.id,
      name: machine.name,
      floor: machine.FLOOR,
      machineNumber: machine.MACHINE_NUMBER,
      companyId: machine.OWNER_ID,
      items:
        items.map(({ id, name, unit_price, quantity, capacity }: any) => ({
          itemId: id,
          name,
          price: unit_price,
          quantity,
          capacity,
        })) || [],
      sales,
      city: machine.city,
      location: {
        longitude: machine.longitude,
        latitude: machine.latitude,
      },
      strategy: machine.strategy,
    };
  }
}

const aggregateVMItems = (machine: any, items: any[]): VendingTypes.Machine => {
  const { id, floor, machine_number, company_id, city } = machine;
  return {
    machineId: id,
    city,
    floor,
    machineNumber: machine_number,
    ownerId: company_id,
    items:
      items.map(({ id, name, unit_price, quantity }) => ({
        id,
        name,
        price: unit_price,
        quantity,
      })) || [],
  };
};

const aggregateMachines = (
  machines: any[],
  items: (Omit<SupplierTypes.Machine['items'][number], 'price'> & {
    machine_id: string;
    item_id: string;
    unit_price: number;
  })[],
  transactions: SupplierTypes.Transaction[]
): SupplierTypes.Machine[] => {
  const groupedItems = _.groupBy(items, ({ machine_id }) => machine_id);
  const transactionsByMachineId = _.groupBy(
    transactions,
    ({ machineId }) => machineId
  );

  return machines.map(
    ({
      id,
      name,
      floor,
      machine_number,
      company_id,
      city,
      longitude,
      latitude,
      strategy,
    }: any): SupplierTypes.Machine => ({
      id,
      name,
      floor: floor,
      machineNumber: machine_number,
      companyId: company_id,
      items:
        _.sortBy(
          groupedItems[id]?.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.unit_price,
            size: item.size,
            container: item.container,
            tags: new Set(),
            quantity: item.quantity,
            capacity: item.capacity,
          })),
          ({ name }) => name
        ) || [],
      sales: roundToTwoDecimals(
        _.sumBy(
          transactionsByMachineId[id] ?? [],
          ({ totalPrice }) => totalPrice
        )
      ),
      city,
      location: {
        longitude,
        latitude,
      },
      strategy,
    })
  );
};

export const machineModel = new MachineModel();
