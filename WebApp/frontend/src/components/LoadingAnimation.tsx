import { ClimbingBoxLoader } from 'react-spinners';
import * as React from 'react';
import { css } from '@emotion/react';

import './LoadingAnimation.scss';

const SPINNER_STYLE = css`
  position: unset;
`;

export const LoadingAnimation = () => (
  <div className="loading-animation">
    <ClimbingBoxLoader css={SPINNER_STYLE} color="#20b2aa" />
  </div>
);
