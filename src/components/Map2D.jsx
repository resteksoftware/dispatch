import React from 'react';
import { Route } from 'react-router-dom';
import styled from 'styled-components';
import callTypeToColors from '../utils/callTypeColor';

//declare global map variables
var map,
    userMarker,
    destinationMarker,
    hydrantIcon,
    originMarker,
    userOrigin,
    trafficLayer,
    directionsService,
    directionsDisplay,
    hydrantIcon,
    utilitiesJSON,
    allUtilities,
    utilityZone,
    utilitiesInZone
  ;

export default class Map2D extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.initializeMap = this.initializeMap.bind(this);
  }

  componentDidMount () {
    this.initializeMap();
  }

  async initializeMap () {

    //shorten destination coordinates
    let dLat = this.props.destinationCoords.destinationLat;
    let dLng = this.props.destinationCoords.destinationLng;
    let oLat = undefined;
    let oLng = undefined;
    //only get userCoords once geolocation or fallback has been established
    if (this.props.userCoords) {
      oLat = this.props.userCoords.userLat;
      oLng = this.props.userCoords.userLng;
    }

    //instantiate origin/destination coords
    const dispatchDestination = new google.maps.LatLng(dLat, dLng);
    const userOrigin = new google.maps.LatLng(oLat, oLng);

      //instantiate new map with center on dispatch destination
      map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: dispatchDestination,
        streetViewControl: false,
        mapTypeControl: false,
        mapTypeId: 'roadmap',
      });
      //instantiate destination marker
      destinationMarker = new google.maps.Marker({
        position: dispatchDestination,
        map: map,
        title: 'Dispatch Destination'
      });
      //instantiate origin marker
      originMarker = new google.maps.Marker({
        position: userOrigin,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: 'red'
        },
        title: 'Current Location'
      });
      //instantiate traffic layer and apply to map
      trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map)
      //instantiate directions service
      directionsService = new google.maps.DirectionsService();
      //instantiate directions renderer
      directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
      });
      //apply route with params
      directionsService.route({
        origin: userOrigin,
        destination: dispatchDestination,
        avoidTolls: false,
        avoidHighways: false,
        travelMode: google.maps.TravelMode.DRIVING
      }, (res, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(res)
        } else {
          console.log('directions service failed')
        }
      });

  }

  render() {
    const alarmColor = callTypeToColors(this.props.callCategory)
    let dLat = this.props.destinationCoords.destinationLat;
    let dLng = this.props.destinationCoords.destinationLng;
    let oLat = undefined;
    let oLng = undefined;

    if (this.props.userCoords) {
      oLat = this.props.userCoords.userLat;
      oLng = this.props.userCoords.userLng;
    }

    const MapContainer = styled.div`
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    `;

    const MapDiv = styled.div`
      width: 100%;
      height: 70vw;
      margin: 0 0 2em 0;
      grid-area: 1/1/2/2;
      @media screen and (min-device-width: 768px) and (max-device-width: 1024px){
        height: 100vw;
      }
      @media screen and (max-device-width: 480px) and (orientation: portrait){
        height: 100vw;
      }
    `;

    const NavigateBtn = styled.div`
      grid-area: 1/1/2/2;
      position: inherit;
      z-index: 4;
      display: flex;
      justify-content: center;
      align-items: center;
      bottom: 0;
      height: 2em;
      width: 10em;
      border-radius: 10px;
      background-color: ${alarmColor};
      margin: 1%;
      a{
        font-family: 'Anonymous Pro', monospace;
        font-size: 1em;
        color: white;
        text-decoration: none;
      }
    `;

    return (
      <MapContainer>
        {
          ( oLat && oLng && dLat && dLng )
          ? <NavigateBtn> <a href={`https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLng}&destination=${dLat},${dLng}&travelmode=driving`}>Start Navigation</a></NavigateBtn>
          : null
        }
        <MapDiv
          className="maps"
          id="map">
        </MapDiv>
      </MapContainer>
    )

  }
}
