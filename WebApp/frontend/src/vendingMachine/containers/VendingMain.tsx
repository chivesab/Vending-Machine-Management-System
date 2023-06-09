import React from 'react'
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, InputGroup } from 'reactstrap'
import { connect } from 'react-redux'


import { VendingTypes } from '../../../../shared/VendingTypes';
import { Items } from '../components/items';
import { pay, confirmPayment, cancelPayment } from '../actions';
import { VendingMachineState } from '../store';
import { VendingMachineDisplay } from './VendingMachineDisplay';

type Props = Omit<VendingMachineState, 'list'> & {
  items: VendingTypes.Item[];
}

const mapStateToProps = ({ items }: {
  items: VendingMachineState
}) => ({
  items: items.list,
  basket: items.basket,
  modal: items.modal,
  machine: items.machine,
  nearby: items.nearby
})

class VendingMain extends React.Component<Props> {
  state = { modal: false }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    const { items, basket, modal, machine, nearby } = this.props

    let totalAmount = basket.reduce((acc, item) => { return acc + item.price * (item.count ?? 0) }, 0) 

    return (
      <Container>
        <h1 className="text-center mt-5">Vending Machine {machine.city}</h1>
        <Row className="my-5">
          <Col md={8} className="border py-2">
            <h2 className="text-center">Items list</h2>
            <Items items={items} />
          </Col>
          <Col md={4} className="machine-sidebar border py-2">
            <div className="basket border">
              <h2 className="text-center">Basket</h2>
              <Items items={basket} />
              <p className="text-center">Total: <b>${totalAmount}</b></p>
              <Button color="success" onClick={pay} disabled={basket.length === 0}>Pay</Button>
            </div>
            <div className="border machine-display">
              <h2 className="text-center">Display</h2>
              <VendingMachineDisplay nearby={nearby} />
            </div>
          </Col>
        </Row>
        {basket && (
          <ConfirmPaymentModal 
            isOpen={modal} 
            totalAmount={totalAmount} 
            machineId={machine.machineId}
            basket={basket}
          />)}
      </Container>
    )
  }
}

interface ModalProps {
  isOpen: boolean;
  totalAmount: number;
  machineId: string;
  basket: VendingTypes.Item[];
}

const ConfirmPaymentModal: React.FC<ModalProps> = ({ isOpen, totalAmount, machineId, basket }) => {
  const [name, setName] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');

  return (<Modal isOpen={isOpen} toggle={cancelPayment} onOpened={() => document.getElementById('#payment-name')?.focus()}>
    <ModalHeader toggle={cancelPayment}>Payment provider</ModalHeader>
    <ModalBody className="payment-modal-body">
      Please confirm your payment of <b>${totalAmount}</b>.
      <InputGroup>
        <Input 
          placeholder="Name" 
          type='text' 
          name='name' 
          onChange={(e) => setName(e.target.value)} 
          id='payment-name' 
          value={name}
        />
      </InputGroup>
      <InputGroup>
        <Input 
          placeholder="Credit card number" 
          type='text' 
          name='cardNumber' 
          onChange={(e) => setCardNumber(e.target.value)} 
          id='card-number'
          value={cardNumber}
          />
      </InputGroup>
    </ModalBody>
    <ModalFooter>
      <Button 
        color="success" 
        onClick={async () => {

          await confirmPayment({machineId, basket, name, cardNumber});
          setName('')
          setCardNumber('');
        }} 
        disabled={name.length === 0 || cardNumber.length === 0}
      >Confirm</Button>
      {' '}
      <Button onClick={cancelPayment}>Cancel</Button>
    </ModalFooter>
  </Modal>)
}



export const Vending = connect(mapStateToProps)(VendingMain);