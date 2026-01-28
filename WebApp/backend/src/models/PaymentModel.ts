import * as _ from 'lodash';

import { SupplierTypes } from '../../../shared/SupplierTypes';
import { connection } from '../database/Connection';
import { constrcutINClause, jsDateToMySQLDate } from './utlis';
import { roundToTwoDecimals } from '../../../shared/utils';

class PaymentModel {
  async getSalesForMachine(machineId: string): Promise<number> {
    const conn = await connection;
    const today = new Date();
    const sales = await conn.query(`
    SELECT sum(price) as sales
    FROM payments
    WHERE machine_id="${machineId}"
    AND (p_time BETWEEN '${jsDateToMySQLDate(
      new Date(new Date().setDate(today.getDate() - 30))
    )}' AND '${jsDateToMySQLDate(today)}')
  `);

    return sales[0]?.sales.toFixed(2) || 0;
  }

  async getSalesForMachines(
    machineIds: string[]
  ): Promise<SupplierTypes.Sales> {
    const conn = await connection;
    const today = new Date();

    const payments = await conn.query(`
      SELECT payment_id, price, credit_card_number, p_time, machine_id
      FROM payments 
      WHERE machine_id IN ${constrcutINClause(machineIds)}
      AND (p_time BETWEEN '${jsDateToMySQLDate(
        new Date(new Date().setDate(today.getDate() - 30))
      )}' AND '${jsDateToMySQLDate(today)}')
    `);

    const daily = _.groupBy(payments, ({ p_time }) =>
      p_time.toLocaleDateString()
    );

    const dailyResults = Object.entries(daily).map(([key, dailyPayments]) => {
      const machinesById = _.groupBy(
        dailyPayments,
        ({ machine_id }) => machine_id
      );

      return {
        date: key,
        machines: Object.entries(machinesById).map(
          ([machineId, machineSales]) => ({
            machineId,
            sales: roundToTwoDecimals(
              _.sumBy(machineSales, ({ price }) => price)
            ),
          })
        ),
      };
    });

    const allPaymentIds = payments.map(({ payment_id }: any) => payment_id);

    const allItems = await conn.query(`
      SELECT item_id as itemId, sum(unit_price * quantity) as sales, name, count(*) as transactions 
      FROM payment_item 
      INNER JOIN items ON item_id=id 
      WHERE payment_id IN ${constrcutINClause(allPaymentIds)}
      GROUP BY item_id
    `);

    const transactions = await conn.query(`
      SELECT count(*) as count, pd.quantity as size
      FROM payments pm 
      INNER JOIN payment_item pd 
        ON pm.payment_id=pd.payment_id 
      GROUP BY pd.quantity
      ORDER BY size;
    `);

    return {
      daily: dailyResults,
      items: allItems,
      transactionSize: transactions.map(({ count, size }: any) => ({
        size,
        count,
      })),
    };
  }

  async getPaymentsForMachines(
    machineIds: string[]
  ): Promise<SupplierTypes.Transaction[]> {
    const conn = await connection;
    const today = new Date();

    const payments = await conn.query(`
      SELECT payment_id, price, credit_card_number, p_time, machine_id
      FROM payments 
      WHERE machine_id IN ${constrcutINClause(machineIds)}
      AND (p_time BETWEEN '${jsDateToMySQLDate(
        new Date(new Date().setDate(today.getDate() - 30))
      )}' AND '${jsDateToMySQLDate(today)}')
    `);

    const items = await conn.query(`
      SELECT payment_id, item_id, unit_price, quantity
      FROM payment_item
      WHERE payment_id IN ${constrcutINClause(payments.map(({ payment_id }: { payment_id: string }) => payment_id))}
    `);

    const itemDetails = await conn.query(`
      SELECT id, name
      FROM items
      WHERE id IN ${constrcutINClause(Array.from(new Set(items.map(({ item_id }: { item_id: string }) => item_id))))}
    `);

    const itemMap = _.keyBy(itemDetails, 'id');
    const paymentItems = _.groupBy(items, ({ payment_id }) => payment_id);

    return payments.map((payment: any): SupplierTypes.Transaction => {
      const paymentId = payment.payment_id;
      return {
        id: paymentId,
        items: paymentItems[paymentId].map((item) => {
          const itemId = item.item_id;
          return {
            itemId,
            name: itemMap[itemId].name,
            unitPrice: item.unit_price,
            quantity: item.quantity,
          };
        }),
        totalPrice: payment.price,
        creditCardNumber: payment.credit_card_number,
        timestamp: payment.p_time,
        machineId: payment.machine_id,
      };
    });
  }
}

export const paymentModel = new PaymentModel();
