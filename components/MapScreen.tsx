import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapboxGL from "@rnmapbox/maps";

interface MapScreenProps {
  centerCoordinate: [number, number];
  zoomLevel: number;
}

const MapScreen = ({ centerCoordinate, zoomLevel }: MapScreenProps) => {
  const [floorplan, setFloorplan] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        const floorplanRes = await fetch(
          "http://192.168.29.107:8081/floorplan.geojson"
        );
        const routeRes = await fetch(
          "http://192.168.29.107:8081/route.geojson"
        );

        const floorplanData = await floorplanRes.json();
        const routeData = await routeRes.json();

        setFloorplan(floorplanData);
        setRoute(routeData);
      } catch (error) {
        console.error("GeoJSON load error:", error);
      }
    };

    loadGeoJSON();
  }, []);

  if (!floorplan || !route) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Light}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          animationMode="flyTo"
          animationDuration={0} // prevent zoom animation
        />
        <MapboxGL.ShapeSource id="floorplan" shape={floorplan}>
          <MapboxGL.FillLayer
            id="floor-fill"
            style={{ fillColor: "#2196F3", fillOpacity: 0.2 }}
          />
        </MapboxGL.ShapeSource>

        <MapboxGL.ShapeSource id="route" shape={route}>
          <MapboxGL.LineLayer
            id="route-line"
            style={{ lineColor: "red", lineWidth: 3 }}
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
