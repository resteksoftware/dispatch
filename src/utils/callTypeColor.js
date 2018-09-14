/*
 * src/util/callTypeColor.js
 *
 * @Params: {string} call type
 * @Returns: {string} color
 *
 */

 const DARKRED = [
   'REPORTED STRUCTURE FIRE',
   'CONFIRMED STRUCTURE FIRE',
   'CONFIRMED WORKING FIRE'
 ]

const RED = [
  'BOX ALARM',
  'MVA WITH INJURIES-FD',
  'MAJOR MVA - FD',
  'AIRPORT',
  'MAJOR MVA-FD',
  'TECHNICAL RESCUE',
]

const ORANGE = [
  'MINOR ALARM',
  'MINOR HAZMAT'
]

const GREEN = [
  'STILL ALARM',
  'ELEVATOR/LOCKOUT/LOCKIN',
  'ELEVATOR / LOCKOUT / LOCKIN'
]

const darkredGradient = `
  background: rgba(153,3,38,1);
  background: -moz-linear-gradient(top, rgba(153,3,38,1) 0%, rgba(31,0,7,1) 100%);
  background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(153,3,38,1)), color-stop(100%, rgba(31,0,7,1)));
  background: -webkit-linear-gradient(top, rgba(153,3,38,1) 0%, rgba(31,0,7,1) 100%);
  background: -o-linear-gradient(top, rgba(153,3,38,1) 0%, rgba(31,0,7,1) 100%);
  background: -ms-linear-gradient(top, rgba(153,3,38,1) 0%, rgba(31,0,7,1) 100%);
  background: linear-gradient(to bottom, rgba(153,3,38,1) 0%, rgba(31,0,7,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#990326', endColorstr='#1f0007', GradientType=0 );
`;

const orangeGradient = `
  background: rgba(255,166,0,1);
  background: -moz-linear-gradient(top, rgba(255,166,0,1) 0%, rgba(238,119,0,1) 100%);
  background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(255,166,0,1)), color-stop(100%, rgba(238,119,0,1)));
  background: -webkit-linear-gradient(top, rgba(255,166,0,1) 0%, rgba(238,119,0,1) 100%);
  background: -o-linear-gradient(top, rgba(255,166,0,1) 0%, rgba(238,119,0,1) 100%);
  background: -ms-linear-gradient(top, rgba(255,166,0,1) 0%, rgba(238,119,0,1) 100%);
  background: linear-gradient(to bottom, rgba(255,166,0,1) 0%, rgba(238,119,0,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffa600', endColorstr='#ee7700', GradientType=0 );
`;

const firebrickGradient = `
  background: rgba(242,48,48,1);
  background: -moz-linear-gradient(top, rgba(242,48,48,1) 0%, rgba(178,34,34,1) 100%);
  background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(242,48,48,1)), color-stop(100%, rgba(178,34,34,1)));
  background: -webkit-linear-gradient(top, rgba(242,48,48,1) 0%, rgba(178,34,34,1) 100%);
  background: -o-linear-gradient(top, rgba(242,48,48,1) 0%, rgba(178,34,34,1) 100%);
  background: -ms-linear-gradient(top, rgba(242,48,48,1) 0%, rgba(178,34,34,1) 100%);
  background: linear-gradient(to bottom, rgba(242,48,48,1) 0%, rgba(178,34,34,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f23030', endColorstr='#b22222', GradientType=0 );
`;

const greenGradient = `
  background: rgba(39,174,95,1);
  background: -moz-linear-gradient(top, rgba(39,174,95,1) 0%, rgba(25,107,59,1) 100%);
  background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(39,174,95,1)), color-stop(100%, rgba(25,107,59,1)));
  background: -webkit-linear-gradient(top, rgba(39,174,95,1) 0%, rgba(25,107,59,1) 100%);
  background: -o-linear-gradient(top, rgba(39,174,95,1) 0%, rgba(25,107,59,1) 100%);
  background: -ms-linear-gradient(top, rgba(39,174,95,1) 0%, rgba(25,107,59,1) 100%);
  background: linear-gradient(to bottom, rgba(39,174,95,1) 0%, rgba(25,107,59,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#27ae5f', endColorstr='#196b3b', GradientType=0 );
`;

const blueGradient = `
  background: rgba(73,155,234,1);
  background: -moz-linear-gradient(top, rgba(73,155,234,1) 0%, rgba(22,95,173,1) 100%);
  background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(73,155,234,1)), color-stop(100%, rgba(22,95,173,1)));
  background: -webkit-linear-gradient(top, rgba(73,155,234,1) 0%, rgba(22,95,173,1) 100%);
  background: -o-linear-gradient(top, rgba(73,155,234,1) 0%, rgba(22,95,173,1) 100%);
  background: -ms-linear-gradient(top, rgba(73,155,234,1) 0%, rgba(22,95,173,1) 100%);
  background: linear-gradient(to bottom, rgba(73,155,234,1) 0%, rgba(22,95,173,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#499bea', endColorstr='#165fad', GradientType=0 );
`;

const greyGradient = `
  background: rgba(209,207,209,1);
  background: -moz-linear-gradient(top, rgba(209,207,209,1) 0%, rgba(158,158,158,1) 47%, rgba(82,82,82,1) 100%);
  background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(209,207,209,1)), color-stop(47%, rgba(158,158,158,1)), color-stop(100%, rgba(82,82,82,1)));
  background: -webkit-linear-gradient(top, rgba(209,207,209,1) 0%, rgba(158,158,158,1) 47%, rgba(82,82,82,1) 100%);
  background: -o-linear-gradient(top, rgba(209,207,209,1) 0%, rgba(158,158,158,1) 47%, rgba(82,82,82,1) 100%);
  background: -ms-linear-gradient(top, rgba(209,207,209,1) 0%, rgba(158,158,158,1) 47%, rgba(82,82,82,1) 100%);
  background: linear-gradient(to bottom, rgba(209,207,209,1) 0%, rgba(158,158,158,1) 47%, rgba(82,82,82,1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#d1cfd1', endColorstr='#525252', GradientType=0 );
`

const BLUE = ['0800 HOUR TEST']

const callTypeToColors = (callType) => {
  if (DARKRED.includes(callType)) {
    return darkredGradient
  } else if (RED.includes(callType)) {
    return firebrickGradient
  } else if (ORANGE.includes(callType)) {
    return orangeGradient
  } else if (GREEN.includes(callType)) {
    return greenGradient
  } else if (BLUE.includes(callType)) {
    return blueGradient
  } else {
    return greyGradient
  }
}



module.exports = callTypeToColors
