const mysql = require('promise-mysql');
const uuid = require('uuid');
const csv = require('fast-csv');
const fs = require('fs');
const _ = require('lodash');

const constants = require('./config.json');

const CURRENT_YEAR = 2022;
const COMPANY_ID = 'c37c3316-1b7d-4345-a915-f94b9db9a8f5';
const ADJUSTMENT_FACTOR = 0.05;

const ITEM_KEY_TO_NAME = {
  'kinder-cola_can': 'Lemonade',
  'kinder-cola_glass': 'Pop-Tarts',
  'kinder-cola_plastic': 'Water',
  'adult-cola_can': 'Clif Bar',
  'adult-cola_glass': 'Red Bull',
  'adult-cola_plastic': 'Iced Tea',
  'orange-power_can': 'Pepsi',
  'orange-power_glass': 'Dr. Pepper',
  'orange-power_plastic': 'Diet Coke',
  gazoza_can: 'Coke',
  gazoza_glass: 'Coffee',
  gazoza_plastic: 'Snickers',
  'lemon-boost_can': 'Sprite',
  'lemon-boost_glass': 'Sun Chips',
  'lemon-boost_plastic': 'Seltzer',
};

const connection = mysql.createConnection({
  host: constants.DB.host,
  user: constants.DB.username,
  password: constants.DB.password,
  port: constants.DB.port,
  database: constants.DB.database,
});

const rows = [];

fs.createReadStream('test.csv')
  .pipe(csv.parse({ headers: true }))
  .on('error', (error) => console.error(error))
  .on('data', (row) => rows.push(row))
  .on('end', async (rowCount) => {
    console.log(`Parsed ${rowCount} rows.`);
    await saveToDB(rows);
    return;
  });

async function saveToDB(rows) {
  const conn = await connection;
  const salesByMachines = _.groupBy(rows, ({ shop }) => shop);
  console.log(`Found ${Object.keys(salesByMachines).length} machines.`);

  let machineCounter = 0;
  const items = {};
  const machineItems = {};

  for (const value of Object.values(salesByMachines)) {
    const sampleMachine = value[0];
    const machineId = uuid.v4();
    await conn.query(
      ' \
    INSERT INTO vending_machines (id, name, floor, machine_number, company_id, longitude, latitude, city) \
        VALUES (?, ?, ?, ?, ?, ?, ?, ?) \
    ',
      [
        machineId,
        sampleMachine.shop,
        getRandomInt(5) + 1,
        getRandomInt(5) + 1,
        COMPANY_ID,
        Number(sampleMachine.long),
        Number(sampleMachine.lat),
        sampleMachine.city,
      ]
    );

    const salesByDate = _.groupBy(value, ({ date }) => date);

    machineItems[machineId] = {};

    for (const [dateString, sales] of Object.entries(salesByDate)) {
      const dateStrings = dateString.split('/');
      const date = new Date(
        CURRENT_YEAR,
        Number(dateStrings[1]) - 1,
        Number(dateStrings[0])
      );

      if (date.getMonth() !== 10) {
        continue;
      }

      for (const itemSale of sales) {
        const itemKey = getItemKey(itemSale);

        // Insert item for the first time
        if (!(itemKey in items)) {
          const newItemId = uuid.v4();
          const size =
            itemSale.capacity === '1.5lt'
              ? 1500
              : itemSale.capacity === '500ml'
                ? 500
                : 330;

          if (!ITEM_KEY_TO_NAME[itemKey]) {
            throw new Error(itemKey);
          }

          await conn.query(
            '  \
            INSERT INTO items (id, name, itemKey, size, container) \
              VALUES (?, ?, ?, ?, ?)\
          ',
            [
              newItemId,
              ITEM_KEY_TO_NAME[itemKey],
              itemKey,
              size,
              itemSale.container.trim(),
            ]
          );

          items[itemKey] = newItemId;
        }
        const itemId = items[itemKey];
        const unitPrice = Number(itemSale.price);
        const totalSale = Number(itemSale.quantity);

        const itemCapacity = totalSale / 30;
        // insert machine_item for the first time
        if (!(itemId in machineItems[machineId])) {
          await conn.query(
            ' \
            INSERT INTO machine_items (machine_id, item_id, unit_price, quantity, capacity)\
              VALUES (?,?,?,?,?) \
            ',
            [
              machineId,
              itemId,
              unitPrice,
              getRandomInt(itemCapacity),
              itemCapacity,
            ]
          );

          machineItems[machineId][itemId] = totalSale;
        } else {
          machineItems[machineId][itemId] += totalSale;
        }

        let paymentCount = 0;

        for (let [d, numOfSales] of getDistribution(
          date,
          totalSale,
          getMachineDistribution(machineCounter)
        )) {
          const payments = [];
          const paymentItems = [];
          let saleCounter = 0;
          while (saleCounter < numOfSales) {
            const paymentId = uuid.v4();
            const numOfItems = getNumOfItemInSingleSale();
            payments.push(
              `("${paymentId}", ${numOfItems * unitPrice}, "${getCardNumber()}", "${getMySQLDate(d)}", "${machineId}")`
            );
            paymentItems.push(
              `("${paymentId}","${itemId}",${unitPrice},${numOfItems})`
            );
            saleCounter += numOfItems;
          }

          await conn.query(` \
            INSERT INTO payments (payment_id, price, credit_card_number, p_time, machine_id) \
              VALUES ${payments.join(',')} \
          `);

          await conn.query(` \ 
            INSERT INTO payment_item(payment_id, item_id, unit_price, quantity) \
              VALUES ${paymentItems.join(',')} 
          `);

          paymentCount += payments.length;
        }
      }
    }

    machineCounter++;
  }

  await conn.destroy();
}

