# Save the Vending Machine

**1. Problems and Goals:**<br />
There are more than 7 million vending machines serving people in the U.S. every day, and these add up to a market more than 8 billion dollars. However, seeing the desired item being out-of-stock is one of the most disappointing moment. In fact, vending machines being out-of-stock are estimated to be at least 3% in lost sales. Therefore, having an interactive web app that helps tracking the stock information becomes crucial to improve the business.

**2. Abstract:** <br />
We will be building a web application that allows suppliers to better monitor their vending machines supplies. We will also provide several ways for suppliers to receive low stock alerts, including automatic stock updates API (for Internet connected vending machines) and a consumer updates flow that will allow consumers to upload a picture of the vending machine.

We'll also build an internal service for vending machines to talk to each other, so vending machines can better guide customers to nearby machines when it runs out of stock and the other machine still have that product in stock.

**3. Approach:** <br />

- Node.js server and MySQL DB to store stock & user information.
- React front end with different view for consumers and suppliers.
- Deploy the app on AWS

**4. Features:** <br />

- **Supplier:**
  - Manage all vending machines in one place
  - Aggregated stock and sales data to better predict future supplies
  - Integrate our API to their machines for automatically stock updates and nearby suggestion features
  - Receive notifications when stock is or will be running out of stock

- **Smart Machine:**
  - Shows all products present in that machine to the customer and customer can cllect his product after successful payment.
  - Be able to display nearby stock info directly on the machines if a requested product runs out but is available at other machines.

# Installations

## Prerequisites

- [nvm](https://nodejs.org/en/download/)
  - Make sure you update your environment variables
- node.js

  ```
  nvm install 16 // This should install v16
  ```

  - You can verify with `nvm ls` and make sure it's pointing to `v16.x.x`

- mysql

  Here we're using brew to manage and serving our mysql server. It'll

  ```shell
  brew install mysql
  brew services start mysql
  ```

## Other requirements

- Once nvm and node has been installed and you have checked out the latest version of this repo, you can simply run the following command to install all other requirements.

```
npm install
```

- To construct database and tables

```
cd backend/src/database
mysql -u root -p < vendimandb.sql
```

- To automatically populate sales data in database

```
cd backend/src/database
pip install -r requirements
python3 salesScript.py
```

# Development

## Setup

- Change the database config in `backend/database/config.json` to point to `localhost` for local development
- Change the `axios.defaults.baseURL` to `localhost:3000/api` in `frontend/client.tsx`
- The following command will compile both client and server side code and spin up a server that serve the frontend code at `localhost:3000`

```
npm run dev
```

- You should see some compiling messages in our console similar to below if everything compiles successfully:

```
Compiling client ...
Compiling server ...
client:
  3 assets
  55 modules
  client (webpack 5.61.0) compiled successfully in 6168 ms

server:
  3 assets
  29 modules
  server (webpack 5.61.0) compiled successfully in 5892 ms
Starting Node.js ...
Debugger listening on ws://127.0.0.1:9229/52509200-d710-486f-b6d5-b679ace76830
For help, see: https://nodejs.org/en/docs/inspector
Server running on http://localhost:3000
```

## Knowledge Sharing

There's also a `shared` folder that is meant for the API between front/backend. It'll be
up to the pair to decide how they want to setup the communication
