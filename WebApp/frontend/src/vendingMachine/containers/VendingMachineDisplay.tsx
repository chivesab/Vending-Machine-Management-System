import * as React from 'react';

import { VendingMachineState } from '../store';

import './VendingMachineDisplay.scss';

interface Props {
  nearby: VendingMachineState['nearby'];
}



export const VendingMachineDisplay: React.FC<Props> = ({nearby}) => {
  return !nearby ? null : (
    <>
      <h4>Nearby info for: {nearby.product.name}</h4>
      <table className="vending-machine-display-table">
        <thead>
          <tr >
            <td>Floor</td>
            <td>Machine Number</td>
          </tr>
        </thead>
        <tbody>
          {nearby.machines.map(({machine_number, floor}) => (
            <tr key={`${machine_number}${floor}`}>
              <td>
                {floor}
              </td>
              <td>
                {machine_number}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}



