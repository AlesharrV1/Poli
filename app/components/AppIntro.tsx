import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

type Slide = {
  key: string;
  title: string;
  text: string;
  image: any;
  backgroundColor: string;
};

const slides: Slide[] = [
  {
    key: '1',
    title: 'Bienvenido viajero',
    text: 'Me llamo Poli y te ayudare a explorar Santa Cruz.',
    image: require('../../assets/images/slide-icon2.png'),
    backgroundColor: '#000', // este se ignora porque usaremos una imagen
  },
  {
    key: '2',
    title: 'Modo guiado',
    text: 'Explora el mapa y descubre puntos turisticos.',
    image: require('../../assets/images/slide2.png'),
    backgroundColor: '#22bcb5',
  },
  {
    key: '3',
    title: 'Modo libre',
    text: 'Activalo y recibe alertas cuando estés cerca de un lugar turístico.',
    image: require('../../assets/images/slide4.png'),
    backgroundColor: '#AEE9F9',
  },
  {
    key: '4',
    title: 'Historias',
    text: 'Descubre la historia de Santa Cruz.',
    image: require('../../assets/images/slide3.png'),
    backgroundColor: '#F9E79F',
  },
];

export default function AppIntro({ onDone }: { onDone: () => void }) {
  const renderItem = ({ item }: { item: Slide }) => {
    if (item.key === '1') {
      return (
        <ImageBackground
          source={require('../../assets/images/fondoS1.png')} // fondo personalizado
          style={styles.fullScreen}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Image source={require('../../assets/images/200.png')} />
            <Text style={[styles.title,{color:'white'}]}>{item.title}</Text>
            <Image source={item.image} style={styles.image2} />
            <Text style={[styles.text,{color:'white'}]}>{item.text}</Text>
          </View>
        </ImageBackground>
      );
    }

    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const renderNextButton = () => (
    <View style={styles.buttonCircle}>
      <Ionicons name="arrow-forward-outline" size={24} color="#fff" />
    </View>
  );

  const renderDoneButton = () => (
    <View style={styles.buttonCircle}>
      <Ionicons name="checkmark-outline" size={24} color="#fff" />
    </View>
  );

  const renderSkipButton = () => (
    <View style={styles.buttonCircle}>
      <Ionicons name="close-outline" size={24} color="#fff" />
    </View>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={onDone}
      onSkip={onDone}
      showSkipButton
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      renderSkipButton={renderSkipButton}
    />
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // oscurece la imagen
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    width: '80%',
  },
  image: {
    // width: 200,
    height: 450,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  image2: {
    width: 200,
    height: 200,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
