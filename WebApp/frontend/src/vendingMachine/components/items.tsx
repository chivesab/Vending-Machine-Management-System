import React from 'react'
import { CardColumns } from 'reactstrap'

import { VendingTypes } from '../../../../shared/VendingTypes'
import { Item } from './item';

import './items.scss';

interface Props {
  items: VendingTypes.Item[]
}

export class Items extends React.Component<Props> {
  render () {
    const { items } = this.props

    return (
      <CardColumns className='card-columns'>
        { items.map((item, index) => { return <Item item={ item } key={ index } /> })}
      </CardColumns>
    )
  }
}