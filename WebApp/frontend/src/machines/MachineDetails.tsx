import * as React from 'react';
import {useSelector} from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { SupplierTypes } from '../../../shared/SupplierTypes';
import {SalesChart} from "../dashboard/SalesChart";

interface Props {
  data: SupplierTypes.Machine;
}

export const MachineDetails: React.FC<Props> = ({data: machine}) => {
  const { id } = machine;
  const sales = useSelector<any, SupplierTypes.Sales>(({ sales }) => sales);

  const machineSales = React.useMemo<SupplierTypes.Sales['daily']>(() =>
    sales.daily.map((d) => filterMachineFromDaily(d, id))
  , [sales]);

  return (
    <div className="machine-details">
      <div className="machine-detail-charts">
        <div className="stock-info-chart">
          <BarChart
            width={600}
            height={400}
            data={itemsToChart(machine.items)}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={90} interval={0} tickMargin={32} height={80} />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{bottom: "-16px"}}/>
            <Bar dataKey="Stock" stackId="a" fill="#8884d8" />
            <Bar dataKey="Empty space" stackId="a" fill="#82ca9d" />
          </BarChart>
        </div>
        <SalesChart daily={machineSales} showLegend={false}/>
      </div>
      <div className="machine-detail-stock-info">

      </div>
    </div>
  )
}

const itemsToChart = (items: SupplierTypes.Machine['items']) => {
  return items.map(({name, capacity, quantity}) => ({
    name,
    Stock: quantity,
    'Empty space': capacity-quantity
  }))
}

const filterMachineFromDaily = (daily: SupplierTypes.Sales['daily'][number], machineId: string):
  SupplierTypes.Sales['daily'][number] => {
  const machineDaily = daily.machines.find(({machineId: mId}) => mId === machineId);

  return {
    ...daily,
    machines: machineDaily ? [machineDaily] : []
  }
}
