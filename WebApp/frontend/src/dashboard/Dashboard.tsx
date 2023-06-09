import * as React from 'react';
import { useSelector } from 'react-redux';

import {SupplierTypes} from "../../../shared/SupplierTypes";
import {roundToTwoDecimals} from "../../../shared/utils";
import {LoadingAnimation} from "../components/LoadingAnimation";
import { SalesChart } from './SalesChart';
import { SalesByItemChart } from './SalesByItemChart';
import { TotalSalesChart } from './TotalSalesChart';
import { TransactionSizeChart } from './TransactionSizeChart';
import { TransactionTable } from './TransactionTable';
import {Widget, WidgetType} from './Widget';

import './Dashboard.scss';

export const Dashboard: React.FC = () => {
  const sales = useSelector<any, SupplierTypes.Sales>(({ sales }) => sales);
  const transactions = useSelector<any, SupplierTypes.Transaction[]>(({ transactions }) => transactions).sort((a, b) => {
    return new Date(a.timestamp) > new Date(b.timestamp) ? -1 : 1;
  });
  const transactionWidgetData = React.useMemo<any>(() => widgetData('transaction', transactions), [transactions]);
  const earningWidgetData = React.useMemo<any>(() => widgetData('earning', transactions), [transactions]);
  
  return sales && transactions.length > 0 ? (
    <div className="home">
      <div className="homeContainer">
        <div className="widgets">
          <Widget type={transactionWidgetData.type} amount={transactionWidgetData.amount} diff={transactionWidgetData.diff}/>
          <Widget type={earningWidgetData.type} amount={roundToTwoDecimals(earningWidgetData.amount)} diff={earningWidgetData.diff}/>
        </div>
        <div className="charts">
          <TotalSalesChart daily={sales.daily}/>
          <SalesChart daily={sales.daily} showLegend/>
          <SalesByItemChart items={sales.items}/>
          <TransactionSizeChart transactions={sales.transactionSize}/>
        </div>
        <div className="listContainer">
          <div className="listTitle">Latest Transactions</div>
          <TransactionTable transactions={transactions}/>
        </div>
      </div>
    </div>
  ) : (<LoadingAnimation/>)
}

const widgetData = (type: WidgetType, transactions: SupplierTypes.Transaction[]) => {
  if(!transactions || transactions.length === 0) {
    return {
      type: type,
      amount: 0,
      diff: 0
    }
  }
  let amount = 0;
  let lastWeekAmount = 0;
  let diff = 0;
  const now = new Date(transactions[0].timestamp);
  const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const weekBeforeLastWeek = new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate() - 7);
  let i = 0;
  switch(type) {
    case 'transaction':
      while(i < transactions.length && new Date(transactions[i].timestamp) > lastWeek) {
        amount++;
        i++;
      }
      while(i < transactions.length && new Date(transactions[i].timestamp) > weekBeforeLastWeek) {
        lastWeekAmount++;
        i++;
      }
      break;
    case 'earning':
      while(i < transactions.length && new Date(transactions[i].timestamp) > lastWeek) {
        amount += transactions[i].totalPrice;
        i++;
      }
      while(i < transactions.length && new Date(transactions[i].timestamp) > weekBeforeLastWeek) {
        lastWeekAmount += transactions[i].totalPrice;
        i++;
      }
      break;
  }
  // console.log(amount);
  // console.log(lastWeekAmount);
  diff = (amount - lastWeekAmount) / lastWeekAmount;
  // console.log(diff);
  return {
    type,
    amount: amount,
    diff: diff.toFixed(4)
  }
}
