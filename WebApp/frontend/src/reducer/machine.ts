import { cloneDeep, findIndex } from 'lodash';

import { SupplierTypes } from "../../../shared/SupplierTypes";
import { SupplierState } from '../store';
import {roundToTwoDecimals} from "../../../shared/utils";

type SupplierAction = {
  type: 'INITIAL_LOAD';
  payload: {
    machines: SupplierTypes.Machine[];
    sales: SupplierTypes.Sales;
    transactions: SupplierTypes.Transaction[];
    strategies: SupplierTypes.Strategies;
  };
} | {
  type: 'DEFAULT_ACTION';
} | {
  type: 'UPDATE_MACHINE_STOCK';
  payload: SupplierTypes.Machine[];
}

const DEFAULT_STATE: SupplierState = {
  machines: [],
  sales: {
    daily:[],
    items:[],
    transactionSize: []
  },
  transactions: [],
  strategies: {}
}

export function machineReducer(state: SupplierState | undefined, action:SupplierAction): SupplierState {
  let newState;

  if (!state) {
    state = DEFAULT_STATE;
  }

  switch (action.type) {
    case 'INITIAL_LOAD':
      newState = {
        ...cloneDeep(action.payload)
      };
      break;
    case 'UPDATE_MACHINE_STOCK':
      newState = {
        ...state,
        machines: action.payload
      };

      break;
    default:
      newState = cloneDeep(DEFAULT_STATE);
  }

  roundStrategyNumbers(newState);
  return newState;
}

/**
 * Update state in place.
 * @param state
 */
function roundStrategyNumbers(state: SupplierState): void {
  Object.values(state.strategies).forEach((strategy) => {
    Object.values(strategy).forEach((s1) => {
      Object.values(s1).forEach((s2) => {
        for(const key of Object.keys(s2)) {
          s2[key] = Math.ceil(s2[key]);
        }
      })
    })
  })
}