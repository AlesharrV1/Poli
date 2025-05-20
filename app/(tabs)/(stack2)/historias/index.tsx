import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Button,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { useHistoriasStore } from "./useHistoriasStore";
import axios from "axios";
import { useRouter } from "expo-router";
import { backend } from "@/app/common/backend";

export default function HistoriasScreen() {
  const localhost = backend; // Asegúrate que tu celular esté en la misma red Wi-Fi

  const { historias, setHistorias } = useHistoriasStore();
  const router = useRouter();
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  useEffect(() => {
    axios
      .get(`http://${localhost}:3000/api/historias`)
      .then(async (resp) => {
        const historiasConImagenes = await Promise.all(
          resp.data.map(async (historia: any) => {
            try {
              const resImg = await axios.get(
                `http://${localhost}:3000/api/imagenes/por-historia/${historia.id_historia}`
              );
              historia.imagen_url = resImg.data[0]?.URL || "";
            } catch {
              historia.imagen_url = "";
            }
            return historia;
          })
        );
        setHistorias(historiasConImagenes);
      })
      .catch((err) => console.error("Error al cargar historias:", err));
  }, []);

  const visibles = historias.filter((h) => h.estado === true);
  const destacadas = [...visibles].sort(() => 0.5 - Math.random()).slice(0, 3);

  const normales = visibles
    .filter((h) => !destacadas.includes(h))
    .sort((a, b) => {
      const fechaA = new Date(
        a.fecha || a.hitos_historicos?.[0]?.fecha || ""
      ).getTime();
      const fechaB = new Date(
        b.fecha || b.hitos_historicos?.[0]?.fecha || ""
      ).getTime();
      return ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
    });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Historias destacadas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
      >
        {destacadas.map((h) => (
          <TouchableOpacity
            key={h.id_historia}
            style={styles.card2}
            onPress={() => router.push(`/historiaInfo?id=${h.id_historia}`)}
          >
            <Image source={{ uri: h.imagen_url }} style={styles.imagenCard} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.subtitulo,{fontSize:10}]}>{h.titulo} </Text>
              <Text style={styles.fecha}>{h.fecha}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ marginBottom: 10, alignItems: "flex-end" }}>
        <Pressable
          onPress={() => setOrdenAscendente(!ordenAscendente)}
          style={
            {
             backgroundColor:'#3FA53A',
              padding: 10,
              borderRadius: 10,
              margin: 10,
              alignItems: "center",
              justifyContent: "center",
            }
          }
        >
          <Text style={{ fontSize: 15 ,color:'white'}}>{` ${
            ordenAscendente ? "Ascendente ↑" : "Descendente ↓"
          }`}</Text>
        </Pressable>
      </View>

      <View style={styles.timelineContainer}>
        
        <View style={{ flex: 1 }}>
          {normales.map((h) => {
            const fecha = h.fecha || h.hitos_historicos?.[0]?.fecha || "";
            const anio = fecha ? new Date(fecha).getFullYear() : "?";
            return (
              <View key={h.id_historia} style={styles.itemContainer}>
                <View style={styles.añoBurbuja}>
                  <Text style={styles.añoTexto}>{anio}</Text>
                </View>
                <View style={styles.verticalLine} />
                <TouchableOpacity
                  style={styles.card}
                  onPress={() =>
                    router.push(`/historiaInfo?id=${h.id_historia}`)
                  }
                >
                  <Image
                    source={{ uri: h.imagen_url }}
                    style={styles.imagenCard}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subtitulo}>{h.titulo}</Text>
                    <Text style={styles.fecha}>{h.fecha}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  slider: {
    flexDirection: "row",
    height: 170,
    // marginBottom: 20,
  },
  timelineContainer: {
    flexDirection: "row",
    paddingLeft: 16,
    paddingBottom: 40,
  },
  verticalLine: {
    height: "100%",
    width: 8,
    backgroundColor: "#A8E2A5",
    marginTop: 10,
    marginRight: 14,
    borderRadius: 4,
  },
  itemContainer: {
    flexDirection: "row",
    // alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  añoBurbuja: {
    width: 60,
    height: 30,
    backgroundColor: "#3FA53A",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  añoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    margin: 6,
    overflow: "hidden",
    width: 280,
    // padding: 10,
    alignItems: "center",
    flex: 1,
  },
  card2: {
    // flexDirection: 'row',
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    margin: 6,
    overflow: "hidden",
    width: 109,
    // padding: 10,
    alignItems: "center",
    flex: 1,
  },
  imagenCard: {
    width: 110,
    height: 100,
    // borderRadius: 8,
  },
  subtitulo: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  fecha: {
    fontSize: 13,
    color: "black",
    paddingHorizontal: 10,
  },
});
