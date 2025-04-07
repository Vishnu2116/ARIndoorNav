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
    //for changing view based on angle
    const subscription = DeviceMotion.addListener((motion) => {
      const pitch = motion.rotation?.beta ?? 0;
      const threshold = Math.PI / 4;

      if (Math.abs(pitch) < threshold) {
        setIsARMode(false); // flat = map
      } else {
        setIsARMode(true); // upright = AR
      }
    });

    DeviceMotion.setUpdateInterval(500);
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={isARMode ? styles.hidden : styles.visible}>
        <MapScreen centerCoordinate={cameraCenter} zoomLevel={zoomLevel} />
      </View>
      <View style={isARMode ? styles.visible : styles.hidden}>
        <ARScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  visible: { flex: 1 },
  hidden: { flex: 0, height: 0, overflow: "hidden" },
});
