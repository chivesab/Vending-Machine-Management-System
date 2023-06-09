import { Wrapper, Status } from '@googlemaps/react-wrapper';
import * as React from 'react';
import { useSelector } from 'react-redux';
import DataTable, { TableColumn } from 'react-data-table-component';

import { SupplierTypes } from '../../../shared/SupplierTypes';
import {LoadingAnimation} from "../components/LoadingAnimation";
import { ExportButton, downloadCSV, getStockLevel } from './ExportButton';
import { MachineDetails } from './MachineDetails';

import './Machines.scss';
import {MachineMap} from "./MachineMap";
import Button from "@mui/material/Button";
import {UpdateStockModal} from "./UpdateStockModal";
import {SupplierState} from "../store";

type ViewType = 'list' | 'map';

const columns: (onButtonClick: (machine: SupplierTypes.Machine) => void) => TableColumn<SupplierTypes.Machine>[] =
  (onButtonClick) => [
  {
    name: 'City',
    selector: row => row.city,
    sortable: true
  },
  {
    name: 'Longitude',
    selector: row => row.location.longitude,
    sortable: true
  },
  {
    name: 'Latitude',
    selector: row => row.location.latitude,
    sortable: true
  },
  {
    name: 'Stock Level %',
    selector: row => getStockLevel(row.items),
    sortable: true
  },
  {
    name: 'Sales (last 30 days) $',
    selector: row => row.sales,
    sortable: true
  },
  {
    cell:(row) => <Button variant="outlined" onClick={() => onButtonClick(row)} >Update Stock</Button>,
    ignoreRowClick: true,
    allowOverflow: true,
    minWidth: "180px",
    button: true,
  },
];

export const Machines: React.FC = () => {
  const strategies = useSelector<SupplierState, SupplierTypes.Strategies>(
    ({ strategies }) => strategies
  );
  const machines = useSelector<any, SupplierTypes.Machine[]>(({ machines }) => machines);
  const [viewType, setViewType] = React.useState<ViewType>('list');
  const [selectedMachine, setSelectedMachine] = React.useState<SupplierTypes.Machine | undefined>(undefined);

  const render = (status: Status) => {
    return <h1>{status}</h1>;
  };

  return (<ErrorBoundary>
    {!machines || machines.length === 0 ? (
      <LoadingAnimation />
    ) : (
      <div className="machines">
        <Wrapper
          apiKey='AIzaSyDQWsgRwqTh__7Egv6mpvAuFizQZbj3UVs'
          language='en'
          libraries={['places', 'geometry']}
          render={render}
        >
          {viewType === 'list' ? (
            <div className="machine-data-table">
              <DataTable
                columns={columns(setSelectedMachine)}
                data={machines}
                actions={[(<ExportButton key={1} onExport={() => downloadCSV(machines)}/>),
                  (<Button key={0} variant="outlined" onClick={() => setViewType('map')}>Map</Button>)]}
                expandableRows={true}
                expandableRowsComponent={MachineDetails}
                pagination
              />
            </div>
          ) : (
            <div>
              <div className="machines-view-switch">
                <Button variant="outlined" onClick={() => setViewType('list')}>List</Button>
              </div>
              <MachineMap machines={machines}/>
            </div>
          )}
        </Wrapper>
        { selectedMachine && (
          <UpdateStockModal
            machine={selectedMachine}
            strategies={strategies[selectedMachine.id]}
            onClose={() => setSelectedMachine(undefined)}/>
        )}
      </div>
    )}
  </ErrorBoundary>);
}

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}