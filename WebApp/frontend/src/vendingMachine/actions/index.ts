import axios from 'axios';

import { VendingTypes } from '../../../../shared/VendingTypes';
import { store } from '../store';

const { dispatch } = store;

export function selectItem(itemId: string) {
  dispatch({ type: 'SELECT_ITEM', payload: itemId });
}

export function removeItem(itemId: string) {
  dispatch({ type: 'REMOVE_ITEM', payload: itemId });
}

export async function initialLoad(machineId: string) {
  console.log('Initial Load', machineId);
  console.log(axios.defaults);
  if (!axios.defaults.baseURL) {
    return;
  }
  const machine = await axios.get<VendingTypes.Machine>(
    `/vm/machineItems?machineId=${machineId}`
  );
  dispatch({ type: 'INITIAL_LOAD', payload: machine.data });
}

export async function nearbyCheck(item: VendingTypes.Item, flr: number) {
  const nearbyMachines = await axios.get<VendingTypes.NearbyMachine[]>(
    `/vm/nearestMachineCheck?productId=${item.id}&flr=${flr}`
  );

  dispatch({
    type: 'NEARBY_CHECK',
    payload: {
      nearbyMachines: nearbyMachines.data,
      item,
    },
  });
}

export { pay, confirmPayment, cancelPayment } from './payment';
