import axios from 'axios';

import { store } from '../store';

const { dispatch } = store

export async function initialLoad() {
  const machine = await axios.get('/initialLoad');
  console.log("Action initialLoad:", machine);
  dispatch({type: 'INITIAL_LOAD', payload: machine.data});
}