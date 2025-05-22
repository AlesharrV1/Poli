import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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
    title: 'Bienvenido',
    text: 'Esta app te ayudará a explorar Santa Cruz.',
    image: require('../../assets/images/icon2.png'),
    backgroundColor: '#59b2ab',
  },
  {
    key: '2',
    title: 'Explora',
    text: 'Descubre lugares turísticos en el mapa.',
    image: require('../../assets/images/icon2.png'),
    backgroundColor: '#febe29',
  },
  {
    key: '3',
    title: 'Realidad Aumentada',
    text: 'Usa la cámara para ver puntos de interés en AR.',
    image: require('../../assets/images/icon2.png'),
    backgroundColor: '#22bcb5',
  },
];

export default function AppIntro({ onDone }: { onDone: () => void }) {
  const renderItem = ({ item }: { item: Slide }) => {
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
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  image: {
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
