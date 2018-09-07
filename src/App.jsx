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

const GAPI_KEY = process.env.GAPI_KEY;

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
      slug: null,
      toggleDBSave: false,
    };

    this.modifyNotificationStatus = this.modifyNotificationStatus.bind(this);
    this.modifyApparatusAssignment = this.modifyApparatusAssignment.bind(this);
    this.modifyStationAssignment = this.modifyStationAssignment.bind(this);
    this.buildApparatusAssigment = this.buildApparatusAssigment.bind(this);
    this.buildStationAssigment = this.buildStationAssigment.bind(this);
    this.initializeApp = this.initializeApp.bind(this);
  }

  componentDidMount() {
    var urlPathname;

    if (!this.props.location) {
       urlPathname = '/error/freeman';
    } else {
       urlPathname = this.props.location.pathname
    }

    let { userID, slug } = this.state;
    slug = urlPathname.split('/')[1];
    userID = urlPathname.split('/')[2];
    this.initializeApp(slug, userID);
  }

  async initializeApp(slug, userID){

    //get Current Dispatch
    let dispatchData = await axios.get(`/api/${slug}/${userID}`);
    //get User Info
    let userData = await axios.get(`/api/users/${userID}`);
    //set state immediately for integral dispatch data
    this.setState({
      dispatchData: dispatchData.data[0],
      userNotificationStatus: !userData.data['is_sleeping'],
      userInfo: userData.data,
      userIsAdmin: userData.data['is_admin'],
      slug: slug,
      userID: userID,
      appInitialized: false,
      menuLoad: true,
    })

    //get Dispatch History
    let dispatchHistoryData = await axios.get('/api/calls');
    //get stations
    let stationData = await axios.get('/api/stations');
    //get All Station Apparatus
    let apparatusData = await axios.get('/api/apparatus');
    // get All Carriers
    let carrierData = await axios.get('/api/carriers');
    //get User Apparatus Tracking
    let userApparatusTrackingData = await axios.get(`/api/track_user_apparatus/${userID}`);
    //get User Station Tracking
    let userStationTrackingData = await axios.get(`/api/track_user_station/${userID}`);
    //get all Users
    let allUserData = await axios.get(`/api/users`);
    // build collection for rendering apparatus
    let userApparatusAssignmentData = await this.buildApparatusAssigment(apparatusData.data, userApparatusTrackingData.data);
    // build collection for rendering stations
    let userStationAssignmentData = await this.buildStationAssigment(stationData.data, userStationTrackingData.data);

    // set state for rest of app. all data is loaded
    this.setState({
      dispatchHistory: dispatchHistoryData.data,
      allStations: stationData.data,
      allApparatus: apparatusData.data,
      allCarriers: carrierData.data,
      userApparatusTracking: userApparatusTrackingData.data,
      userStationTracking: userStationTrackingData.data,
      userApparatusAssignment: userApparatusAssignmentData,
      userStationAssignment: userStationAssignmentData,
      users: allUserData.data,
      appInitialized: true,
    })

  }

  buildStationAssigment(allStations, userStationTracking) {
    //map across allStations to create collection of {id: [station_id], active:T/F}
    let userStationAssignment = allStations.map( app => {

      if (userStationTracking && userStationTracking.length > 0) {
        for (let i = 0; i < userStationTracking.length; i++) {
          if( userStationTracking[i]['station_id'] === app['station_id'] ) {
            return {id: app['station_id'], active: true}
          }
        }
      }

      return {id: app['station_id'], active: false}
    })

    userStationAssignment.sort(function(a, b) {
      return parseInt(a.id[a.id.length - 1]) - parseInt(b.id[b.id.length - 1]);
    });

    return new Promise(resolve => {
      resolve(userStationAssignment)
    })


  }

  buildApparatusAssigment(allApparatus, userApparatusTracking) {
    //map across collection of apparatus to create {id: [apparatus_id], active: T/F}
    let userApparatusAssignment = allApparatus.map( app => {

      if (userApparatusTracking && userApparatusTracking.length > 0) {
        for (let i = 0; i < userApparatusTracking.length; i++) {
          if( userApparatusTracking[i]['apparatus_id'] === app['apparatus_id'] ) {
            return {id: app['apparatus_id'], active: true}
          }
        }
      }

      return {id: app['apparatus_id'], active: false}
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
    //make change
    await axios.patch(`/api/track_user_apparatus/${userID}/${appID}`)
               .catch((error) => {console.error(`ERROR in PATCH for user/apparatus assignment: ${error}`)})
    //fetch new results reflecting change from above patch
    let userApparatusTrackingData = await axios.get(`/api/track_user_apparatus/${userID}`)
    //rebuild assignments for rerender
    let userApparatusAssignmentData = await this.buildApparatusAssigment(this.state.allApparatus, userApparatusTrackingData.data);
    this.toggleDBSave();
    this.setState({
      userApparatusTracking: userApparatusTrackingData.data,
      userApparatusAssignment: userApparatusAssignmentData,
    })
  }

  async modifyStationAssignment(e) {
    let { userID } = this.state;
    let staID = e.target.id.split('-').pop();
    //make change
    await axios.patch(`/api/track_user_station/${userID}/${staID}`)
               .catch((error) => {console.error(`ERROR in PATCH for user/station assignment: ${error}`)})
    //fetch new results reflecting change from above patch
    let userStationTrackingData = await axios.get(`/api/track_user_station/${userID}`)
    let userApparatusTrackingData = await axios.get(`/api/track_user_apparatus/${userID}`)
    //rebuild assignments for rerender
    let userStationAssignmentData = await this.buildStationAssigment(this.state.allStations, userStationTrackingData.data);
    let userApparatusAssignmentData = await this.buildApparatusAssigment(this.state.allApparatus, userApparatusTrackingData.data);
    this.toggleDBSave();
    this.setState({
      userApparatusTracking: userApparatusTrackingData.data,
      userStationTracking: userStationTrackingData.data,
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

  shouldComponentUpdate(nextProps, nextState){
    if (this.state.appInitialized === false) {
      return false;
    } else {
      return true;
    }

  }

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
                   notificationStatus={this.state.userNotificationStatus}
                   modifyNotificationStatus={this.modifyNotificationStatus}
                   isAdmin={this.state.userIsAdmin}
                 /> }
             />

             <Route
               exact path="/dispatch-history"
               render={ routeProps =>
                 <DispatchHistory {...routeProps}
                   dispatchHistory={this.state.dispatchHistory}
                   notificationStatus={this.state.userNotificationStatus}
                   modifyNotificationStatus={this.modifyNotificationStatus}
                   isAdmin={this.state.userIsAdmin}
                 /> }
             />

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
                   notificationStatus={this.state.userNotificationStatus}
                   modifyNotificationStatus={this.modifyNotificationStatus}
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
