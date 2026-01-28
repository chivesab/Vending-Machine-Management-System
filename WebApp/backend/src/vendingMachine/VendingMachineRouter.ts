import express from 'express';
import * as uuid from 'uuid';

import { logger } from '../../Logger';
import { connection as connPromise } from '../database/Connection';
import { machineModel } from '../models/MachineModel';
import { VendingTypes } from '../../../shared/VendingTypes';

export const VendingMachineRouter = express.Router();

VendingMachineRouter.route('/').get((req, res) => {
  res.send('Welcome to VendingMachine main route at: ' + req.originalUrl);
});

VendingMachineRouter.route('/nearestMachineCheck').get(async (req, res) => {
  const { productId, flr } = req.query;
  logger.info('Quantity check for the product ' + `productId(${productId})`);

  console.log(req.query);

  console.log('productID', productId);
  console.log(req.query, productId, flr);

  let sql1 = `CALL nearestMachineCheck('${productId}',${flr})`;
  console.log(sql1);
  const connection = await connPromise;
  try {
    const results = await connection.query(sql1);
    console.log(results);
    res.send(results[0]);
  } catch (error) {
    res.send(error);
  }
});

VendingMachineRouter.route('/all').get(async (req, res) => {
  const machineIds = await machineModel.getAllMachineIds();

  res.send(machineIds);
});

VendingMachineRouter.route('/machineItems').get(async (req, res) => {
  const conn = await connPromise;

  const { machineId } = req.query;

  if (typeof machineId !== 'string') {
    return res.status(400).send();
  }

  const machine = await machineModel.getMachine(machineId);

  if (!machine) {
    res.status(404).send();
  } else {
    res.send(machine);
  }
});

VendingMachineRouter.route('/quantityCheckAndUpdate').post(async (req, res) => {
  const { machineId, basket, cardNumber } = req.body;

  const connection = await (await connPromise).getConnection();

  basketTypeAssertion(basket);

  try {
    for (const item of basket) {
      const { id: productId, count } = item;

      let sql1 = `CALL quantityCheck('${machineId}','${productId}', '${count}')`;
      console.log(
        `Calling quantityCheck for the product productId(${productId}) in the machine machineId(${machineId})`
      );
      const results = await connection.query(sql1);
      const result = results[0][0].quantity;

      if (count && result < count) {
        res.send('Not enough item: ' + item.name);
        return;
      }
    }
    console.log('Completed quantity check');
    try {
      await connection.beginTransaction();

      const totalCost = basket.reduce(
        (prev, { count, price }) => prev + (count ?? 0) * price,
        0
      );

      const paymentId = uuid.v4();
      console.log('after v4?');
      const sqlQuery = `CALL createPayment('${paymentId}', '${machineId}',${totalCost},'${cardNumber}')`;

      try {
        const results2 = await connection.query(sqlQuery);

        for (const item of basket) {
          const updateItemQuery = `CALL purchaseItems('${paymentId}','${item.id}', '${machineId}', ${item.price}, ${item.count})`;
          await connection.query(updateItemQuery);
        }

        await connection.commit();
        connection.release();
        res.send({
          message: 'Transaction Successful',
          results2,
        });
      } catch (err) {
        await connection.rollback();
        await connection.release();
        console.log(err);
        res.send('Error');
      }
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error('Error in Transaction', err);
      res.send('Error in transaction');
    }
  } catch (err) {
    logger.info('Error while acquring the connection');
    res.send(err);
  }
});

function basketTypeAssertion(
  basket: any
): asserts basket is VendingTypes.Item[] {
  if (Array.isArray(basket)) {
    return;
  }
  throw new Error('basket is not of correct type');
}
