import * as React from 'react';

import useLaptop from "../../media/useLaptop.jpg";
import dashboard from "../../media/dashboard.png";
import machines from "../../media/machines.png";
import prediction from "../../media/prediction.png";

import './Homepage.scss';


export const Homepage: React.FC = () => {
  return (
    <div className="homepage-main">
      <div className="homepage-first-row">
        <img className="first-row-image" src={useLaptop} alt="Man using excel on a laptop"/>
        <div className="first-row-title">
          <div>Vending Machine</div>
          <div>Management System</div>
        </div>
      </div>
      <HomepageRow
        title="Understand"
        titlePosition="left"
        image={dashboard}
      />
      <HomepageRow
        title="Manage"
        titlePosition="right"
        image={machines}
      />
      <HomepageRow
        title="Optimize"
        titlePosition="left"
        image={prediction}
      />
    </div>
  )
}



const HomepageRow: React.FC<{
  title: string;
  titlePosition: 'left' | 'right',
  image: any;
}> = ({title, image, titlePosition}) => {
  const titleComponent = (
    <div className="homepage-row-title">
      {title}
    </div>
  );
  const imageComponent = (
    <div className={`homepage-row-image ${titlePosition}` }>
      <img src={image} alt={image}/>
    </div>
  )

  return (
    <div className="homepage-row">
      { titlePosition === 'left' ? (
        <>
          {titleComponent}
          {imageComponent}
        </>
      ) : (
        <>
          {imageComponent}
          {titleComponent}
        </>
      )}
    </div>
  )
}