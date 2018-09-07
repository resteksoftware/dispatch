import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import styled from 'styled-components';
import Map2D from './Map2D';
import Map3D from './Map3D';
import callTypeToColors from '../utils/callTypeColor';

export default class Dispatch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      destinationCoords: null,
      userCoords: null,
      apparatusAssignment: null,
      timeAgo: null,
      formattedTimeout: null,
      dispatchTitle: null,
    };
    this.getDestinationData = this.getDestinationData.bind(this);
    this.setApparatus = this.setApparatus.bind(this);
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
    this.setTimeAgo = this.setTimeAgo.bind(this);
    this.parseCallCategory = this.parseCallCategory.bind(this);
  }

  componentDidMount() {
    this.getDestinationData(this.props.dispatchData);
    this.getCurrentLocation();
    this.setApparatus();
    this.setTimeAgo();
    this.parseCallCategory();
  }

  getCurrentLocation() {
    const options = {
            timeout: 3000,
            enableHighAccuracy: false,
            maximumAge: 75000
          }

    navigator.geolocation.getCurrentPosition(position => {
      let userCoords = {
        userLat: position.coords.latitude,
        userLng: position.coords.longitude
      }
      this.setState({userCoords: userCoords})
    }, (err) => {
      //on geolocation fail, set coordinates to firehouse
      let userCoords = {
        userLat: 41.025392,
        userLng:  -73.624656
      }
      this.setState({userCoords: userCoords})
    }, options );
  }

  parseCallCategory() {
    let dispatchTitle = this.props.dispatchData.call_category
      .slice(0)
      .replace(/\//g, '/\n');
      this.setState({dispatchTitle: dispatchTitle});
  }

  setApparatus() {
    //incoming props seems unpredictable with , and ' '
    let apparatusData = this.props.dispatchData.assignment
      .replace(/\s/g, ',') //replace spaces with commas
      .split(',')
      .filter(apparatus => apparatus !== ',' && apparatus !== '' );

    this.setState({apparatusAssignment: apparatusData})
  }

  async getDestinationData(dispatchData) {
    let { latitude, longitude, city, location } = dispatchData
    if (latitude && longitude) {
      let destinationCoords = {
        destinationLat: parseFloat(latitude),
        destinationLng: parseFloat(longitude)
      }
      this.setState({destinationCoords: destinationCoords})

    } else {
      console.log('Destination Coordinates not provided.')
      console.log('fallback from FE has been removed.')
    }
  }

  setTimeAgo () {
    // parse string to date object
    let timeout = parse(this.props.dispatchData.timeout)
    // set formattedTimeout to render in dispatch
    this.setState({formattedTimeout: format(timeout, 'HH:mm:ss MM/DD/YYYY')})

    // compare distance between now and dispatch timeout
    let currTimeAgo = distanceInWordsToNow( timeout, {addSuffix: true})
    currTimeAgo = currTimeAgo.split(' ')
    // map over words to capitalize first letter
    let formattedTimeAgo = currTimeAgo.map(el => {
      if (el.length > 1) {
        el = el[0].toUpperCase() + el.slice(1)
      }
      return el
    })
    formattedTimeAgo = formattedTimeAgo.join(' ')
    // set timeAgo to display under dispatch title
    this.setState({timeAgo: formattedTimeAgo})
  }


  render() {
    const alarmColor = callTypeToColors(this.props.dispatchData.call_category)

    const DispatchContainer = styled.div`
      display: grid;
      grid-template-columns: 1fr;
      max-width: 1200px;
    `;

    const Title = styled.div`
      padding: 20px 0 20px 0;
      display: grid;
      grid-template-rows: 2fr 1fr;
      grid-template-columns: 1fr 5fr 1fr;
      grid-template-areas: '.. description ..'
                           '.. timeout     ..';
      color: white;
      text-align: center;
      background-color: ${alarmColor};
      letter-spacing: 5px;
        @media screen and (min-width: 1050px){
          border-radius: 15px 15px 0 0;
        }
    `;

    const Description = styled.div`
      grid-area: description;
      font-size: 3em;
      font-family: 'Podkova';
      @media screen and (max-device-width: 480px) and (orientation: portrait){
        font-size: 2em;
      }
    `;

    const Timeout = styled.div`
      grid-area: timeout;
      font-size: 1.5em;
      font-family: 'Source Code Pro', monospace;
      letter-spacing: 5px;
      @media screen and (max-device-width: 480px) and (orientation: portrait){
        font-size: 1em;
      }
    `;

    const DispatchDetails = styled.ul`
      padding: 0;
      list-style: none;

      li:nth-child(odd) {
        font-family: 'Anonymous Pro';
        color: firebrick;
        box-shadow: 0 4px 2px -2px lightgray;
        background-color: white;
        border-top: 2px solid white;
        border-bottom: 2px solid firebrick;
        padding: 0 0 5px 10px;
        font-size: 1.3em;
        @media screen and (max-device-width: 480px) and (orientation: portrait){
          font-size: 1em;
        }
      }

      li:nth-child(even) {
        font-family: 'Source Code Pro', monospace;
        color: black;
        background-color: white;
        padding: 10px 0 0 10px;
        margin-bottom: 2%;
        font-size: 1.5em;
        @media screen and (max-device-width: 480px) and (orientation: portrait){
          font-size: 1.3em;
        }
      }
    `;

    const ApparatusContainer = styled.li`
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 30px;
      max-width: 90%;
      margin: auto;
    `;

    const Apparatus = styled.div`
      font-family: 'Source Code Pro', monospace;
      display: flex;
      justify-self: center;
      justify-content: center;
      align-items: center;
      color: white;
      background-color: black;
      min-width: 50%;
      font-size: 1.5em;
      letter-spacing: 5px;
      padding: 5px 5px 5px 6px;
      border-radius: 35px;
      @media screen and (max-device-width: 480px) and (orientation: portrait){
        border-radius: 15px;
        font-size: 1em;
        min-width: 90%;
      }
    `;

    let { cross_street,
      call_description,
      location,
      city,
      premise_name,
      map_ref,
      radio_freq,
      cfs_remark } = this.props.dispatchData;



    return (

        <DispatchContainer>

        <Title>
          <Description>{this.state.dispatchTitle ? this.state.dispatchTitle : null}</Description>
          <Timeout>{this.state.timeAgo ? this.state.timeAgo : null}</Timeout>
        </Title>

        <DispatchDetails>
          <li>Apparatus Assigned</li>
          <ApparatusContainer>

            {
              !this.state.apparatusAssignment ? null :

              this.state.apparatusAssignment.map( (apparatus) => {
                return <Apparatus key={apparatus}>{apparatus}</Apparatus>
              })
            }

          </ApparatusContainer>
          <li>Description</li>
          <li>{call_description}</li>
          <li>Address</li>
          <li>{location + ", " + city}<br />
                  { location === premise_name
                    ? ''
                    : premise_name
                  }
          </li>
          <li>Nearest Cross Streets</li>
          <li>{ cross_street.replace(/\&/g, ' & ') }</li>
          <li>Radio Channel & Map Reference</li>
          <li>{ radio_freq } &nbsp; { map_ref }</li>
          <li>Dispatch Timeout</li>
          <li>{ this.state.formattedTimeout ? this.state.formattedTimeout : null}</li>
          <li>Misc. Details</li>
          <li>{cfs_remark}</li>
          <li>Navigation</li>
        </DispatchDetails>

        {
         !this.state.destinationCoords ?  null :
        <Map2D
          callCategory={this.props.dispatchData.call_category}
          userCoords={this.state.userCoords}
          destinationCoords={this.state.destinationCoords}/>
        }

        <DispatchDetails>
          <li>Destination</li>
        </DispatchDetails>

        {
        !this.state.destinationCoords ? null :
        <Map3D destinationCoords={this.state.destinationCoords}/>
        }


        </DispatchContainer>

    )

  }
}
