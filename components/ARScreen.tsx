import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import * as Location from "expo-location";
import { getNextWaypoint } from "../utils/getNextWaypoint";
import routeData from "../assets/route"; // JS object version of route.geojson

const coordinates: [number, number][] =
  routeData.features[0].geometry.coordinates;

const ARScreen = () => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [bearing, setBearing] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let locationSub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission not granted");
        return;
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

          Animated.timing(rotateAnim, {
            toValue: bearing,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      );
    })();

    return () => {
      if (locationSub) locationSub.remove();
    };
  }, [currentIndex]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {location ? (
        <>
          <Animated.Image
            source={require("../assets/arrow.png")}
            style={[styles.arrow, { transform: [{ rotate }] }]}
          />
          <Text style={styles.text}>Lat: {location[1].toFixed(5)}</Text>
          <Text style={styles.text}>Lon: {location[0].toFixed(5)}</Text>
          <Text style={styles.text}>Bearing: {bearing.toFixed(2)}°</Text>
        </>
      ) : (
        <Text style={styles.text}>Locating...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  text: {
    color: "white",
    fontSize: 18,
    marginTop: 4,
  },
});

export default ARScreen;
