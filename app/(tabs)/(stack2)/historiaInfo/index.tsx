import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { backend } from "@/app/common/backend";

export default function HistoriaDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [historia, setHistoria] = useState<any>(null);

  const localhost = backend; // Cambia esto si tu IP es distinta

  const [imagenes, setImagenes] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://${localhost}:3000/api/historias/${id}`)
        .then((resp) => setHistoria(resp.data))
        .catch((err) => console.error("Error al cargar historia:", err));
    }
    axios
      .get(`http://${localhost}:3000/api/imagenes/por-historia/${id}`)
      .then((resp) => {
        const urls = resp.data.map((img: any) => img.URL); // asegúrate que el atributo es `url`
        setImagenes(urls);
      })
      .catch((err) => {
        console.error("Error al obtener imágenes:", err);
      });
  }, [id]);

  if (!historia) {
    return (
      <View style={styles.center}>
        <Text>Cargando historia...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
<ScrollView style={{ backgroundColor: "#fff" }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.volver}>
        <Text style={{ fontSize: 18 }}>⬅ Volver</Text>
      </TouchableOpacity>

      {/* Imagen principal */}
      <Image source={{ uri: imagenes[0] }} style={styles.imagenPrincipal} />

      {/* Tarjeta principal */}
      <View style={styles.card}>
        <Text style={styles.subtitulo}>Título</Text>
        <Text style={styles.titulo}>{historia.titulo}</Text>

        <Text style={styles.subtitulo}>Fecha</Text>
        <Text style={styles.fecha}>
          {historia.hitos_historicos?.[0]?.fecha || "Sin fecha"}
        </Text>

        <Text style={styles.descripcion}>{historia.descripcion}</Text>
      </View>

      {/* Otros hitos históricos */}
      <View style={styles.hitosContainer}>
        {historia.hitos_historicos?.slice(1).map((hito: any, index: number) => (
          <View key={index} style={styles.hito}>
            <Text style={styles.subtitulo}>Fecha</Text>
            <Text style={styles.fecha}>{hito.fecha}</Text>
            <Text style={styles.descripcion}>{hito.descripcion}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
    
  );
}

const styles = StyleSheet.create({
  volver: {
    margin: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagen: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  contenido: {
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  fecha: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  subtitulo: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  imagenPrincipal: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },

  hitosContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  hito: {
    marginBottom: 20,
  },
});
