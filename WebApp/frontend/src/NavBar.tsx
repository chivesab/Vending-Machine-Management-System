import * as React from 'react';
import { Provider } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { initialLoad } from './actions/machine';

import { AuthConsumer } from './AuthContext';
import { Dashboard } from './dashboard/Dashboard';
import { Machines } from './machines/Machines';

import './NavBar.scss';
import { store } from './store';
import { MuseumTwoTone } from '@mui/icons-material';
import Button from '@mui/material/Button';

type NavItem = 'dashboard' | 'machines' | 'stocks';

export const NavBar: React.FC = () => {
  const { logout } = AuthConsumer();
  const { page } = useParams<{ page: NavItem }>();
  initialLoad();

  return (
    <Provider store={store}>
      <div className="main">
        <div className="top-toolbar">
          <div className="nav-logo-and-links">
            <div className="logo-top">
              <MuseumTwoTone fontSize="large" />
              VMMS
            </div>
            <div className="navigation-links">
              <Link className="navigation-item" to="/dashboard">
                Dashboard
              </Link>
              <Link className="navigation-item" to="/machines">
                Machines
              </Link>
            </div>
          </div>
          <Button variant="outlined" onClick={logout}>
            Log Out
          </Button>
        </div>
        <div className="main-page after-top-toolbar">
          {renderComponent(page)}
        </div>
      </div>
    </Provider>
  );
};

const renderComponent = (type: NavItem) => {
  switch (type) {
    case 'dashboard':
      return <Dashboard />;
    case 'machines':
      return <Machines />;
    case 'stocks':
    default:
      'Wrong nav item type';
  }
};
