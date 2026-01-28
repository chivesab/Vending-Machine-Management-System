import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

import { Supplier } from './src/Supplier';
import { VendingMachine } from './src/vendingMachine/VendingMachine';
import { AuthConsumer, AuthProvider } from './src/AuthContext';
import { NavBar } from './src/NavBar';
import { VendingMachineList } from './src/vendingMachine/VendingMachineList';

import './src/app.scss';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Route exact path="/">
        <Supplier />
      </Route>
      <RequireAuth>
        <Route path="/allmachines">
          <VendingMachineList />
        </Route>
        <Route path="/vending/:machineId?">
          <VendingMachine />
        </Route>
        <Route exact={true} path="/:page">
          <NavBar />
        </Route>
      </RequireAuth>
    </AuthProvider>
  );
};

const RequireAuth: React.FC = ({ children }) => {
  const { authed } = AuthConsumer();
  return authed === true ? <>{children}</> : <Redirect to="/" />;
};