function getDaysInMonth(date) {
  const lastDate = new Date(date.getYear(), date.getMonth() + 1, 0);
  return lastDate.getDate();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getMachineDistribution(counter) {
  return counter % 3 === 0
    ? 'weekday'
    : counter % 3 === 1
      ? 'weekend'
      : 'normal';
}

const SALES_DISTRIBUTION = {
  weekday: {
    weekday: 1.8,
    weekend: 0.5,
  },
  weekend: {
    weekday: 0.6,
    weekend: 3.5,
  },
  normal: {
    weekday: 1 / 7,
    weekend: 1 / 7,
  },
};

/**
 * weekday = 1.8 vs 0.5
 * weekend = 0.6 vs 3.5
 * normal = 1/7
 */
function getDistribution(date, quantity, type) {
  const daysInMonth = date.getDate();
  const results = [];

  const base = (quantity / daysInMonth) * ADJUSTMENT_FACTOR;

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(CURRENT_YEAR, date.getMonth(), i);
    const weight =
      d.getDay() === 0 || d.getDay() === 6
        ? SALES_DISTRIBUTION[type].weekend
        : SALES_DISTRIBUTION[type].weekday;
    results.push([d, Math.ceil(base * weight * (Math.random() * 0.6 + 0.7))]);
  }
  return results;
}

function getMySQLDate(date) {
  return (
    date.getUTCFullYear() +
    '-' +
    ('00' + (date.getUTCMonth() + 1)).slice(-2) +
    '-' +
    ('00' + date.getUTCDate()).slice(-2) +
    ' ' +
    ('00' + date.getUTCHours()).slice(-2) +
    ':' +
    ('00' + date.getUTCMinutes()).slice(-2) +
    ':' +
    ('00' + date.getUTCSeconds()).slice(-2)
  );
}

function getItemKey(itemSale) {
  return `${itemSale.brand.trim()}_${itemSale.container.trim()}`;
}

function getCardNumber() {
  const rand = Math.random() * 10000000000000000;
  const s = String(rand);
  return s.substring(0, 16).padEnd(16, '35689');
}

function getNumOfItemInSingleSale() {
  const r = Math.random();
  if (r < 0.6) {
    return 1;
  } else if (r < 0.85) {
    return 2;
  } else if (r < 0.95) {
    return 3;
  } else {
    return 4;
  }
}
