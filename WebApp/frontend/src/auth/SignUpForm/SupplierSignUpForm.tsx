import axios from 'axios';
import * as bcrypt from 'bcryptjs';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import { Redirect } from 'react-router';

import { DEFAULT_SALT_ROUNDS } from '../../../../shared/SupplierTypes';
import { AuthConsumer as useAuth } from '../../AuthContext';

interface Props {
  toLogin: () => void;
}

interface SignUpInfo {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SupplierSignUpForm: React.FC<Props> = ({ toLogin }) => {
  const [details, setDetails] = useState<SignUpInfo>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const { login } = useAuth();

  const signUp = React.useCallback(async () => {
    setSending(true);
    console.log(details);
    const { name, email, password, confirmPassword } = details;
    if (name.length == 0) {
      setError('Name is required');
    } else if (email.length == 0) {
      setError('Email is required');
    } else if (password.length == 0) {
      setError('Password is required');
    } else if (confirmPassword.length == 0) {
      setError('Please enter password again');
    } else if (password != confirmPassword) {
      setError('Password does not match');
    } else {
      const passwordHash = await bcrypt.hash(password, DEFAULT_SALT_ROUNDS);
      try {
        const signupResult = await axios.post('/signup', {
          email,
          password: passwordHash,
          name,
        });

        console.log('Signup result: ', signupResult.status);

        await login({ email, password });
        setRedirect(true);
      } catch (error) {
        setError('Email already exist');
      }
    }

    setSending(false);
  }, [details, setError]);

  return redirect ? (
    <Redirect to="/dashboard" />
  ) : (
    <form className="login-signup-form">
      <div className="form-inner">
        <h2>SignUp</h2>
        <div className="form-group inputStyle">
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            name="name"
            id="name"
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            value={details.name}
          />
        </div>
        <div className="form-group inputStyle">
          <label htmlFor="email">Email: </label>
          <input
            type="text"
            name="email"
            id="email"
            onChange={(e) => setDetails({ ...details, email: e.target.value })}
            value={details.email}
          />
        </div>
        <div className="form-group inputStyle">
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            name="password"
            id="password"
            onChange={(e) =>
              setDetails({ ...details, password: e.target.value })
            }
            value={details.password}
          />
        </div>
        <div className="form-group inputStyle">
          <label htmlFor="password">Confirm Password: </label>
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            onChange={(e) =>
              setDetails({ ...details, confirmPassword: e.target.value })
            }
            value={details.confirmPassword}
          />
        </div>
        {error != '' && <div className="login-error">{error}</div>}
        <div></div>
        <div className="login-form-buttons">
          <Button variant="outlined" onClick={toLogin} disabled={sending}>
            Login
          </Button>
          <Button variant="contained" onClick={signUp} disabled={sending}>
            Sign Up
          </Button>
        </div>
      </div>
    </form>
  );
};
