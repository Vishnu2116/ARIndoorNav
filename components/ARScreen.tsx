import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Easing,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getNextWaypoint } from "../utils/getNextWaypoint";
import routeData from "../assets/route";

const coordinates: [number, number][] =
  routeData.features[0].geometry.coordinates;

const { width, height } = Dimensions.get("window");

const ARScreen = () => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [bearing, setBearing] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [permission, requestPermission] = useCameraPermissions();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Request permissions and subscribe to location + heading
  useEffect(() => {
    let locationSub: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationHeadingSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission not granted");
        return;
      }

      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) {
          alert("Camera permission not granted");
          return;
        }
      }

      locationSub = await Location.watchPositionAsync(
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
          setLocation(currentLoc);

          const { bearing, nextIndex } = getNextWaypoint(
            currentLoc,
            coordinates,
            currentIndex
          );
          setBearing(bearing);
          setCurrentIndex(nextIndex);
        }
      );

      headingSub = await Location.watchHeadingAsync((result) => {
        const headingValue = result.trueHeading ?? result.magHeading ?? 0;
        setHeading(headingValue);
      });
    })();

    return () => {
      locationSub?.remove();
      headingSub?.remove();
    };
  }, [currentIndex]);

  const relativeAngle = (bearing - heading + 360) % 360;

  // Rotate arrow smoothly
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: relativeAngle,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }, [relativeAngle]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.text}>We need camera permission to show AR</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" />

      {location ? (
        <>
          <Animated.Image
            source={require("../assets/arrow.png")}
            style={[styles.arrow, { transform: [{ rotate }] }]}
          />
          <View style={styles.infoBox}>
            <Text style={styles.text}>Lat: {location[1].toFixed(5)}</Text>
            <Text style={styles.text}>Lon: {location[0].toFixed(5)}</Text>
            <Text style={styles.text}>
              Bearing to next: {bearing.toFixed(2)}°
            </Text>
            <Text style={styles.text}>
              Device heading: {heading.toFixed(2)}°
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.text}>📍 Locating...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  camera: {
    position: "absolute",
    width: width,
    height: height,
    zIndex: 0,
  },
  arrow: {
    position: "absolute",
    top: height / 2 - 50,
    left: width / 2 - 50,
    width: 100,
    height: 100,
    zIndex: 10,
  },
  infoBox: {
    position: "absolute",
    bottom: 60,
    left: 20,
    zIndex: 20,
  },
  text: {
    color: "white",
    fontSize: 16,
    marginVertical: 2,
  },
});

export default ARScreen;
