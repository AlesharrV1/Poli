import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  Modal,
  Button,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
  Polyline,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { usePuntosStore } from "./usePuntosStore";
import { backend } from "@/app/common/backend";
interface PuntoTuristico {
  PuntoHist_ID: string;
  Nombre: string;
  Latitud: number;
  Longitud: number;
  Tipo?: string;
  imagenes?: imagenes[];
}
interface imagenes {
  URL: string;
}
const Mapa = () => {
  const GOOGLE_API_KEY = "AIzaSyCA16ht6Gp2Xe2J9gUMQdIS5eusx6TvPs0"; // 🔑 reemplaza con tu API Key real
  const [rutaCoords, setRutaCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [rutaActiva, setRutaActiva] = useState(false);

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
  const [puntoSeleccionado, setPuntoSeleccionado] =
    useState<PuntoTuristico | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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
  const obtenerRuta = async () => {
    if (!location || !puntoSeleccionado) {
      console.warn("❗ No hay ubicación o punto seleccionado");
      return;
    }

    const origen = `${location.coords.latitude},${location.coords.longitude}`;
    const destino = `${puntoSeleccionado.Latitud},${puntoSeleccionado.Longitud}`;
    const modo = "walking";

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origen}&destination=${destino}&mode=${modo}&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      // console.log("Respuesta Directions:", data);

      if (data.routes.length) {
        const puntosRuta = decodePolyline(
          data.routes[0].overview_polyline.points
        );
        setRutaCoords(puntosRuta);
        setRutaActiva(true);
        setTimeout(() => {
          setModalVisible(false); // cerrar el modal después de trazar la ruta
        }, 300); // pequeño retraso por seguridad

        mapRef.current?.fitToCoordinates(puntosRuta, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      } else {
        console.warn("No se encontró una ruta.");
      }
    } catch (error) {
      console.error("Error al obtener la ruta:", error);
    }
  };

  const decodePolyline = (
    encoded: string
  ): { latitude: number; longitude: number }[] => {
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

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
                onPress={
                  // () =>
                  // router.push({
                  //   pathname: "/puntosInfo",
                  //   params: {
                  //     id: punto.PuntoHist_ID,
                  //     nombre: punto.Nombre,
                  //   },
                  // })
                  () => {
                    setPuntoSeleccionado(punto);
                    setModalVisible(true);
                  }
                }
              ></Marker>
            ))}
            {rutaActiva && (
              <Polyline
                coordinates={rutaCoords}
                strokeColor="#508D44"
                strokeWidth={4}
              />
            )}
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
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Este Pressable evita que el toque se propague al fondo */}
                <Pressable
                  onPress={() => {}} // para que el toque no cierre el modal si se toca dentro
                  style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 20,
                    width: "80%",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "bold",
                        marginBottom: 10,
                        // borderColor: "#508D44", //quitear el border
                        // borderWidth: 1,
                        width: 200,
                      }}
                    >
                      {puntoSeleccionado?.Nombre}
                    </Text>
                    <Pressable onPress={() => setModalVisible(false)}>
                      <Ionicons
                        name="close"
                        size={20}
                        color="#black"
                        style={{
                          backgroundColor: "#e7e7e7",
                          borderRadius: 50,
                          padding: 5,
                        }}
                      />
                    </Pressable>
                  </View>
                  {puntoSeleccionado?.imagenes?.[0]?.URL ? (
                    <Image
                      source={{
                        uri: puntoSeleccionado.imagenes[0].URL,
                      }}
                      style={{ width: "100%", height: 100, borderRadius: 0 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <Text>
                    Tipo: {puntoSeleccionado?.Tipo || "Punto Turistico"}
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={styles.btnmodal}
                      onPress={() => {
                        // console.log("Presionando botón Cómo llegar");
                        // console.log(
                        //   "puntoSeleccionado antes de obtenerRuta:",
                        //   puntoSeleccionado
                        // );
                        obtenerRuta();
                      }}
                    >
                      <Text style={styles.textbtn}>Como llegar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnmodal}
                      onPress={() =>
                        router.push({
                          pathname: "/puntosInfo",
                          params: {
                            id: puntoSeleccionado?.PuntoHist_ID,
                            nombre: puntoSeleccionado?.Nombre,
                          },
                        })
                      }
                    >
                      <Text style={styles.textbtn}>Ver mas</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          {rutaActiva && (
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 140,
                alignSelf: "center",
                backgroundColor: "#508D44",
                padding: 10,
                borderRadius: 20,
                elevation: 4,
              }}
              onPress={() => {
                setRutaCoords([]);
                setRutaActiva(false);
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Cancelar ruta
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  textbtn: {
    color: "white",
    fontSize: 12,
  },
  btnmodal: {
    marginTop: 10,
    // marginBottom: 10,
    alignItems: "center",
    backgroundColor: "#508D44",
    paddingVertical: 7,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
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
