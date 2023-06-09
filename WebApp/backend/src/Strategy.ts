import axios from 'axios';

import {SupplierTypes} from "../../shared/SupplierTypes";
import { connection } from './database/Connection';

const ML_SERVER_URL = 'http://localhost:4455';

export async function getStrategies(): Promise<SupplierTypes.Strategies> {
  const strategies: SupplierTypes.Strategies = {};
  const conn = await connection;

  const machineNamesToIds = Object.fromEntries(
    (await conn.query(`SELECT id, name FROM vending_machines`)
      .map(({id, name}: {id: string, name: string}) => [name, id])));

  const itemKeyToId = Object.fromEntries(
    (await conn.query(`SELECT id, itemKey FROM items`)
      .map(({id, itemKey}: {id: string, itemKey: string}) => [itemKey, id])));

  for (const model of SupplierTypes.ML_MODELS) {
    for (const strategy of SupplierTypes.STRATEGIES) {
      try {
        const response = await axios.get(`${ML_SERVER_URL}/${model}_${strategy}`);
        if (response.status !== 200) {
          throw new Error(response.status.toString());
        }

        for (const [machineName, items] of Object.entries<Record<string, string>>(response.data)) {
          const machineId = machineNamesToIds[machineName];
          if (machineId == null) {
            throw new Error(`"Cannot find machine id for ${machineName}`);
          }

          const transformedItems = Object.fromEntries(Object.entries(items).map(([key, value]) =>
            [itemKeyToId[key], Number(value)/30]
          ));

          if (strategies[machineId] == null) {
            strategies[machineId] = {
              [model]: {
                [strategy]: transformedItems
              }
            } as any;
          } else {
            if (strategies[machineId][model] == null) {
              strategies[machineId][model] = {
                [strategy]: transformedItems
              } as any
            } else {
              strategies[machineId][model][strategy as SupplierTypes.Strategy] = transformedItems as any;
            }
          }
        }
      } catch (e) {
        console.error(`Something went wrong when trying to get ML predictions for ${model}_${strategy}`);
        throw (e);
      }
    }
  }

  return strategies;
}