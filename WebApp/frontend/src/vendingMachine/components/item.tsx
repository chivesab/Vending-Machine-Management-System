import React from 'react';
import { connect } from 'react-redux';
import { Card, CardTitle, CardText, Button } from 'reactstrap';

import { VendingTypes } from '../../../../shared/VendingTypes';
import { selectItem, removeItem, nearbyCheck } from '../actions';
import { VendingMachineState } from '../store';

import './item.scss';

const mapStateToProps = ({items}: {
  items: VendingMachineState
}) => ({
  machine: items.machine
})

interface Props {
  item: VendingTypes.Item;
  machine: VendingMachineState['machine']
}

export class ItemComponent extends React.Component<Props> {
  render() {
    const { item, machine } = this.props;
    const { id, name, price, count, quantity } = item

    return (
      <Card className="text-center item-card">
        <CardTitle>{name}</CardTitle>
        <CardText>Price: <b>${price}</b></CardText>
        {!count && renderProduct(item, machine.floor)}
        {count && renderBasket(id, count)}
      </Card>
    )
  }
}

const renderProduct = (item: VendingTypes.Item, floor: number) => {
  const { id, quantity } = item;
  const outOfStock = quantity === 0;
  return (
  <>
    <CardText>Stock: <b style={outOfStock ? {color: 'red'} : {}}>{quantity}</b></CardText>
    { outOfStock ? (
      <Button onClick={() => nearbyCheck(item, floor)}>Check Nearby Machines</Button>
    ) : (
      <Button onClick={() => selectItem(id)} disabled={!Boolean(quantity)}>Select</Button>
    )}
  </>
)}

const renderBasket = (id: string, count: number) => (
  <div>
    <CardText>Count: {count}</CardText>
    <Button onClick={() => removeItem(id)}>Remove</Button>
  </div>
)

export const Item = connect(mapStateToProps)(ItemComponent);