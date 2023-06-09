import mysql from 'promise-mysql';
var constants=require('./config.json');

export const connection = mysql.createPool({
  host : constants.DB.host,
  user: constants.DB.username,
  password: constants.DB.password,
  port:constants.DB.port, 
  database:constants.DB.database
});
