import * as uuid from 'uuid';
import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';

import { connection } from '../database/Connection';
import { SupplierTypes } from '../../../shared/SupplierTypes';

type User = SupplierTypes.User;

const DEFAULT_COMPANY_ID = 'c37c3316-1b7d-4345-a915-f94b9db9a8f5';

class UserModel {
  async addUser(
    email: string,
    password: string,
    name: string,
    companyId: string = DEFAULT_COMPANY_ID,
    role = 'user'
  ): Promise<User | undefined> {
    const conn = await connection;
    const newUserId = uuid.v4();

    await conn.query(
      `INSERT INTO owner (id, email, password, name, company_id, role) 
       VALUES ('${newUserId}','${email}', '${password}', '${name}', '${companyId}', '${role}')`
    );
    return this.getUser(newUserId);
  }

  async getUser(id: string): Promise<User | undefined> {
    const conn = await connection;
    const user = await conn.query(
      `SELECT id, email, name, role, company_id FROM owner WHERE id='${id}'`
    );
    if (user.length === 0) {
      return undefined;
    }
    return {
      ...user[0],
      companyId: user[0].company_id,
    };
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<User | undefined> {
    const conn = await connection;
    const user = await conn.query(`
      SELECT id, email, password, name, role
      FROM owner 
      WHERE email='${email}'`);
    if (user.length === 0) {
      return undefined;
    }
    const result = await bcrypt.compare(password, user[0].password);
    console.log('Authenticate Result: ', result);
    if (result) {
      return _.omit(user[0], 'password') as any;
    }
    return undefined;
  }
}

// async function ensureUserDatabase() {
//   const connection = await mysql.createConnection(dbConfig);

//   await connection.query('CREATE DATABASE IF NOT EXISTS user');
//   await connection.changeUser({ 'database': 'user' });

//   await connection.query(
//     `CREATE TABLE IF NOT EXISTS owner(
//       id varchar(255) primary key,
//       email varchar(255) not null,
//       password varchar(255) not null,
//       name varchar(255) not null,
//       UNIQUE (email)
//     )`
//   );

//   return connection;
// }

export const userModel = new UserModel();
