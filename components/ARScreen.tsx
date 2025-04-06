// components/ARScreen.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ARScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔍 AR View Activated</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: { color: "white", fontSize: 24 },
});

export default ARScreen;
