import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';

import { SupplierTypes } from '../../../shared/SupplierTypes';
import { getStockLevel } from './ExportButton';

const DEFAULT_MAP_ZOOM = 7;
const DEFAULT_MAP_CENTER: google.maps.LatLngLiteral = {
  lng: 23.7163,
  lat: 37.9795,
};

interface Props {
  machines: SupplierTypes.Machine[];
}

export const MachineMap: React.FC<Props> = ({ machines }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | undefined>(undefined);

  let lastOpenedInfoWindow: google.maps.InfoWindow | undefined = undefined;

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          zoom: DEFAULT_MAP_ZOOM,
          center: DEFAULT_MAP_CENTER,
        })
      );
    }

    async function addMarker() {
      if (map && machines.length > 0) {
        machines.map((machine) => {
          const marker = new google.maps.Marker({
            map,
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
            position: {
              lat: machine.location.latitude,
              lng: machine.location.longitude,
            },
          });

          const infowindow = new google.maps.InfoWindow({
            content: '',
          });

          marker.addListener('click', () => {
            const content = ReactDOMServer.renderToString(
              <MachineInfoWindow machine={machine} />
            );
            infowindow.setContent(content);

            if (lastOpenedInfoWindow) {
              lastOpenedInfoWindow.close();
            }

            lastOpenedInfoWindow = infowindow;

            infowindow.open({
              anchor: marker,
            });
          });
        });
      }
    }

    addMarker();
  }, [ref, map]);

  return <div ref={ref} style={{ height: '1000px' }} />;
};

const MachineInfoWindow: React.FC<{ machine: SupplierTypes.Machine }> = ({
  machine,
}) => {
  return (
    <div>
      <h1>{machine.city}</h1>
      <h2>Stock level: {getStockLevel(machine.items)}%</h2>
      <h2>30 days sale: ${machine.sales}</h2>
    </div>
  );
};
