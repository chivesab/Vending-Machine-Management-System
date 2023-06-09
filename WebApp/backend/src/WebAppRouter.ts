import express from 'express';
import passport from 'passport'
import { Strategy as LocalStrategy }  from 'passport-local';
import * as _ from 'lodash';

import { SupplierTypes } from '../../shared/SupplierTypes';
import { machineModel } from './models/MachineModel';
import { paymentModel } from './models/PaymentModel';
import { userModel } from './models/UserModel';
import {getStrategies} from "./Strategy";

export const WebAppRouter = express.Router();

const WEB_APP_HOME_PAGE = '/'


passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  console.log("Reached verify function");
  try {
    const authenticateResult = await userModel.authenticateUser(email, password);
    if (!authenticateResult) {
      return done(null, false);
    }
    return done(null, authenticateResult);
  } catch (error: any) {
    done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await userModel.getUser(id);
  done(null, user);
});


WebAppRouter.route('/')
.get((req, res) => {
  console.debug("Reached web app main route");
  res.send('Welcome to WebApp main route at: ' + req.originalUrl);
})
 
WebAppRouter.route('/login')
  .post(passport.authenticate('local'), (req, res) => {
    console.debug("login:", req.user);
    res.status(200).send("Successfully log in");
  })

WebAppRouter.route('/logout') 
  .get((req, res) =>{
    console.log('logout')
    req.session.destroy(function (err) {
      res.redirect(WEB_APP_HOME_PAGE);
    });  
  })

WebAppRouter.route('/signup')
  .post(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).send("No email, password or name");
    }
    try {
      await userModel.addUser(email, password, name);
      res.status(201).send("Successfully signed up");
    } catch(err: any) {
      console.log(err.message);
      res.status(409).send(err.message);
    }
  })

const protectedRouteMiddleware: express.Handler = (req, res, next) => {  
  if (req.isAuthenticated()) {
    next();
  } else {
    console.warn("Unauthrorized request");
    res.redirect(401, WEB_APP_HOME_PAGE);
  }
}

type AuthenticatedRequest = express.Request & { user: SupplierTypes.User };

WebAppRouter.route('/initialLoad')
  .get(protectedRouteMiddleware, async (req: any, res) => {
    const machines = await machineModel.getMachinesForUser(req.user.companyId);
    const sales = await paymentModel.getSalesForMachines(machines.map(({id}) => id));
    const transactions = await paymentModel.getPaymentsForMachines(machines.map(({id}) => id));
    const strategies = await getStrategies();

    res.send({
      machines,
      sales,
      transactions,
      strategies
    });
  })

WebAppRouter.route('/machine/restock')
  .post(protectedRouteMiddleware, async(req: any, res) => {
    const {machineId} = req.body;
    if (!machineId) {
      return res.status(400).send();
    }

    const machine = await machineModel.restockMachine(machineId);

    res.send(machine);
  })

WebAppRouter.route('/authenticated')
  .get(protectedRouteMiddleware, (req: any, res) => {
    res.status(200).send();
  })

WebAppRouter.route('/machine/updateCapacity')
  .post(protectedRouteMiddleware, async (req: any, res) => {
    const {machineId, companyId, items, strategy} = req.body;
    const machines = await machineModel.updateCapacity(machineId, companyId, strategy, items);
    res.status(200).send(machines);
  })



// Wildcard route that guard against any other weird routes
WebAppRouter.route('*')
  .get((_, res) => {
    res.redirect(WEB_APP_HOME_PAGE);
  })


