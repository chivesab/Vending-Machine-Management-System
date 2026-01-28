import axios from 'axios';
import { sum } from 'lodash';
import * as React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
} from 'reactstrap';
import { Nav } from 'react-bootstrap';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { SupplierTypes } from '../../../shared/SupplierTypes';
import { store } from '../store';

import './UpdateStockModal.scss';
import { roundToTwoDecimals } from '../../../shared/utils';

interface Props {
  machine: SupplierTypes.Machine;
  strategies: SupplierTypes.Strategies[string];
  onClose: () => void;
}

type UpdateMode = 'auto' | 'manual';

export const UpdateStockModal: React.FC<Props> = ({
  machine,
  onClose,
  strategies,
}) => {
  const [items, setItems] = React.useState(machine.items);
  const [mode, setMode] = React.useState<UpdateMode>('auto');
  const [model, setModel] = React.useState<SupplierTypes.MLModel>('lstm');
  const [strategy, setStrategy] = React.useState<
    SupplierTypes.Strategy | undefined
  >();

  const currentSales = React.useMemo(
    () => sum(machine.items.map(({ price, capacity }) => price * capacity)),
    [machine]
  );

  const onUpdate = async () => {
    const result = await axios.post('/machine/updateCapacity', {
      machineId: machine.id,
      companyId: machine.companyId,
      strategy: mode === 'auto' ? strategy : undefined,
      items,
    });
    store.dispatch({ type: 'UPDATE_MACHINE_STOCK', payload: result.data });

    onClose();
  };

  return (
    <Modal isOpen={true} className="update-stock-modal">
      <ModalHeader>Update Stock of {machine?.city}</ModalHeader>
      <ModalBody className="stock-modal-body">
        <Nav
          className="stock-modal-tab"
          fill
          variant="tabs"
          defaultActiveKey="auto"
          onSelect={(selectedKey) => setMode(selectedKey as UpdateMode)}
        >
          <Nav.Item>
            <Nav.Link eventKey="auto">Automatic</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="manual">Manual</Nav.Link>
          </Nav.Item>
        </Nav>
        {mode === 'auto' ? (
          <div className="ml-model-display">
            <Nav
              className="stock-modal-tab"
              fill
              variant="tabs"
              defaultActiveKey="auto"
              onSelect={(selectedKey) =>
                setModel(selectedKey as SupplierTypes.MLModel)
              }
            >
              <Nav.Item>
                <Nav.Link eventKey="lstm">LSTM</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="linear">Linear</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="log">Logistic</Nav.Link>
              </Nav.Item>
            </Nav>
            {Object.entries(strategies[model]).map(([s, itemInfos]) => {
              const onClick = () => {
                setStrategy(s as SupplierTypes.Strategy);
                setItems(
                  machine.items.map((item) => ({
                    ...item,
                    capacity: itemInfos[item.id],
                  }))
                );
              };

              const newSales = sum(
                machine.items.map(({ id, price }) => price * itemInfos[id])
              );
              const diffPercentage = roundToTwoDecimals(
                (newSales / currentSales - 1) * 100
              );

              return (
                <div className="strategy-option" key={s} onClick={onClick}>
                  <div className="strategy-option-text">
                    <label className="strategy-option-input">
                      <input
                        type="radio"
                        checked={s === strategy}
                        onChange={() => undefined}
                      />
                      {s}
                    </label>
                    <div
                      className={`stock-update-revenue-${diffPercentage >= 0 ? 'increase' : 'decrease'}`}
                    >
                      {diffPercentage >= 0 ? '+' : ''}
                      {diffPercentage} %
                    </div>
                  </div>
                  <StrategyDisplay
                    idToName={Object.fromEntries(
                      machine.items.map(({ id, name }) => [id, name])
                    )}
                    originalCapacities={Object.fromEntries(
                      machine.items.map(({ id, capacity }) => [id, capacity])
                    )}
                    newCapacities={itemInfos}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price (current/new)</th>
                <th>Capacity (current/new)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <MachineItem
                  key={item.id}
                  item={machine.items[index]}
                  updatedItem={item}
                  updateItem={(updatedItem) => {
                    const clone = [...items];
                    clone[index] = updatedItem;
                    setItems(clone);
                  }}
                />
              ))}
            </tbody>
          </Table>
        )}
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={onUpdate}>
          Update
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface ItemProps {
  item: SupplierTypes.Machine['items'][number];
  updatedItem: SupplierTypes.Machine['items'][number];
  updateItem: (updatedItem: SupplierTypes.Machine['items'][number]) => void;
}

const MachineItem: React.FC<ItemProps> = ({
  item,
  updatedItem,
  updateItem,
}) => {
  return (
    <tr className="machine-item-stock">
      <td>
        <div className="machine-item-stock-column">{item.name}</div>
      </td>
      <td>
        <div className="machine-item-stock-column">
          <div>{item.price}</div>
          <Input
            type="number"
            value={updatedItem.price}
            onChange={(e) => {
              const newPrice = Number(e.target.value) || updatedItem.price;
              updateItem({
                ...updatedItem,
                price: newPrice,
              });
            }}
          />
        </div>
      </td>
      <td>
        <div className="machine-item-stock-column">
          <div>{item.capacity}</div>
          <Input
            type="number"
            value={updatedItem.capacity}
            onChange={(e) => {
              const newCapacity =
                Number(e.target.value) || updatedItem.capacity;
              updateItem({
                ...updatedItem,
                capacity: newCapacity,
              });
            }}
          />
        </div>
      </td>
    </tr>
  );
};

interface StrategyDisplayProps {
  idToName: Record<string, string>;
  originalCapacities: Record<string, number>;
  newCapacities: Record<string, number>;
}

const StrategyDisplay: React.FC<StrategyDisplayProps> = ({
  idToName,
  originalCapacities,
  newCapacities,
}) => {
  return (
    <div>
      <BarChart
        width={600}
        height={400}
        data={itemsToChart(idToName, originalCapacities, newCapacities)}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={90}
          interval={0}
          tickMargin={32}
          height={80}
        />
        <YAxis />
        <Tooltip filterNull={true} />
        <Legend />
        <Bar dataKey="Original" stackId="a" fill="#8884d8" />
        <Bar dataKey="Decrease" stackId="a" fill="#DD0000" />
        <Bar dataKey="Increase" stackId="a" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};

function itemsToChart(
  idToName: Record<string, string>,
  originalCapacities: Record<string, number>,
  newCapacities: Record<string, number>
): {
  name: string;
  Increase: number | undefined;
  Decrease: number | undefined;
  Original: number;
}[] {
  const results = [];

  for (const [key, value] of Object.entries(originalCapacities)) {
    if (value > newCapacities[key]) {
      results.push({
        name: idToName[key],
        Increase: undefined,
        Decrease: value - newCapacities[key],
        Original: newCapacities[key],
      });
    } else {
      results.push({
        name: idToName[key],
        Decrease: undefined,
        Increase: newCapacities[key] - value,
        Original: value,
      });
    }
  }
  return results;
}
