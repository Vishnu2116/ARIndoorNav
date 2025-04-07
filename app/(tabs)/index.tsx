import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { DeviceMotion } from "expo-sensors";

import MapScreen from "../../components/MapScreen";
import ARScreen from "../../components/ARScreen";

MapboxGL.setAccessToken(
  "pk.eyJ1IjoicmF5YXBhdGk0OSIsImEiOiJjbGVvMWp6OGIwajFpM3luNTBqZHhweXZzIn0.1r2DoIQ1Gf2K3e5WBgDNjA"
);

export default function Home() {
  const [isARMode, setIsARMode] = useState(false);

  const cameraCenter: [number, number] = [
    78.38548426856175, 17.444894475280716,
  ];
  const zoomLevel = 20;

  useEffect(() => {
    const subscription = DeviceMotion.addListener((motion) => {
      const pitch = motion.rotation?.beta ?? 0;
      const threshold = Math.PI / 4;
      setIsARMode(Math.abs(pitch) > threshold); // upright = AR
    });

    DeviceMotion.setUpdateInterval(500);
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Mount both always — just control visibility */}
      <View
        style={[
          styles.screen,
          { display: isARMode ? "none" : "flex" }, // Map visible in flat mode
        ]}
      >
        <MapScreen centerCoordinate={cameraCenter} zoomLevel={zoomLevel} />
      </View>
      <View
        style={[
          styles.screen,
          { display: isARMode ? "flex" : "none" }, // AR visible in upright
        ]}
      >
        <ARScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
