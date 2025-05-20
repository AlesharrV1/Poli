import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { backend } from "@/app/common/backend";
import AntDesign from "@expo/vector-icons/build/AntDesign";

const { height: screenHeight } = Dimensions.get("window");
interface PuntoTuristico {
  PuntoHist_ID: string;
  Nombre: string;
  Latitud: number;
  Longitud: number;
  Descripcion: string;
  HorarioServicio: string;
  CostoEntrada: string;
  Localidad: string;
  Ciudad: string;
  Pais: string;
}
const PuntosInfo = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [punto, setPunto] = useState<PuntoTuristico|null>(null);
  const [imagenURL, setImagenURL] = useState(null);
  const [loading, setLoading] = useState(true);

  const [imageHeight] = useState(new Animated.Value(screenHeight * 0.45));
  const [imageMarginTop] = useState(new Animated.Value(0));
  const [scrollTranslate] = useState(new Animated.Value(0));
  const [isExpanded, setIsExpanded] = useState(false);

  const localhost = backend; // Cambia según tu red

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [puntoRes, imagenRes] = await Promise.all([
          axios.get(`http://${localhost}:3000/api/puntos-turisticos/${id}`),
          axios.get(`http://${localhost}:3000/api/imagenes/por-punto-turistico/${id}`),
        ]);

        setPunto(puntoRes.data);
        if (imagenRes.data?.length > 0) {
          setImagenURL(imagenRes.data[0].URL);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleImagePress = () => {
    if (!isExpanded) {
      // Expandir
      Animated.parallel([
        Animated.timing(imageHeight, {
          toValue: screenHeight * 0.6,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(imageMarginTop, {
          toValue: 50,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(scrollTranslate, {
          toValue: 100,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Contraer
      Animated.parallel([
        Animated.timing(imageHeight, {
          toValue: screenHeight * 0.45,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(imageMarginTop, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(scrollTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
    setIsExpanded(!isExpanded);
  };

  const handleGoToMap = () => {
    // Aquí puedes personalizar la navegación
    console.log("Ir al mapa");
    // router.push('/mapa'); // Si tienes una ruta al mapa
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text>Cargando información...</Text>
      </View>
    );
  }

  if (!punto) {
    return (
      <View style={styles.centered}>
        <Text>Error: Punto no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePress}>
        <Animated.View style={[styles.imageContainer, { height: imageHeight, marginTop: imageMarginTop }]}>
          {imagenURL && <Image source={{ uri: imagenURL }} style={styles.image} resizeMode="cover" />}
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.mapButtonWrapper}>
          <TouchableOpacity style={styles.mapButton} onPress={handleGoToMap}>
            <Text style={styles.mapButtonText}>Ver ruta</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.ScrollView style={[styles.scroll, { transform: [{ translateY: scrollTranslate }] }]}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{punto.Nombre}</Text>
          <Text style={styles.description}>{punto.Descripcion}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.info}>🕐 Horario: {punto.HorarioServicio}</Text>
          <Text style={styles.info}>💵 Costo: {punto.CostoEntrada}</Text>
          <Text style={styles.info}>📍 Ubicación: {punto.Localidad}, {punto.Ciudad}</Text>
          <Text style={styles.info}>🌍 País: {punto.Pais}</Text>
        </View>
      </Animated.ScrollView>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <AntDesign name="back" size={24} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  back:{ 
    backgroundColor: "green",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    position: "absolute",
    top: 20,
    left: 20 
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderColor: "green",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  infoContainer: {
    padding: 30,
    borderBottomWidth: 2,
    borderColor: "green",
    borderRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#000",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  detailsContainer: {
    padding: 30,
    borderTopWidth: 2,
    borderColor: "green",
    borderRadius: 20,
  },
  info: {
    fontSize: 15,
    marginBottom: 8,
    color: "#000",
  },
  mapButtonWrapper: {
    position: "absolute",
    bottom: 210,
    width: "100%",
    alignItems: "center",
    zIndex: 2,
  },
  mapButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 5,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PuntosInfo;

