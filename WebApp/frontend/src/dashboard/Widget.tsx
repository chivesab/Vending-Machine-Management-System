
import React from 'react';
import "./Widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { SupplierTypes } from '../../../shared/SupplierTypes';

export type WidgetType = 'transaction' | 'earning'

interface Props {
  type: WidgetType;
  amount: number;
  diff: number;
}

export const Widget: React.FC<Props> = ({type, amount, diff}) => {
  let data;
  // const xxx = diff > 0 ? 'positive' : 'negative';
  switch (type) {
    case "transaction":
      data = {
        title: "TRANSACTIONS",
        isMoney: false,
        text: "from last week",
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "earning":
      data = {
        title: "EARNINGS",
        isMoney: true,
        text: "from last week",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title"> { data ? data.title : "test"}</span>
        <span className="counter">
          {data ? (data.isMoney && "$") : "$"} {amount}
        </span>
        <span className="text">{data ? data.text : "empty"}</span>
      </div>
      <div className="right">
        {diff > 0 ?
        <div className='percentage positive'>
          <KeyboardArrowUpIcon />
          +{diff} %
        </div> :
        <div className='percentage negative'>
          <KeyboardArrowDownIcon />
          {diff} %
        </div>}
        {data ? data.icon : null}
      </div>
    </div>
  );
};

