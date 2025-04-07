import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";

import floorplanData from "../assets/floorplan";
import routeData from "../assets/route";

interface MapScreenProps {
  centerCoordinate: [number, number];
  zoomLevel: number;
}

const MapScreen = ({ centerCoordinate, zoomLevel }: MapScreenProps) => {
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);
  const initialSet = useRef(false); // Use useRef to track the initial camera setup

  const coordinates = routeData.features[0].geometry.coordinates;
  const startPoint = coordinates[0];
  const endPoint = coordinates[coordinates.length - 1];

  // Store the initial camera position and zoom
  const cameraPosition = useRef({
    centerCoordinate,
    zoomLevel,
  });

  useEffect(() => {
    let isMounted = true;
    let locationSub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      locationSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1,
          timeInterval: 500,
        },
        (loc) => {
          if (isMounted) {
            const position: [number, number] = [
              loc.coords.longitude,
              loc.coords.latitude,
            ];
            setCurrentLocation(position);
          }
        }
      );
    })();

    return () => {
      isMounted = false;
      if (locationSub) locationSub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Light}>
        {/* Only apply the flyTo once on the first load */}
        {!initialSet.current && (
          <MapboxGL.Camera
            zoomLevel={cameraPosition.current.zoomLevel}
            centerCoordinate={cameraPosition.current.centerCoordinate}
            animationMode="flyTo"
            animationDuration={1000}
            onDidFinishLoading={() => {
              initialSet.current = true;
            }}
          />
        )}

        <MapboxGL.ShapeSource id="floorplan" shape={floorplanData}>
          <MapboxGL.FillLayer
            id="floor-fill"
            style={{ fillColor: "#2196F3", fillOpacity: 0.2 }}
          />
        </MapboxGL.ShapeSource>

        <MapboxGL.ShapeSource id="route" shape={routeData}>
          <MapboxGL.LineLayer
            id="route-line"
            style={{ lineColor: "red", lineWidth: 3 }}
          />
        </MapboxGL.ShapeSource>

        <MapboxGL.PointAnnotation id="start" coordinate={startPoint}>
          <View style={styles.startMarker} />
        </MapboxGL.PointAnnotation>

        <MapboxGL.PointAnnotation id="end" coordinate={endPoint}>
          <View style={styles.endMarker} />
        </MapboxGL.PointAnnotation>

        {currentLocation && (
          <MapboxGL.PointAnnotation id="user" coordinate={currentLocation}>
            <View style={styles.userMarker} />
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  startMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "green",
  },
  endMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
  },
  userMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4287f5",
    borderColor: "#fff",
    borderWidth: 2,
  },
});

export default MapScreen;
