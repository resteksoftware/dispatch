var sequelizeLogger = function(log) {
  console.log(log);
}

module.exports = {
  app: false,
  models: {
    index: false //use sequelizeLogger if true
  },
  routes : {
    admin: false,
    apparatus: null,
    calls: false,
    carriers: false,
    station_apparatus: false,
    stations: null,
    track_user_apparatus: false,
    track_user_stations: false,
    users: false,
    util: {
      sendEmailMailgun: false,
      sendEmailPooledRustybear: false,
      sendEmailRustybear: false,
      sendTwilio: false
    }
  }
}
