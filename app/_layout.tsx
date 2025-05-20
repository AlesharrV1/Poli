import { Slot, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: "slide_from_right",
      })}
    >
      <Slot />
    </Stack>
  );
}
