/**
 * src/App.jsx
 *
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Loadable from 'react-loadable';
import Loading from './utils/Loading'

import Dispatch from './components/Dispatch';
import DispatchHistory from './components/DispatchHistory';
import Menu from './components/Menu';

const UserSettings = Loadable({
  loader: () => import('./components/UserSettings'),
  loading: Loading,
  timeout: 10000
});

const env = require('env2')('.env')
const DEBUG = true;
const GAPI_KEY = process.env.GAPI_KEY;
const HOSTNAME =`http://${location.hostname}`
const PORT = 8080

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      appInitialized: null,
      menuLoad: false,
      allApparatus: null,
      allCarriers: null,
      allStations: null,
      dispatchData: null,
      dispatchHistory: null,
      userInfo: null,
      userApparatusTracking: null,
      userStationTracking: null,
      userNotificationStatus: null,
      userApparatusAssignment: null,
      userStationAssignment: null,
      userIsAdmin: false,
      userID: null,
      users: [],
      refreshDispatch: 0,
      responseData: null,
      slug: null,
      toggleDBSave: false
    };

    this.modifyNotificationStatus = this.modifyNotificationStatus.bind(this);
    this.modifyApparatusAssignment = this.modifyApparatusAssignment.bind(this);
    this.modifyStationAssignment = this.modifyStationAssignment.bind(this);
    this.buildApparatusAssigment = this.buildApparatusAssigment.bind(this);
    this.buildStationAssigment = this.buildStationAssigment.bind(this);
    this.initializeApp = this.initializeApp.bind(this);
    this.updateDispatch = this.updateDispatch.bind(this);
  }

  componentDidMount() {
    var urlPathname;

    if (!this.props.location || this.props.location.pathname === '/') {
       urlPathname = '/519/2'
    } else {
       urlPathname = this.props.location.pathname
    }

    let { userID, slug } = this.state;
    slug = urlPathname.split('/')[1];
    userID = urlPathname.split('/')[2];
    this.initializeApp(slug, userID);
  }

  async initializeApp(incId, userId){

    //get Current Dispatch
    let dispatch = await axios.get(`${HOSTNAME}:${PORT}/d/${incId}/${userId}`).then(res => res.data); // TODO: remove hard coded user and incident
    //set state immediately for integral dispatch data
    this.setState({
      dispatchData: dispatch.data.inc,
      responseData: dispatch.data.resp || '',
      userNotificationStatus: dispatch.data.user['is_sleeping'],
      userInfo: dispatch.data.user,
      userIsAdmin: dispatch.data.user['is_admin'],
      slug: dispatch.data.inc['inc_id'],
      userID: userId,
      appInitialized: false,
      menuLoad: true,
    }, (DEBUG) => {if (DEBUG) console.log('initial payload: ', this.state)})

    // get Dispatch History
    // let dispatchHistoryData = await axios.get('/api/calls');
    // get stations
    let stationData = await axios.get(`${HOSTNAME}:${PORT}/api/stations/${dispatch.data.dept.dept_id}`).then(res => res.data);
    // get All Station Apparatus
    let apparatusData = await axios.get(`${HOSTNAME}:${PORT}/api/apparatus/${dispatch.data.dept.dept_id}`).then(res => res.data);
    // get All Carriers
    let carrierData = await axios.get(`${HOSTNAME}:${PORT}/api/carriers`).then(res => res.data);

    // get User Tracking
    let trackingData = await axios.get(`${HOSTNAME}:${PORT}/api/users/track/${userId}`) //TODO: remove hardcoded user (nfd)
    .then( res => res.data )
    .catch( err => err )

    // // build collection for rendering apparatus
    let userApparatusAssignmentData = await this.buildApparatusAssigment(apparatusData, trackingData.track_user_app);
    // // build collection for rendering stations
    let userStationAssignmentData = await this.buildStationAssigment(stationData, trackingData.track_user_sta);

    // // set state for rest of app. all data is loaded
    this.setState({
      dispatchHistory: [],
      allStations: stationData,
      allApparatus: apparatusData,
      allCarriers: carrierData,
      userApparatusTracking: trackingData.track_user_app,
      userStationTracking: trackingData.track_user_sta,
      userApparatusAssignment: userApparatusAssignmentData,
      userStationAssignment: userStationAssignmentData,
      users: [],
      appInitialized: true,
    })

  }

  buildStationAssigment(allStations, userStationTracking) {
    //map across allStations to create collection of {id: [station_id], active:T/F}
    let userStationAssignment = allStations.map( sta => {

      if (userStationTracking && userStationTracking.length > 0) {
        for (let i = 0; i < userStationTracking.length; i++) {
          if( userStationTracking[i]['sta_id'] === sta['sta_id'] ) {
            return {
              id: sta['sta_id'],
              sta_abbr: sta['sta_abbr'],
              active: true
            }
          }
        }
      }

      return {
        id: sta['sta_id'],
        sta_abbr: sta['sta_abbr'],
        active: false
      }
    })

    // userStationAssignment.sort(function(a, b) {
    //   return parseInt(a.sta_id[a.length - 1]) - parseInt(b.sta_id[b.length - 1]);
    // });

    return new Promise(resolve => {
      resolve(userStationAssignment)
    })


  }

  buildApparatusAssigment(allApparatus, userApparatusTracking) {
    //map across collection of apparatus to create {id: [apparatus_id], active: T/F}
    let userApparatusAssignment = allApparatus.map( app => {

      if (userApparatusTracking && userApparatusTracking.length > 0) {
        for (let i = 0; i < userApparatusTracking.length; i++) {
          if( userApparatusTracking[i]['app_id'] === app['app_id'] ) {
            return {
              id: app['app_id'],
              app_abbr: app['app_abbr'],
              active: true
            }
          }
        }
      }

      return {
        id: app['app_id'],
        app_abbr: app['app_abbr'],
        active: false
      }
    })

    return new Promise(resolve => {
      resolve(userApparatusAssignment)
    })
  }

  async modifyNotificationStatus () {
    //get current notificiation status
    let userUpdate = {
        is_sleeping: this.state.userNotificationStatus
    }
    //update notification status
    await axios.patch(`/api/users/${this.state.userID}`, userUpdate)
               .catch(err => console.log("ERROR WITH PATCH IN modifyNotificationStatus", err))
    //fetch new user status
    let userData = await axios.get(`/api/users/${this.state.userID}`);

    this.setState({
      userNotificationStatus: !userData.data['is_sleeping'],
      userInfo: userData.data,
      userIsAdmin: userData.data['is_admin'],
    })
  }

  async modifyApparatusAssignment(e) {

    let { userID } = this.state;
    let appID = e.target.id.split('-').pop();
    let bodyDetails = {
      user_id: userID,
      app_id: appID
    }
    let shouldTurnOn;

    this.state.userApparatusAssignment.forEach(app => {
      if (parseInt(app.id) === parseInt(appID)) {
        shouldTurnOn = !app.active
      }
    })

    if (shouldTurnOn) {
      await axios.post(`${HOSTNAME}:${PORT}/api/users/track`, bodyDetails)
        .then(resp => resp.data)
        .catch(err => console.error(err))
    } else {
      await axios.delete(`${HOSTNAME}:${PORT}/api/users/track/`, { data: bodyDetails })
      .then(resp => resp.data)
      .catch(err => console.error(err))
    }

    // returns {track_user_dept: Array(1), track_user_sta: Array(1), track_user_app: Array(0)}
    let userTracks = await axios.get(`${HOSTNAME}:${PORT}/api/users/track/${userID}`)
      .then(resp => resp.data)

    //rebuild assignments for rerender
    let userApparatusAssignmentData = await this.buildApparatusAssigment(this.state.allApparatus, userTracks.track_user_app);
    this.toggleDBSave();
    this.setState({
      userApparatusTracking: userTracks.track_user_app,
      userApparatusAssignment: userApparatusAssignmentData,
    })
  }

  async modifyStationAssignment(e) {
    let { userID } = this.state;
    let staID = e.target.id.split('-').pop();
    let bodyDetails = {
      user_id: userID,
      sta_id: staID
    }
    let shouldTurnOn;
    this.state.userStationAssignment.forEach(sta => {
      if (parseInt(sta.id) === parseInt(staID)) {
        shouldTurnOn = !sta.active
      }
    })
    // if user toggled subscription on
    if (shouldTurnOn) {
      // post record tracking station
      await axios.post(`${HOSTNAME}:${PORT}/api/users/track`, bodyDetails)
      .then(resp => resp.data)
      .catch(err => console.error(err))
    } else { // else remove subscription
      await axios.delete(`${HOSTNAME}:${PORT}/api/users/track/`, {data: bodyDetails})
      .then(resp => resp.data)
      .catch(err => console.error(err))
    }

    // fetch new results reflecting change from above patch
    // returns {track_user_dept: Array(1), track_user_sta: Array(1), track_user_app: Array(0)}
    let userTracks = await axios.get(`${HOSTNAME}:${PORT}/api/users/track/${userID}`)
                                .then(resp => resp.data)
    // rebuild assignments for rerender
    let userStationAssignmentData = await this.buildStationAssigment(this.state.allStations, userTracks.track_user_sta);
    let userApparatusAssignmentData = await this.buildApparatusAssigment(this.state.allApparatus, userTracks.track_user_app);
    this.toggleDBSave();

    this.setState({
      userApparatusTracking: userTracks.track_user_app,
      userStationTracking: userTracks.track_user_sta,
      userApparatusAssignment: userApparatusAssignmentData,
      userStationAssignment: userStationAssignmentData,
    })
  }

  async toggleDBSave() {
    let context = this;
    this.setState({toggleDBSave: !this.state.toggleDBSave})
    setTimeout(()=>{
      context.setState({
          toggleDBSave: !context.state.toggleDBSave,
        });

    }, 1100)

  }

  updateDispatch(dispatch) {
    this.setState({ dispatchData: dispatch })
  }

  // shouldComponentUpdate(nextProps, nextState){
  //   if (this.state.appInitialized === false) {
  //     return false;
  //   } else {
  //     return true;
  //   }

  // }

  render() {

    const AppContainer = styled.div`
        display: grid;
        width: 100vw;
        background-color: white;
        height: auto;
        margin: auto;
        max-width: 1200px;
        grid-template-areas: 'menu'
                             'app ';
        /* #### Mobile Phones Portrait #### */
        @media screen and (max-device-width: 480px)
                      and (orientation: portrait){
          background-color: white;
          margin: -10px -10px 100px -10px;
          height: auto;
          grid-template-columns: 1fr;
          grid-template-areas: 'app '
                               'menu';
        }

        @media only screen and (min-device-width: 480px)
                   and (max-device-width: 800px)
                   and (orientation: landscape) {
          background-color: white;
          margin: -10px -10px 100px -10px;
          height: auto;
          grid-template-columns: 1fr;
          grid-template-areas: 'app '
                               'menu';
        }

        /* #### Tablets Portrait or Landscape #### */
        @media screen and (min-device-width: 768px) and (max-device-width: 1050px){
          background-color: white;
          height: auto;
          margin-top: -10px;
          margin-bottom: 100px;
          margin-left: -10px;
          margin-right: -10px;
          grid-template-areas: 'app '
                               'menu';
        }

    `;

    const AppContent = styled.div`
      grid-area: app;
      box-shadow: -3px -3px .7em darkgrey, 3px 3px .7em darkgrey;
      border-radius: 15px;
    `;

    return (

      <div>

        { !this.state.dispatchData ? null : (
          <AppContainer>

          <Menu
            ns={this.state.userNotificationStatus}
            mns={this.modifyNotificationStatus}
            isAdmin={true}//this.state.userIsAdmin
            menuLoad={this.state.menuLoad}
            />

          <AppContent>


             <Route
               exact path="/"
               render={ routeProps =>
                <Dispatch {...routeProps}
                dispatchData={this.state.dispatchData}
                updateDispatch={this.updateDispatch}
                responseData={this.state.responseData}
                userData={this.state.userInfo}
                notificationStatus={this.state.userNotificationStatus}
                modifyNotificationStatus={this.modifyNotificationStatus}
                isAdmin={this.state.userIsAdmin}
                 /> }
             />

             {/* <Route
               exact path="/dispatch-history"
               render={ routeProps =>
                 <DispatchHistory {...routeProps}
                   dispatchHistory={this.state.dispatchHistory}
                   notificationStatus={this.state.userNotificationStatus}
                   modifyNotificationStatus={this.modifyNotificationStatus}
                   isAdmin={this.state.userIsAdmin}
                 /> }
             /> */}

             <Route
               exact path="/users"
               render={ routeProps =>
                 <Users {...routeProps}
                   users={this.state.users}
                   notificationStatus={this.state.userNotificationStatus}
                   modifyNotificationStatus={this.modifyNotificationStatus}
                   allCarriers={this.state.allCarriers}
                   isAdmin={this.state.userIsAdmin}
                 /> }
             />

             <Route
               exact path="/user-settings"
               render={ routeProps =>
                 <UserSettings {...routeProps}
                   allCarriers={this.state.allCarriers}
                   userInfo={this.state.userInfo}
                   userStationAssignment={this.state.userStationAssignment}
                   userApparatusAssignment={this.state.userApparatusAssignment}
                   notificationStatus={this.state.userNotificationStatus}
                   modifyNotificationStatus={this.modifyNotificationStatus}
                   modifyApparatusAssignment={this.modifyApparatusAssignment}
                   modifyStationAssignment={this.modifyStationAssignment}
                   isAdmin={this.state.userIsAdmin}
                   toggleDBSave={this.state.toggleDBSave}
                 /> }
             />

             <Route
               exact path="/:slug/:userID"
               render={ routeProps =>
                 <Dispatch {...routeProps}
                   dispatchData={this.state.dispatchData}
                   responseData={this.state.responseData}
                   notificationStatus={this.state.userNotificationStatus}
                   modifyNotificationStatus={this.modifyNotificationStatus}
                   userData={this.state.userInfo}
                   isAdmin={this.state.userIsAdmin}
                 /> }
             />

             <Route
               exact path="/oops"
               render={ routeProps => <Oops {...routeProps}
               /> }
             />


           </AppContent>

         </AppContainer>

        )}

     </div>

    )
  }
}
