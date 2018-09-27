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

const DEBUG = false
const HOSTNAME =`http://${location.hostname}`
const PORT = 8080

let alarmColor = 'mediumseagreen'
let Title;

let tmpCount = 0;

const rankAbbr = {
  'firefighter' : 'ff'
}

const DispatchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    max-width: 1200px;
`;

const Description = styled.div`
    font-size: 3rem;
    grid-area: 1/2/2/3;
    font-family: 'Zilla Slab';
    @media screen and (max-device-width: 480px) and (orientation: portrait){
      font-size: 2rem;
    }
`;

const Timeout = styled.div`
    font-size: 1.5em;
    grid-area: 2/2/3/3;
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
      padding: 20px 0 10px 10px;
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
      max-width: 96vw;
      @media screen and (max-device-width: 480px) and (orientation: portrait){
        font-size: 1.3em;
      }
    }
`;

const ApparatusContainer = styled.li`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax( 80px, 1fr) );
    grid-gap: 30px;
    max-width: 90%;
    padding: 0px 10px!important;
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
    display: flex;
    justify-content: center;
    align-items: center;
    right: 0;
    margin-top: 40%;
    border-top-left-radius: 25px;
    border-bottom-left-radius: 25px;
    border-top: 2px solid firebrick;
    border-left: 2px solid firebrick;
    border-bottom: 2px solid firebrick;
`;

const ResponseArrow = styled.div`
	left: 0.25em;
	transform: rotate(-135deg);
  border-style: solid;
	border-width: 0.25em 0.25em 0 0;
	content: '';
	display: inline-block;
	height: 0.45em;
	left: 0.15em;
	position: relative;
  color: firebrick;
	top: 0.15em;
	transform: rotate(225deg);
	vertical-align: top;
	width: 0.45em;
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
    font-family: 'Source Code Pro', monospace;
    color: black;
    background-color: white;
    padding: 5px 0 10px 10px;
    font-size: 1.5em;
    @media screen and (max-device-width: 480px) and (orientation: portrait){
      font-size: 1.3em;
    }
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

