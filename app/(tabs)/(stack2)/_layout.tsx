import { Stack } from "expo-router";

const Historialayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="historias/index"
        options={{ headerShown: true , title:'Historias', headerTitleAlign: 'center', headerTintColor: '#000', headerStyle: { backgroundColor: '#fff' }}} // Oculta el encabezado
      />
      <Stack.Screen
        name="historiaInfo/index"
        options={{ headerShown: false}} // Oculta el encabezado
      />
    </Stack>
  );
};

export default Historialayout;
