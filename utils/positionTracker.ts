import * as Location from "expo-location";
import { Magnetometer, Accelerometer } from "expo-sensors";

export interface TrackedPosition {
  location: [number, number];
  heading: number;
}

let watchLocationSub: Location.LocationSubscription | null = null;
let heading: number = 0;

export async function startTracking(
  onUpdate: (position: TrackedPosition) => void
) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location was denied");
    return;
  }

  // Start location tracking
  watchLocationSub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 0.5,
      timeInterval: 500,
    },
    (loc) => {
      const currentLoc: [number, number] = [
        loc.coords.longitude,
        loc.coords.latitude,
      ];
      onUpdate({ location: currentLoc, heading });
    }
  );

  // Start heading tracking
  Magnetometer.setUpdateInterval(500);
  Magnetometer.addListener((data) => {
    const angle = calculateHeading(data);
    if (!isNaN(angle)) heading = angle;
  });
}

export function stopTracking() {
  if (watchLocationSub) {
    watchLocationSub.remove();
    watchLocationSub = null;
  }
  Magnetometer.removeAllListeners();
}

function calculateHeading(data: { x: number; y: number; z: number }): number {
  let { x, y } = data;
  let angle = Math.atan2(y, x);
  angle = angle * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}
