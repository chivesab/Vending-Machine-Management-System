import axios from 'axios';
import * as bcrypt from 'bcryptjs';
import * as React from 'react';

import { LoadingAnimation } from './components/LoadingAnimation';

export const DEFAULT_SALT = '$2a$10$IRT6YFZeuO6wED1iTwvJQe';

interface Auth {
  authed: boolean;
  login: (detail: LoginInfo) => Promise<boolean>;
  logout: () => void;
}

export interface LoginInfo {
  email: string;
  password: string;
}

interface AuthContext {
  authed: boolean;
  login: (details: LoginInfo) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthenticated: () => Promise<void>;
}

const authContext = React.createContext<AuthContext>({
  authed: false,
  login: async () => {
    return false;
  },
  logout: async () => {},
  checkAuthenticated: async () => {},
});

function useAuth(): AuthContext {
  const [authed, setAuthed] = React.useState(false);

  return {
    authed,
    login: async ({ email, password }) => {
      try {
        const authenticateResult = await axios.post('/login', {
          email,
          password: hashPassword(password),
        });
        if (authenticateResult) {
          setAuthed(true);
          return true;
        }
        return false;
      } catch (err) {
        setAuthed(false);
        return false;
      }
    },
    logout: async () => {
      console.log('setAuthed to false');
      setAuthed(false);
      await axios.get('/logout');
    },
    checkAuthenticated: async () => {
      console.log('checkAuthenticated');
      try {
        const authed = await axios.get('/authenticated');
        setAuthed(authed.status === 200);
      } catch (err) {
        setAuthed(false);
      }
    },
  };
}

export const AuthProvider: React.FC = ({ children }) => {
  const auth = useAuth();
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    async function checkAuthed() {
      try {
        await auth.checkAuthenticated();
        setAuthChecked(true);
      } catch (err) {
        console.error(err);
        setAuthChecked(false);
      }
    }

    checkAuthed();
  });

  return authChecked ? (
    <authContext.Provider value={auth}>{children}</authContext.Provider>
  ) : (
    <LoadingAnimation />
  );
};

export function AuthConsumer() {
  return React.useContext(authContext);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, DEFAULT_SALT);
}
