import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as _ from 'lodash';

import { SupplierTypes } from '../../../shared/SupplierTypes';

import './SalesChart.scss';


interface Props {
  items: SupplierTypes.Sales['items'];
}




export const SalesByItemChart: React.FC<Props> = ({ items }) => {
  const sortedItems = _.sortBy(items, ({ sales }) => sales).reverse();

  return (
    <div className="machine-daily-sales">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={sortedItems}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3"  className="chartGrid"/>
          <XAxis dataKey="name" tick={false}/>
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" />
          <Bar dataKey="transactions" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const generateRandomColorCode = () => Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
