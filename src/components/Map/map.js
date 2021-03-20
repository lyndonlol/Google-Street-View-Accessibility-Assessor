import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Circle } from '@react-google-maps/api';
import { AddressContext } from '../../App';
import { CustomDialog } from 'react-st-modal';
import AccessibilitySummaryDialog from '../AccessibilitySummaryDialog/AccessibilitySummaryDialog';

const containerStyle = {
  height: '93.9vh',
};

const mapZoom = 15;

const center = {
  lat: 45.4197217,
  lng: -75.707717
};

const directionsRequest = (start,end) => {
  return {
    origin: start,
    destination: end,
    provideRouteAlternatives: false,
    travelMode: "WALKING",
  };
}

function MapContainer() {
  const [response, setResponse] = useState(null);
  const { addresses } = useContext(AddressContext);
  const colours = ['#f55742','#f5ef42', '#42f578', ]

  console.log("rendderrr");

  useEffect(() => {
  }, [addresses]);

  const directionsCallback = useCallback((res) => {
    console.log("in callback")
    console.log(res.routes[0].overview_path)
    if (!res) return;

    console.log('duhdudh');
    console.log(response); 
    console.log(addresses);
    console.log(res === response);
    if (response && res.request.destination.query === response.request.destination.query &&
      res.request.origin.query === response.request.origin.query) {
      console.log('we are returning')
      return;
    }

    res && res?.status === "OK" ? setResponse(res) : console.log(res.status);
  });

  return (
    <LoadScript googleMapsApiKey={`${process.env.REACT_APP_GOOGLE_API_KEY}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={mapZoom}
        onLoad={(map) => {
          console.log("DirectionsRenderer onLoad map: ", map);
        }}
      >
        <DirectionsService
          options={directionsRequest(
            addresses.source || "1125 Colonel By Dr, Ottawa, ON K1S 5B6, Canada",
            addresses.destination || "464 Rideau St, Ottawa, ON K1N 5Z3, Canada"
          )}
          callback={(res) => directionsCallback(res)}
          onLoad={(directionsService) => {
            console.log(
              "DirectionsService onLoad directionsService: ",
              directionsService
            );
          }}
        />

        {
          // (response !== null) &&
          <DirectionsRenderer
            options={response && { directions: response }}
            onLoad={(directionsRenderer) => {
              console.log(
                "DirectionsRenderer onLoad directionsRenderer: ",
                directionsRenderer
              );
            }}
          />
        }
        {response && response.routes[0].overview_path.map((latlng, idx) => {
          let colorIdx = idx % 3;
          return (<Circle
            key={idx}
            center={{
              lat: latlng.lat(),
              lng: latlng.lng()
            }}
            radius={20}
            onClick={async () => {
              const result = await CustomDialog(
                <AccessibilitySummaryDialog
                  lat={latlng.lat()}
                  lng={latlng.lng()}
                />,
                {
                  title: 'Accessibility Summary',
                  showCloseIcon: true,
                  className: 'dialog'
                }
              );
            }}
            options={{
              strokeColor: colours[colorIdx],
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: colours[colorIdx],
              fillOpacity: 0.35}}
          />)
        })}
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(MapContainer)