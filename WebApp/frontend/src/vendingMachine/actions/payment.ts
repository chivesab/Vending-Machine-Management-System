import axios from 'axios';

import { store, VendingMachineState } from '../store';

const { dispatch } = store

export function pay() {
  dispatch({ type: 'PAYMENT_START' })
}

interface PaymentTransaction {
  machineId: string;
  basket: VendingMachineState['basket'];
  name: string;
  cardNumber: string;
}
export async function confirmPayment(transaction: PaymentTransaction) {
  const result = await axios.post('/vm/quantityCheckAndUpdate', transaction);

  console.log("Confirm result: ", result);
  dispatch({ type: 'PAYMENT_CONFIRM' })
}

export function cancelPayment() {
  dispatch({ type: 'PAYMENT_CANCEL' })
}