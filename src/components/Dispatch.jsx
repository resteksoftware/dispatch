import { Route, NavLink } from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import styled from 'styled-components';
import Map2D from './Map2D';
import Map3D from './Map3D';
import RespondOptions from './RespondOptions';
import callTypeToColors from '../utils/callTypeColor';
const hostname = 'http://localhost:8080' // TODO: change this to ternary for production vs dev
const DEBUG = false

export default class Dispatch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      destinationCoords: null,
      userCoords: null,
      userData: null,
      apparatusAssignment: null,
      timeAgo: null,
      formattedTimeout: null,
      dispatchTitle: null,
      responseToggle: false,
      responseData: null,
      responseStatus: '',
      respUserId: null
    };
    this.getDestinationData = this.getDestinationData.bind(this);
    this.setApparatus = this.setApparatus.bind(this);
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
    this.setTimeAgo = this.setTimeAgo.bind(this);
    this.parseCallCategory = this.parseCallCategory.bind(this);
    this.responseToggle = this.responseToggle.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
    this.setResponseStatus = this.setResponseStatus.bind(this);
    this.handleEndResponse = this.handleEndResponse.bind(this);
    this.setUserData = this.setUserData.bind(this);
    this.setResponseData = this.setResponseData.bind(this);
  }
  
  componentDidMount() {
    this.getDestinationData(this.props.dispatchData);
    this.getCurrentLocation();
    this.setApparatus();
    this.setUserData();
    this.setResponseData();
    this.setTimeAgo();
    this.parseCallCategory();
    this.setResponseStatus();
  }
  
  getCurrentLocation() {
    const options = {
      timeout: 60000,
      enableHighAccuracy: false,
      maximumAge: Infinity
    }
    
    navigator.geolocation.getCurrentPosition(position => {
      let userCoords = {
        userLat: position.coords.latitude,
        userLng: position.coords.longitude
      }
      if (DEBUG) console.log('[SUCCESS] navigator.geolocation, captured on init:', userCoords);
      
      this.setState({userCoords: userCoords})
    }, (err) => {
      //TODO: add fallback that grabs approximate location via IP mapping from RIPE db (nfd)
      let errorCodes = {
        0: 'unknown error',
        1: 'permission denied',
        2: 'position unavailable (error response from location provider)', 
        3: 'timed out'
      }
      if (DEBUG) console.log(`[ERROR] navigatior.geolocation, error code ${err.code}: ${errorCodes[err.code]}`);
      //on geolocation fail, set coordinates to firehouse
      let userCoords = {
        userLat: 41.025392,
        userLng:  -73.624656
      }
      this.setState({userCoords: userCoords})
    }, options );
  }

  setUserData() {
    let userData = Object.assign({}, this.props.userData)
    this.setState({ userData: userData })
  }

  setResponseData() {
    let responseData = Object.assign({}, this.props.responseData)
    responseData.resp_user = responseData.resp_user.filter(responder => responder.closing_resp_timestamp === null)
    
    // TODO: add filter logic for apparatus that have already responded
    this.setState({ responseData: responseData })
  }
  
  parseCallCategory() {
    let dispatchTitle = this.props.dispatchData.inc_category
    .slice(0)
    .replace(/\//g, '/\n');
    this.setState({dispatchTitle: dispatchTitle});
  }
  
  setApparatus() {
    
    //incoming props seems unpredictable with , and ' '
    let assignments = this.props.dispatchData.assignments
    let apparatusData = assignments[assignments.length - 1].assignment
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
  
  responseToggle() {
    this.setState({ responseToggle: !this.state.responseToggle })
  }

  /**
   * 
   * @param {number} incId (incident_id) passed in from different incident user is responding to
   * this function is called when a user is ending a response, either from this
   * incident or from another incident
   */
  async handleEndResponse() {
  
    let responders;
    let updatedUserData;
    // TODO: meditate adding fields to responses tables for gps origin, status (nfd)

    let userLocation = `{lat:${this.state.userCoords.userLat},lng:${this.state.userCoords.userLng}}`

    let responseDetails = {
      closing_resp_timestamp: Date.now(),
      closing_resp_gps: userLocation
    }
    
    await axios.patch(`${hostname}/api/responses/user/${this.state.respUserId}`, responseDetails)

    // returns { resp_user: [ {..}, ..], resp_app: [ {..}, ..] }
    responders = await axios.get(`${hostname}/api/responses/inc-id/${this.props.dispatchData.inc_id}`)
                            .then(responseData => {
                              responseData.data.resp_user = responseData.data.resp_user.filter(resp => resp.closing_resp_timestamp === null)
                              return responseData.data
                            })
    updatedUserData = await axios.get(`${hostname}/api/users/user-id/${this.state.userData.user_id}`).then(resp => resp.data)
    this.setState({
      responseData: responders,
      userData: updatedUserData
    })
    this.setResponseStatus()
    return

  }
  
  /**
   * 
   * @param {boolean} isDirect (if user is responding direct or from station)
   * this function is called when a user is responding to incident
   */

  async handleResponse(isDirect) {
    let responders;
    let updatedUserData;
    // TODO: meditate adding fields to responses tables for gps origin, status (nfd)
    
    let userLocation = {
        lat: this.state.userCoords.userLat,
        lng: this.state.userCoords.userLng
    }
    
    let responseDetails = {     
      inc_id: this.props.dispatchData.inc_id,
      user_id: this.props.userData.user_id,
      respond_direct: isDirect,
      init_resp_gps: JSON.stringify(userLocation),
      init_resp_timestamp: Date.now(),
      onscene_resp_timestamp: null,
      onscene_resp_gps: null,
      closing_resp_timestamp: null,
      closing_resp_gps: null
    }

     if (isDirect === true) {
      await axios.post(`${hostname}/api/responses/user`, responseDetails).then(res=>console.log('Success handling response',res.data))
    } else { // user is responding from their default station
      // TODO: modify initial query for user data to get default_station coordinates 
      // then use coordinates to calculate distance for response status (nfd)
      // for reference Station 4's gps is: 41.038147, -73.665000
      responseDetails.init_resp_gps = '{lat: 41.038147, lng: -73.665000}'
      await axios.post(`${hostname}/api/responses/user`, responseDetails).then(res => console.log('Success handling response', res.data))
    }
    // returns { resp_user: [ {..}, ..], resp_app: [ {..}, ..] }
    responders = await axios.get(`${hostname}/api/responses/inc-id/${responseDetails.inc_id}`).then(resp => resp.data) 
    updatedUserData = await axios.get(`${hostname}/api/users/user-id/${this.state.userData.user_id}`).then(resp => resp.data)
    this.setState({
      responseData: responders,
      userData: updatedUserData
    })
    this.setResponseStatus()
    return
  }

  setResponseStatus() {
    let userResp = this.state.userData ? this.state.userData.responses : this.props.userData.responses
    // default is for user to respond
    let responseStatus = '';
    let respUserId;
    // TODO: ensure we are chronologically sorting through this collection (nfd)
    if (userResp.length === 0) {
      // if there are no responses yet for the user
      responseStatus = "RESPOND"
    } else {
      userResp.forEach(resp => {
        // check if response is open
        if (resp.closing_resp_timestamp === null) {
          if (DEBUG) console.log('stepping in open response ', resp.closing_resp_timestamp);
          // check if current inc_id matches user_resp
          if (resp.inc_id === this.props.dispatchData.inc_id) {
            if (DEBUG) console.log('stepping in matching inc_id', resp.inc_id);
            // user has an open response with the same inc_id as this dispatch
            responseStatus = "YOU ARE RESPONDING"
            respUserId = resp.resp_user_id
          } else {
            if (DEBUG) console.log('you have an open response at another incident', resp.inc_id);
            // user has an open response belonging to a different incident
            responseStatus = "YOU ARE RESPONDING TO ANOTHER INCIDENT"
            respUserId = resp.resp_user_id
          }
        } else {
          if (DEBUG) console.log('check if closed response has same resp.inc_id');
          // TODO: if its not chronological then there could be a problem with this conditional (nfd)
          if (resp.inc_id === this.props.dispatchData.inc_id) {
            responseStatus = "YOU ALREADY RESPONDED"
            respUserId = resp.resp_user_id
          }
        }

        if (responseStatus === '') {
          if (DEBUG) console.log('had some responses but all of them closed');
          // user had some responses in collection
          responseStatus = 'RESPOND'
          respUserId = null
        }
      })
    }
    this.setState({ 
      responseStatus: responseStatus,
      respUserId: respUserId
    })
  }
  
  render() {
    
    const alarmColor = callTypeToColors(this.props.dispatchData.inc_description)
    
    const DispatchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    max-width: 1200px;
    `;
    
    const Title = styled.div`
    padding: 20px 0 10px 0;
    
    display: grid;
    grid-template-rows: 2fr 1fr;
    grid-template-columns: 1fr 5fr 1fr;
    grid-template-areas: '.. description ..'
    '.. timeout     ..';
    color: white;
    text-align: center;
    background-color: ${alarmColor}; 
    letter-spacing: 5px;
    -webkit-box-shadow: 0px 2px 4px 0px rgba(184,181,184,1);
    -moz-box-shadow: 0px 2px 4px 0px rgba(184,181,184,1);
    box-shadow: 0px 2px 4px 0px rgba(184,181,184,1);
    @media screen and (min-width: 1050px){
      border-radius: 15px 15px 0 0;
    }
    `;
    
    const Description = styled.div`
    grid-area: description;
    font-size: 3rem;
    font-family: 'Podkova';
    @media screen and (max-device-width: 480px) and (orientation: portrait){
      font-size: 2rem;
    }
    `;
    
    const Timeout = styled.div`
    grid-area: timeout;
    font-size: 1.5em;
    font-family: 'Source Code Pro', monospace;
    letter-spacing: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    @media screen and (max-device-width: 480px) and (orientation: portrait){
      font-size: 1em;
    }
    `;
    
    const DispatchDetails = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
    
    li:nth-child(odd) {
      font-family: 'Anonymous Pro';
      color: firebrick;
      background-color: white;
      padding: 20px 0 20px 10px;
      font-size: 1.3em;
      @media screen and (max-device-width: 480px) and (orientation: portrait){
        font-size: 1em;
      }
    }
    
    li:nth-child(2n+3) {
      border-bottom: 2px solid white;
      border-top: 2px solid firebrick;
    }
    
    li:nth-child(even) {
      font-family: 'Source Code Pro', monospace;
      color: black;
      background-color: white;
      padding: 5px 0 10px 10px;
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
    border-radius: 20px;
    @media screen and (max-device-width: 480px) and (orientation: portrait){
      border-radius: 15px;
      font-size: 1em;
      min-width: 90%;
    }
    `;
    
    const ResponseThumb = styled.div`
    height: 8%;
    width: 10%;
    background-color: white;
    position: fixed;
    right: 0;
    margin-top: 40%;
    border-top-left-radius: 25px;
    border-bottom-left-radius: 25px;
    border-top: 2px solid firebrick;
    border-left: 2px solid firebrick;
    border-bottom: 2px solid firebrick;
    `;
    
    const ResponseSelect = styled.div`
    height: 40%;
    width: 60%;
    background-color: white;
    position: fixed;
    padding: 10px;
    z-index: 6;
    right: 0;
    margin-top: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top-left-radius: 25px;
    border-bottom-left-radius: 25px;
    border-top: 2px solid firebrick;
    border-left: 2px solid firebrick;
    border-bottom: 2px solid firebrick;
    `;

    const ResponseContainer = styled.ul`
    padding: 0 0 30px 0;
    margin: 0;
    list-style: none;
    `;
    
    const Responder = styled.li`
    font-size: 1.5em;
    font-family: 'Source Code Pro', monospace;
    letter-spacing: 5px;
    display: flex;
    justify-content: center;
    
    @media screen and (max-device-width: 480px) and (orientation: portrait){
      font-size: 1em;
    }
    `;

    let { cross_street,
      inc_description,
      location,
      city,
      premise_name,
      map_ref,
      radio_freq,
      remarks } = this.props.dispatchData;
      
    let currentRemark = remarks[remarks.length - 1].remark
      
      return (
        
        <DispatchContainer>
        
        <Title>
        <Description>{inc_description}</Description>
        <Timeout>{this.state.timeAgo ? this.state.timeAgo : null}</Timeout>
        </Title>
        
        {
          this.props.userData.is_volley && this.state.responseStatus !== '' ?
            (this.state.responseToggle ?
              <ResponseSelect onClick={this.responseToggle}>
                <RespondOptions 
                  handleResponse={this.handleResponse} 
                  handleEndResponse={this.handleEndResponse}
                  responseStatus={this.state.responseStatus}/>
                  incId={this.props.dispatchData.inc_id}

              </ResponseSelect>
            : <ResponseThumb onClick={this.responseToggle}></ResponseThumb>)
          : null  
        }
        
        <DispatchDetails>
        <li>Apparatus Assigned: </li>
        <ApparatusContainer>
        
        {
          !this.state.apparatusAssignment
          ? null
          : this.state.apparatusAssignment.map((apparatus) => {
            return <Apparatus key={apparatus}>{apparatus}</Apparatus>
          })
        }
        </ApparatusContainer>
        <li>Description:</li>
        <li>{currentRemark}</li>
        <li>Address:</li>
        <li>{location + ", " + city}<br />
        { location === premise_name
          ? ''
          : premise_name
        }
        </li>
        <li>Nearest Cross Streets:</li>
        <li>{ cross_street.replace(/\&/g, ' & ') }</li>
        <li>Radio Channel & Map Reference:</li>
        <li>{ radio_freq } &nbsp; { map_ref }</li>
        <li>Dispatch Timeout:</li>
        <li>{ this.state.formattedTimeout ? this.state.formattedTimeout : null}</li>
        <li>Misc. Details:</li>
        <li>{remarks[0].remark}</li>
        <li>Navigation:</li>
        <li>
        {
          !this.state.destinationCoords ?  null :
          <Map2D
          callCategory={this.props.dispatchData.call_category}
          userCoords={this.state.userCoords}
          destinationCoords={this.state.destinationCoords}/>
        }
        </li>
        <li>Destination:</li>
        <li>  
        {
          !this.state.destinationCoords ? null :
          <Map3D destinationCoords={this.state.destinationCoords}/>
        }
        </li>
        <li>Responding: </li>
        </DispatchDetails>
        <ResponseContainer>
            {
              !this.state.responseData ? 
                null : 
                this.state.responseData.resp_user.map((responder) => {
                  return <Responder key={`resp-${responder.user_id}`}>{`${responder.first_name} ${responder.last_name} (${responder.rank})`}</Responder>
                })
            }
        </ResponseContainer>
        
        </DispatchContainer>
        
        )
        
      }
    }
    