const RadioContainer = styled.li`
    display: flex;
    justify-content:center;
`;

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
      dispatchTitle: this.props.dispatchData.inc_category,
      responseToggle: false,
      responseData: this.props.responseData,
      responseStatus: '',
      respUserId: null,
      dispatchData: this.props.dispatchData,
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
    this.updateDispatch = this.updateDispatch.bind(this);
  }

  componentWillMount() {
    alarmColor = callTypeToColors(this.props.dispatchData.inc_description)
    this.parseCallCategory();
    Title = styled.div`
      padding: 20px 0 10px 0;
      display: grid;
      grid-template-rows: 1fr 30px;
      grid-template-columns: 15px 5fr 15px;
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
  }

  componentDidMount() {
    this.getDestinationData(this.props.dispatchData);
    this.getCurrentLocation();
    this.setApparatus();
    this.setUserData();
    this.setResponseData();
    this.setTimeAgo();
    this.setResponseStatus();
    this.updateDispatch(this.props.dispatchData.inc_id)
    setTimeout(() => this.addApparatus(), 3000)
  }

  async updateDispatch(incId) {

    let params  = { params: { inc_id: incId } }
    let dispatch = await axios.get(`${HOSTNAME}:${PORT}/api/incidents/`, params).then(resp => resp.data)
    let response = await axios.get(`${HOSTNAME}:${PORT}/api/responses/inc-id/${incId}`).then(resp => resp.data)
    let appAssignment = this.setApparatus(dispatch.assignments)

    this.setState({
      dispatchData: dispatch,
      responseData: response,
      apparatusAssignment: appAssignment
    })

    // NOTE: this creates 2 queries every 3 seconds for each user actively viewing an incident and can be optimized (nfd)
    await new Promise(resolve => {
      setTimeout(() => resolve(this.updateDispatch(incId)), 3000)
    })
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

  setApparatus(newAssignment) {

    //incoming props seems unpredictable with , and ' '
    let assignments = newAssignment || this.props.dispatchData.assignments;
    let apparatusData = assignments[assignments.length - 1].assignment
    .replace(/\s/g, ',') //replace spaces with commas
    .split(',')
    .filter(apparatus => apparatus !== ',' && apparatus !== '' );

    if (!newAssignment) {
      this.setState({apparatusAssignment: apparatusData})
    } else {
      return apparatusData
    }
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

    await axios.patch(`${HOSTNAME}:${PORT}/api/responses/user/${this.state.respUserId}`, responseDetails)

    // returns { resp_user: [ {..}, ..], resp_app: [ {..}, ..] }
    responders = await axios.get(`${HOSTNAME}:${PORT}/api/responses/inc-id/${this.props.dispatchData.inc_id}`)
    .then(responseData => {
      responseData.data.resp_user = responseData.data.resp_user.filter(resp => resp.closing_resp_timestamp === null)
      return responseData.data
    })
    updatedUserData = await axios.get(`${HOSTNAME}:${PORT}/api/users/user-id/${this.state.userData.user_id}`).then(resp => resp.data)
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
      await axios.post(`${HOSTNAME}:${PORT}/api/responses/user`, responseDetails).then(res=>console.log('Success handling response',res.data))
    } else { // user is responding from their default station
      // TODO: modify initial query for user data to get default_station coordinates
      // then use coordinates to calculate distance for response status (nfd)
      // for reference Station 4's gps is: 41.038147, -73.665000
      responseDetails.init_resp_gps = '{lat: 41.038147, lng: -73.665000}'
      await axios.post(`${HOSTNAME}:${PORT}/api/responses/user`, responseDetails).then(res => console.log('Success handling response', res.data))
    }
    // returns { resp_user: [ {..}, ..], resp_app: [ {..}, ..] }
    responders = await axios.get(`${HOSTNAME}:${PORT}/api/responses/inc-id/${responseDetails.inc_id}`).then(resp => resp.data)
    updatedUserData = await axios.get(`${HOSTNAME}:${PORT}/api/users/user-id/${this.state.userData.user_id}`).then(resp => resp.data)
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

    let {
      cross_street,
      inc_description,
      location,
      city,
      premise_name,
      map_ref,
      radio_freq,
      remarks } = this.state.dispatchData;

    let currentRemark = remarks[remarks.length - 1].remark

      return (

        <DispatchContainer key={'disp1'}>
        <Title key={'disp2'}>
        <Description key={'disp3'}>
            {this.state.dispatchTitle}
        </Description>
        <Timeout key={'disp4'}>{this.state.timeAgo ? this.state.timeAgo : null}</Timeout>
        </Title>

        {
          this.props.userData.is_volley && this.state.responseStatus !== '' ?
          (this.state.responseToggle ?
            <ResponseSelect
              key={'disp5'}
              onClick={this.responseToggle}>
            <RespondOptions
            key={'disp6'}
            handleResponse={this.handleResponse}
            handleEndResponse={this.handleEndResponse}
            responseStatus={this.state.responseStatus}
            incId={this.state.dispatchData.inc_id} />

            </ResponseSelect>
            : <ResponseThumb
                key={'disp7'}
                onClick={this.responseToggle}>
                <ResponseArrow/>
              </ResponseThumb>)
            : null
          }

          <DispatchDetails key={'disp8'}>
          <li>Apparatus Assigned: </li>
          <ApparatusContainer>

          {
            !this.state.apparatusAssignment
            ? null
            : (
              this.state.apparatusAssignment.length === 0 ?
              'NONE' :
              this.state.apparatusAssignment.map( app => {
              return <Apparatus key={`disp${app}`}>{app}</Apparatus>
            }))
          }
          </ApparatusContainer>
          <li key={'disp8'}>Description:</li>
          <li key={'disp9'}>{currentRemark}</li>
          <li key={'disp10'}>Address:</li>
          <li key={'disp11'}>{location + ", " + city}<br />
          { location === premise_name
            ? ''
            : premise_name
          }
          </li>
          <li key={'disp12'}>Nearest Cross Streets:</li>
          <li key={'disp13'}>{ `${cross_street ? cross_street : 'NO CROSS STREET PROVIDED'}` }</li>
          <li key={'disp14'}>Radio Channel & Map Reference:</li>
          <li key={'disp15'}>{ `${radio_freq ? radio_freq : 'NO RADIO PROVIDED'} \n ${map_ref ? map_ref : 'NO MAP PROVIDED'}` }</li>
          <li key={'disp16'}>Live Radio:</li>
          <RadioContainer key={'disp17'}>
            <audio controls={true}>
            <source src={"http://audio-ogg.ibiblio.org:8000/wcpe.ogg"} type={"audio/ogg"}/>
            <source src={"http://35.199.41.42:8000/gfd.mp3"} type={"audio/mp3"}/>
            <p>
            {`Your browser doesn't support HTML5 audio. Please download chrome`}
            </p>
            </audio>
          </RadioContainer>
          <li key={'disp18'}>Dispatch Timeout:</li>
          <li key={'disp19'}>{ this.state.formattedTimeout ? this.state.formattedTimeout : null}</li>
          <li key={'disp20'}>Misc. Details:</li>
          <li key={'disp21'}>{remarks[0].remark}</li>
          <li key={'disp22'}>Navigation:</li>
          <li key={'disp23'}>
          {
            !this.state.destinationCoords ?  null :
            <Map2D
            key={'disp24'}
            callCategory={this.state.dispatchData.call_category}
            userCoords={this.state.userCoords}
            destinationCoords={this.state.destinationCoords}/>
          }
          </li>
          <li key={'disp25'}>Destination:</li>
          <li key={'disp26'}>
          {
            !this.state.destinationCoords ? null :
            <Map3D key={'disp27'} destinationCoords={this.state.destinationCoords}/>
          }
          </li>
          <li key={'disp28'}>Responding: </li>
          </DispatchDetails>
          <ResponseContainer key={'disp29'}>
          {
            !this.state.responseData ?
            null : (
              this.state.responseData.resp_user.length === 0 ?
                  'NO RESPONDERS AT THIS TIME' :
                  this.state.responseData.resp_user.map((responder) => {
                    return responder.closing_resp_timestamp === null ? <Responder key={`resp-${responder.first_name + responder.last_name}`}>{`${responder.first_name} ${responder.last_name} (${rankAbbr[responder.rank]})`}</Responder> : null
                  }) )

          }
          </ResponseContainer>

          </DispatchContainer>

          )

        }
      }

