import * as React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DataTable, { TableColumn } from 'react-data-table-component';
import { SupplierTypes } from '../../../shared/SupplierTypes';

import './TransactionTable.scss';

interface Props {
  transactions: SupplierTypes.Transaction[];
}

const columns: TableColumn<SupplierTypes.Transaction>[] = [
  {
    name: 'id',
    selector: (row) => row.id,
    sortable: true,
  },
  {
    name: 'Machine ID',
    selector: (row) => row.machineId,
  },
  {
    name: 'Items',
    selector: (row) =>
      row.items
        .map((a) => {
          return a.name + '($' + a.unitPrice + ') * ' + a.quantity;
        })
        .join(),
    sortable: true,
  },
  {
    name: 'Price',
    selector: (row) => '$' + row.totalPrice,
    sortable: true,
  },
  {
    name: 'Time',
    id: 'time',
    selector: (row) => String(row.timestamp),
    sortable: true,
  },
];

export const TransactionTable: React.FC<Props> = ({ transactions }) => {
  return (
    <>
      <DataTable columns={columns} data={transactions} pagination />
    </>
  );
};
