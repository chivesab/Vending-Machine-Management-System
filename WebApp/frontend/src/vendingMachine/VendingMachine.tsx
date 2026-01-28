import React from 'react';
import { Provider } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Vending } from './containers/VendingMain';
import { store } from './store';
import { initialLoad } from './actions';

// import vendingMachine from './vendingMachine/app/index.js';

import './VendingMachine.scss';

export const VendingMachine: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();

  initialLoad(machineId);

  return (
    <InjectionProvider store={store}>
      <Vending />
    </InjectionProvider>
  );
};

interface ButtonProps {
  text: string;
}

class InjectionProvider extends React.Component<any> {
  /**
   * Renders the [[InjectionProvider]] into the component tree.
   *
   * [[InjectionProvider#render]] simply creates a MobX 'Provider' component and supplies it with the
   * current props.
   */
  public render(): JSX.Element {
    const stores = { ...this.props };

    // Remove the 'children' because we don't want that passed around via React's Context mechanism
    delete stores.children;

    return React.createElement(Provider as any, stores, this.props.children);
  }
}
