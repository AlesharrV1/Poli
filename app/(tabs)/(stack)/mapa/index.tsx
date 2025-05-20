import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { usePuntosStore } from "./usePuntosStore";
import { backend } from "@/app/common/backend";

const Mapa = () => {
  const localhost = backend;
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const params = useLocalSearchParams();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<Region | null>(null); // Para detectar zoom
  const { puntos, setPuntos } = usePuntosStore();

  const iconos = {
    default: require("../../../../assets/images/mapsIcons/icon-default.png"),
    museo: require("../../../../assets/images/mapsIcons/icon-museo.png"),
    iglesia: require("../../../../assets/images/mapsIcons/icon-iglesia.png"),
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const initialRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);

      // Elimina esta línea para evitar que el mapa se centre automáticamente:
      // mapRef.current?.animateToRegion(initialRegion);

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          const newRegion = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(newRegion);
        }
      );
    })();

    if (puntos.length === 0) {
      axios
        .get(`http://${localhost}:3000/api/puntos-turisticos`)
        .then((response) => {
          const puntosParseados = response.data.map((p: any) => ({
            ...p,
            Latitud: parseFloat(p.Latitud),
            Longitud: parseFloat(p.Longitud),
          }));
          setPuntos(puntosParseados);
        })
        .catch((error) => {
          console.error("Error al obtener puntos turísticos:", error);
        });
    }

    // Si vienen lat/lng por params, enfoca el mapa ahí
    if (params.lat && params.lng && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(params.lat as string),
        longitude: parseFloat(params.lng as string),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [params.lat, params.lng]);
  const [origin, setorigin] = useState({
    latitud: -17.783545512919464,
    longitud: -63.18196406102031,
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: origin.latitud,
              longitude: origin.longitud,
              latitudeDelta: 0.09,
              longitudeDelta: 0.04,
            }}
            ref={mapRef}
            style={styles.map}
            showsUserLocation={true}
            followsUserLocation={false}
            showsMyLocationButton={false}
            onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            customMapStyle={[
              {
                featureType: "poi",
                elementType: "all",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "administrative",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "road",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "transit",
                elementType: "all",
                stylers: [{ visibility: "off" }],
              },
            ]}
          >
            {puntos.map((punto) => (
              <Marker
                key={punto.PuntoHist_ID}
                image={
                  iconos[(punto.Tipo as keyof typeof iconos) ?? "default"] ||
                  iconos["default"]
                }
                coordinate={{
                  latitude: punto.Latitud,
                  longitude: punto.Longitud,
                }}
                tracksViewChanges={false}
                onPress={() =>
                  router.push({
                    pathname: "/puntosInfo",
                    params: {
                      id: punto.PuntoHist_ID,
                      nombre: punto.Nombre,
                    },
                  })
                }
              ></Marker>
            ))}
          </MapView>

          <TouchableOpacity
            style={styles.locateButton}
            onPress={() => {
              if (location) {
                mapRef.current?.animateToRegion({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }
            }}
          >
            <MaterialIcons name="my-location" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => router.push("/libre")}
          >
            <MaterialIcons name="notifications" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  floatingButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#508D44",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  locateButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1976D2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerLabelContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 5, // Space between label and marker
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default Mapa;
