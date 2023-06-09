import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { VendingTypes } from '../../../shared/VendingTypes';


import { itemsReducer  } from './reducers';

export const store = configureStore({
  reducer: {
    items: itemsReducer
  },
});

export interface VendingMachineState {
  machine: Omit<VendingTypes.Machine, 'items'>;
  list: VendingTypes.Item[]
  basket: VendingTypes.Item[];
  modal: boolean;
  nearby: {
    product: VendingTypes.Item;
    machines: VendingTypes.NearbyMachine[]
  } | undefined;
}

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string> 
>;
