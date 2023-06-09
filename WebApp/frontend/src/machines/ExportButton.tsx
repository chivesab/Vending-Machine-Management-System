import * as _ from 'lodash';
import Button from '@mui/material/Button'
import * as React from 'react';

import { SupplierTypes } from '../../../shared/SupplierTypes';



export const ExportButton: React.FC<{
  onExport: () => void
}> = ({ onExport }) =>
	<Button
		className="export-machines-button"
		variant="outlined"
		onClick={onExport}
	>
		Export
	</Button>;


type TableMachine = Pick<SupplierTypes.Machine, 'machineNumber' | 'sales'>  &
{
	floor: string;
  stockLevel: string;
  [key: string]: any;
}

// Blatant "inspiration" from https://codepen.io/Jacqueline34/pen/pyVoWr
function convertArrayOfObjectsToCSV(data: TableMachine[]) {
	let result = '';

	const columnDelimiter = ',';
	const lineDelimiter = '\n';
  const keys = Object.keys(data[0]);

	result = '';
	result += keys.join(columnDelimiter);
	result += lineDelimiter;

	data.forEach(item => {
		let ctr = 0;
    Object.values(item).forEach(value => {
			if (ctr > 0) result += columnDelimiter;

			result += value;
			
			ctr++;
		});
		result += lineDelimiter;
	});

	return result;
}

// Blatant "inspiration" from https://codepen.io/Jacqueline34/pen/pyVoWr
export function downloadCSV(array: SupplierTypes.Machine[]) {
	const convertedArray = machinesToTable(array);

	const link = document.createElement('a');
	let csv = convertArrayOfObjectsToCSV(convertedArray);
	if (csv == null) return;

	const filename = 'export.csv';

	if (!csv.match(/^data:text\/csv/i)) {
		csv = `data:text/csv;charset=utf-8,${csv}`;
	}

	link.setAttribute('href', encodeURI(csv));
	link.setAttribute('download', filename);
	link.click();
}

function machinesToTable(machines: SupplierTypes.Machine[]): TableMachine[] {
  const allItemNames = Array.from(new Set(_.flatMap(machines, ({items}) => items.map(({name}) => name))));

  const machineTable =  machines.map(({floor, machineNumber, sales, items}): TableMachine => ({
    floor: floor.toString(),
		machineNumber,
    sales, 
    stockLevel: getStockLevel(items),
    ...itemsToTable(items, allItemNames)
  }));

	machineTable.push({
		floor: 'Total',
		machineNumber: 0,
		sales: machineTable.reduce((prev, {sales}) => prev+sales,0),
		stockLevel: `${0}`,
		...allItemNames.reduce((prev, name) => {
			return {
				...prev,
				[name]: machineTable.reduce((prev, row) => prev+row[name],0)
			}
		}, {})
	});
	return machineTable;
}

function itemsToTable(items: SupplierTypes.Machine['items'], allKeys: string[]): TableMachine['items'] {
	const itemsMap = _.keyBy(items, 'name');
	return allKeys.reduce((prev, name) => {
		const selectedItem = itemsMap[name];
		return ({
		...prev,
		[name]: selectedItem ? selectedItem.capacity-selectedItem.quantity : 0
	})}, {});
}

export function getStockLevel(items: SupplierTypes.Machine['items']): string {
  return ((_.sumBy(items, ({quantity}) => quantity) /_.sumBy(items, ({capacity}) => capacity))*100  || 0).toFixed(2);
}