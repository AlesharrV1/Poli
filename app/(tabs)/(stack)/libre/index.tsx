import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Entypo, FontAwesome6, Foundation, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 Importante
import { backend } from "@/app/common/backend";
import { useRouter } from "expo-router";

type PuntoTuristico = {
  Tipo: string;
  PuntoHist_ID: string;
  Nombre: string;
  Localidad: string;
  Latitud: string;
  Longitud: string;
};

// Define los iconos igual que en el mapa
const iconos = {
  default: require("../../../../assets/images/mapsIcons/icon-default.png"),
  museo: require("../../../../assets/images/mapsIcons/icon-museo.png"),
  iglesia: require("../../../../assets/images/mapsIcons/icon-iglesia.png"),
};

const getDistanceFromLatLonInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Libre = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [rango, setRango] = useState("30");
  const [puntosCercanos, setPuntosCercanos] = useState<PuntoTuristico[]>([]);
  const router = useRouter();

  // 🔁 Cargar valor guardado al iniciar
  useEffect(() => {
    AsyncStorage.getItem("estadoSwitch").then((valor) => {
      if (valor !== null) {
        setIsEnabled(valor === "true");
      }
    });
  }, []);

  // 💾 Guardar cada vez que se cambie
  useEffect(() => {
    AsyncStorage.setItem("estadoSwitch", isEnabled.toString());
  }, [isEnabled]);

  useEffect(() => {
    if (isEnabled) {
      obtenerPuntosCercanos();
    } else {
      setPuntosCercanos([]);
    }
  }, [isEnabled, rango]);

  const obtenerPuntosCercanos = async () => {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== "granted") {
      console.error("Permiso denegado");
      return;
    }

    const ubicacion = await Location.getCurrentPositionAsync({});
    const lat = ubicacion.coords.latitude;
    const lon = ubicacion.coords.longitude;

    try {
      const res = await fetch(`http://${backend}:3000/api/puntos-turisticos`);
      const data: PuntoTuristico[] = await res.json();

      const filtrados = data.filter((p) => {
        const distancia = getDistanceFromLatLonInMeters(
          lat,
          lon,
          parseFloat(p.Latitud),
          parseFloat(p.Longitud)
        );
        return distancia <= parseInt(rango || "30");
      });

      setPuntosCercanos(filtrados);
    } catch (error) {
      console.error("Error al obtener puntos:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.barra, { marginTop: 50 }]}>
        <View style={styles.barra3}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </View>
          <View style={styles.barra2}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Activar Turismo libre
            </Text>
            <Text style={{ fontSize: 12, color: "grey" }}>
              Recibe alertas de lugares cercanos
            </Text>
          </View>
        </View>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsEnabled((prev) => !prev)}
          value={isEnabled}
          style={{ marginBottom: 10 }}
        />
      </View>

      <View style={styles.barra}>
        <View style={styles.barra3}>
          <View style={styles.iconContainer}>
            <Entypo name="bar-graph" size={24} color="black" />
          </View>
          <View style={styles.barra2}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Rango</Text>
            <Text style={{ fontSize: 12, color: "grey" }}>
              Modifica el rango de búsqueda
            </Text>
          </View>
        </View>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Max 30"
          maxLength={3}
          value={rango}
          onChangeText={setRango}
        />
      </View>

      <Text style={styles.titulo}>Lugares cercanos para visitar</Text>

      <FlatList
        data={puntosCercanos}
        keyExtractor={(item) => item.PuntoHist_ID}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/puntosInfo",
                  params: {
                    id: item.PuntoHist_ID,
                    nombre: item.Nombre,
                  },
                })
              }
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {/* Icono del tipo de punto */}
              <Image
                source={
                  iconos[
                    typeof item.Tipo === "string" &&
                    (item.Tipo.toLowerCase() === "museo" ||
                      item.Tipo.toLowerCase() === "iglesia")
                      ? (item.Tipo.toLowerCase() as "museo" | "iglesia")
                      : "default"
                  ]
                }
                style={{ width: 28, height: 28, marginRight: 8 }}
                resizeMode="contain"
              />
              <View>
                <Text style={{ fontSize: 16 }}>{item.Nombre}</Text>
                <Text style={{ color: "gray" }}>{item.Localidad}</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/mapa",
                  params: {
                    lat: item.Latitud,
                    lng: item.Longitud,
                    nombre: item.Nombre,
                  },
                })
              }
            >
              <FontAwesome6 name="map-location-dot" size={24} color="black" />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
};

export default Libre;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  iconContainer: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  barra: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "80%",
  },
  barra2: {
    display: "flex",
    justifyContent: "center",
  },
  barra3: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    width: "80%",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
    width: 65,
    height: 45,
    textAlign: "center",
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: 300,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
});
