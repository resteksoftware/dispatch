/*
 * src/util/callTypeColor.js
 *
 * @Params: {string} call type
 * @Returns: {string} color
 *
 */

const RED = [
  'BOX ALARM',
  'MVA WITH INJURIES-FD',
  'REPORTED STRUCTURE FIRE',
  'CONFIRMED STRUCTURE FIRE',
  'AIRPORT',
  'MAJOR MVA-FD',
  'TECHNICAL RESCUE'
]

const ORANGE = [
  'MINOR ALARM',
  'MINOR HAZMAT'
]

const GREEN = [
  'STILL ALARM',
  'ELEVATOR/LOCKOUT/LOCKIN'
]

const BLUE = ['0800 HOUR TEST']

const callTypeToColors = (callType) => {
  if (RED.includes(callType)) {
    return 'firebrick'
  } else if (ORANGE.includes(callType)) {
    return 'darkorange'
  } else if (GREEN.includes(callType)) {
    return 'green'
  } else if (BLUE.includes(callType)) {
    return 'dodgerblue'
  } else {
    return 'rosybrown'
  }
}

module.exports = callTypeToColors
