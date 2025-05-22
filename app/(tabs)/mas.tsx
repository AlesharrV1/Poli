import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

const mas = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Más sobre Santa Cruz
        </Text>
        <TouchableOpacity style={styles.btn}>
          <AntDesign name="team" size={24} color="black" />
          <Text style={{ fontSize: 12, textAlign: "center", color: "black" }}>
            Mitos y Leyendas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <MaterialCommunityIcons
            name="food-takeout-box"
            size={24}
            color="black"
          />
          <Text style={{ fontSize: 12, textAlign: "center", color: "black" }}>
            Comidas tipicas
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default mas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  btn: {
    height: 150,
    // width: 150,
    backgroundColor: "#e7e7e7",
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
});
