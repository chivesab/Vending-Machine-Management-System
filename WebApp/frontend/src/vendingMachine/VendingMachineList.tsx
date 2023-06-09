import axios from 'axios';
import * as React from 'react';
import { Link } from 'react-router-dom';

import {LoadingAnimation} from "../components/LoadingAnimation";

export const VendingMachineList: React.FC = () => {
  const [machineIds, setMachineIdes] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    const fetchAllIds = async () => {
      if (machineIds === undefined) {
        const response = await axios.get('/vm/all');
  
        setMachineIdes(response.data);
      }
    } 
    fetchAllIds();
  }, []);


  return machineIds === undefined? (
    <LoadingAnimation/>
  ) : (
    <div>
      {machineIds.map((machineId) => (
        <div  key={machineId}>
          <Link to={`/vending/${machineId}`}>{machineId}</Link>
        </div>
      ))}
    </div>
  )
}