import React from 'react';
import { Route } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import * as utilZone from '../utils/utilityZone';

var hydrant = require('-!file-loader?name=hydrant!../assets/hydrant.png');

var map3D,
utilitiesJSON,
allUtilities,
utilityZone,
hydrantIcon,
utilitiesInZone,
destinationMarker;

export default class Map3D extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.initializeMap3D = this.initializeMap3D.bind(this);
  }

  componentDidMount() {
    this.initializeMap3D()
  }

  async initializeMap3D() {

    const {destinationLat, destinationLng} = this.props.destinationCoords;

    map3D = new window.google.maps.Map(document.getElementById('map3D'), {
      zoom: 18,
      center: {
        lat: destinationLat,
        lng: destinationLng,
      },
      mapTypeId: google.maps.MapTypeId.HYBRID,
      heading: 90,
      tilt: 45
    });

    destinationMarker = new google.maps.Marker({
      position: {lat: destinationLat, lng: destinationLng},
      map: map3D,
      title: 'Dispatch Destination'
    });

    //fetch available utilities using await to avoid .then nest
    utilitiesJSON = await axios.get('https://s3.amazonaws.com/fire-hydrants/greenwich-hydrants.json')
    .catch(err => console.log('error fetching utility data', err));
    //set utiltiesJSON to the axios response
    utilitiesJSON = utilitiesJSON.data;
    //clone features collection of JSON
    allUtilities = utilitiesJSON.features.slice(0);
    //build UtilityZone
    utilityZone = utilZone.buildGeoFence(6, destinationLat, destinationLng, 1.2);
    //set hydrant icon params
    hydrantIcon = {
      url: hydrant,
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(20, 32),
      // The origin for this image is (0, 0), so top left
      origin: new google.maps.Point(0, 0),
      // The anchor for this icon is the center.
      anchor: new google.maps.Point(10, 16)
    };
    //filter geoJSON to relevant utilities, then map the markers out
    utilitiesInZone = allUtilities.filter(util => {
      let lat = util.geometry.coordinates[1];
      let lng = util.geometry.coordinates[0];

      return utilZone.didEnterFence([lat, lng], utilityZone)
    })
    .forEach(util =>{
      let lat = util.geometry.coordinates[1];
      let lng = util.geometry.coordinates[0];

      let marker = new google.maps.Marker({
        position: {lat:lat,lng:lng},
        map: map3D,
        icon: hydrantIcon,
        title: 'fire-hydrant'
      });
    })

  }


  render() {
    const MapDiv = styled.div`
      width: 100%;
      height: 50em;
      margin: 0 0 2em 0;
      @media screen and (min-device-width: 768px) and (max-device-width: 1024px){
        height: 25em;
      }
      @media screen and (max-device-width: 480px) and (orientation: portrait){
        height: 25em;
      }
    `;

    return (

      <MapDiv
        className="maps"
        id="map3D" />

    )

  }
}
