import express from 'express'
import session from 'express-session';
import fs from 'fs'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import * as bodyParser from 'body-parser';
import passport from 'passport';

import { App } from '../frontend/app'
import { VendingMachineRouter } from './src/vendingMachine/VendingMachineRouter';
import { WebAppRouter } from './src/WebAppRouter'


const server = express()

server.use(session({
  secret              : 'cmpe295_react_nodejs_mysql',
  resave              : false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
  saveUninitialized   : false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
  cookie: {
    maxAge: 1000*60*60 // An hour
  }
}));

server.use(passport.initialize());
server.use(passport.session());



server.use(bodyParser.json());

server.use('/api/vm', VendingMachineRouter); 
server.use('/api', WebAppRouter);
 
// Serving static resources, mainly rendered React components
server.use(express.static(path.join(__dirname, 'static')))



server.set('view engine', 'ejs')
server.set('views', path.join(__dirname, 'views'))


const manifest = fs.readFileSync(
  path.join(__dirname, 'static/manifest.json'),
  'utf-8'
)

const assets = JSON.parse(manifest) 

// Routes for API

server.get('*', (req, res) => {
  const component = ReactDOMServer.renderToString(
    (<StaticRouter location={req.url}>
      <App />
    </StaticRouter>)
  );

  res.render('client', { assets, component });
})





server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`)
})