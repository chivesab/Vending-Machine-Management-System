import { cloneDeep, omit } from 'lodash';

import { VendingTypes } from '../../../../shared/VendingTypes';
import { VendingMachineState } from "../store";


const DEFAULT_VALUE: VendingMachineState = {
  machine: {
    machineId: 'dne',
    city: 'San Jose',
    floor: 0,
    machineNumber: 0,
    ownerId: 'dne'
  },
  list: [
    { id: '1', name: 'Mars', price: 3.50 },
    { id: '2', name: 'Snickers', price: 3.50 },
    { id: '3', name: 'Twix', price: 4.50 },
    { id: '4', name: 'Bounty', price: 3.50 },
    { id: '5', name: 'Tupla', price: 2.50 },
  ],
  basket: [
    { id: '1', name: 'Mars', price: 3.50, count: 1 },
    { id: '2', name: 'Snickers', price: 3.50, count: 2 },
    { id: '3', name: 'Twix', price: 4.50, count: 1 },
  ],
  modal: false, 
  nearby: undefined
};

type ItemActions = {
  type: 'SELECT_ITEM' | 'REMOVE_ITEM';
  payload: string;
} | {
  type: 'INITIAL_LOAD';
  payload: VendingTypes.Machine;
} | {
  type: 'NEARBY_CHECK';
  payload: {
    nearbyMachines: VendingTypes.NearbyMachine[];
    item: VendingTypes.Item
  }
} | {
  type: 'PAYMENT_START' | 'PAYMENT_CANCEL' | 'PAYMENT_CONFIRM'
} ; 

export function reducer(state: VendingMachineState | undefined, action:ItemActions) {
  let newState: VendingMachineState;
  if (!state) {
    state = DEFAULT_VALUE;
  }

  switch (action.type) {
    case 'SELECT_ITEM':
      newState = cloneDeep(state);

      // Check if item is already in a basket
      let basketIndex = newState.basket.map(function(e: any) { return e.id }).indexOf(action.payload)
      let listIndex = newState.list.map(function(e: any) { return e.id }).indexOf(action.payload)

      const { quantity } = newState.list[listIndex];

      // No quantity or quantity === 0
      if (!quantity) {
        break;
      }
      if (basketIndex !== -1) {
        const oldCount = newState.basket[basketIndex].count;
        newState.basket[basketIndex].count = oldCount ? oldCount + 1 : 1;
      } else {
        // Check the index of an item
        let listIndex = newState.list.map(function(e: any) { return e.id }).indexOf(action.payload)
        newState.basket.push({ ...newState.list[listIndex], count: 1 })
      }
      newState.list[listIndex].quantity! -= 1;
      break

    case 'REMOVE_ITEM':
      newState = cloneDeep(state);
      let index = newState.basket.map(function(e: any) { return e.id }).indexOf(action.payload)
      const item = newState.basket.splice(index, 1)[0];
      const removedItemIndex = newState.list.map(function(e: any) { return e.id }).indexOf(action.payload)
      newState.list[removedItemIndex].quantity = 
        (newState.list[removedItemIndex].quantity || 0) + 
        (item.count || 0);

      break

    case 'PAYMENT_START':
      newState = { ...state, modal: true }
      break

    case 'PAYMENT_CANCEL':
      newState = { ...state, modal: false }
      break

    case 'PAYMENT_CONFIRM':
      newState = { ...state, basket: [], modal: false }
      break

    case 'INITIAL_LOAD':
      const machine = action.payload;
      let localStore: any;
      if (typeof window !== 'undefined') {
        localStore = localStorage.getItem('items');
      }

      const basket = localStore && localStore['basket'] || [] 

      newState = {
        machine: omit(machine, 'items'),
        list: machine.items,
        basket,
        modal: false, 
        nearby: undefined
      }
      break;
    case 'NEARBY_CHECK':
      newState = {
        ...state,
        nearby: {
          product: action.payload.item,
          machines: action.payload.nearbyMachines
        }
      }
      break;
    default:
      let history;
      if (typeof window !== 'undefined') {
        history = localStorage.getItem('items');
      }


      newState = (history == null) ? DEFAULT_VALUE : { ...DEFAULT_VALUE, ...JSON.parse(history) }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('items', JSON.stringify(newState))
  }

  return newState
} 