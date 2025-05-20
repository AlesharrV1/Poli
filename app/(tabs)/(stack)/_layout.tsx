import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Mapalayout = () => {
  return (
    <Stack>
        <Stack.Screen name="mapa/index" options={{headerShown: false}}/>
        <Stack.Screen name="ruta/index" options={{headerShown: false}}/>
        <Stack.Screen name="libre/index" options={{headerShown: true ,title:'Modo libre'}}/>
        <Stack.Screen name="puntosInfo/index" options={{headerShown: false}}/>


    </Stack>
  )
}

export default Mapalayout