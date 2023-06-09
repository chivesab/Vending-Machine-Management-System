import Button from '@mui/material/Button'
import {MuseumTwoTone} from "@mui/icons-material";
import * as React from 'react';
import { Redirect } from 'react-router';

import { AuthConsumer } from './AuthContext';
import {Homepage} from "./auth/Homepage";
import { SupplierLoginForm } from './auth/LoginForm/SupplierLoginForm';
import { SupplierSignUpForm } from './auth/SignUpForm/SupplierSignUpForm'

import './Supplier.scss';

export const Supplier: React.FC = () => {
  const { authed } = AuthConsumer();

  const [login, setLogin] = React.useState(false);
  const [signUp, setSignUp] = React.useState(false);
  return authed ? (
    <Redirect to='/dashboard'/>
  ) : (
    <div className="main">
      <div className="top-toolbar">
        <div className="logo-top">
          <MuseumTwoTone fontSize="large"/>
          VMMS
        </div>
        <Button variant="outlined" onClick={() => setLogin(!login)}>{login ? 'Home' : 'Sign In'}</Button>
      </div>
      <div className="after-top-toolbar">
        { login ? (
          <div className="authentication-page">
            { signUp ?
              (<SupplierSignUpForm toLogin={() => setSignUp(false)}/>) :
              (<SupplierLoginForm toSignUp={() => setSignUp(true)} />)
            }
          </div>
        ) : (
          <Homepage/>
        )
        }
      </div>
    </div>
  );
}