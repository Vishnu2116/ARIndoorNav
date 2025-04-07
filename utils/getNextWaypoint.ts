/**
 * Calculate the Haversine distance between two coordinates (in meters).
 */
export function getDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate the bearing (angle) from point A to point B.
 */
export function getBearing(
  from: [number, number],
  to: [number, number]
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const [lon1, lat1] = from.map(toRad);
  const [lon2, lat2] = to.map(toRad);

  const dLon = lon2 - lon1;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Determine the next waypoint and bearing for navigation.
 */
export function getNextWaypoint(
  userLocation: [number, number],
  routeCoords: [number, number][],
  lastPassedIndex: number = 0
): {
  point: [number, number];
  bearing: number;
  nextIndex: number;
} {
  const threshold = 2; // meters to skip to next point if close

  let closestIndex = lastPassedIndex;
  let minDistance = Infinity;

  // Find the closest upcoming waypoint
  for (let i = lastPassedIndex; i < routeCoords.length; i++) {
    const dist = getDistanceMeters(userLocation, routeCoords[i]);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }

  // Advance to next if within the threshold distance
  if (
    closestIndex + 1 < routeCoords.length &&
    getDistanceMeters(userLocation, routeCoords[closestIndex]) < threshold
  ) {
    closestIndex++;
  }

  const targetPoint = routeCoords[closestIndex];
  const bearing = getBearing(userLocation, targetPoint);

  return {
    point: targetPoint,
    bearing,
    nextIndex: closestIndex,
  };
}
