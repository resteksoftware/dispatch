/**
 * UtilityZone functions used to determine utilityZone
 * this code is a copy of routes/util/geofenceUtils.js
 */

 export function buildGeoFence(n, lat, lng, dist) {
    let geoFence = [];
    let fenceSides = n || 4;
    let bearing = 0;
    let increment = 360/fenceSides;

    for (let i = 0; i < fenceSides; i++) {
      let point = getCoordinateOffset(lat, lng, bearing, dist)
      geoFence.push(point);
      bearing = bearing + increment
    }

    return geoFence
  }

  export function didEnterFence(point, fence){
    let x = point[0];
    let y = point[1];
    let inFence = false;

    for (let i = 0, j = fence.length - 1; i < fence.length; j = i++) {
      let xi = fence[i][0], yi = fence[i][1];
      let xj = fence[j][0], yj = fence[j][1];

      let intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inFence = !inFence;
    }
    return inFence;
  }

  function getCoordinateOffset(latitude, longitude, bearing, distance) {
    // Distance is in miles.
    var radius = 3963.1676;
    // distance is in km.
    // radius = 6378.1;

    //	New latitude in degrees.
    var new_latitude = rad2deg(Math.asin(Math.sin(deg2rad(latitude)) * Math.cos(distance / radius) + Math.cos(deg2rad(latitude)) * Math.sin(distance / radius) * Math.cos(deg2rad(bearing))));

    //	New longitude in degrees.
    var new_longitude = rad2deg(deg2rad(longitude) + Math.atan2(Math.sin(deg2rad(bearing)) * Math.sin(distance / radius) * Math.cos(deg2rad(latitude)), Math.cos(distance / radius) - Math.sin(deg2rad(latitude)) * Math.sin(deg2rad(new_latitude))));

    return [new_latitude, new_longitude];
  }

  function rad2deg(radian){
    return radian * 57.295779513
  }

  function deg2rad(degree){
    return degree * 0.01745329252
  }
