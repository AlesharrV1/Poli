import React, { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons'
import TabBar from '@/app/components/TabBar'
import { usePathname } from 'expo-router'

const Tablayout = () => {
  const pathname = usePathname();
  const [shouldShowTab, setShouldShowTab] = useState(true);

  useEffect(() => {
    const showOnPaths = ['/mapa', '/historias'];
    const shouldShow = showOnPaths.some(path => pathname?.includes(path));
    setShouldShowTab(shouldShow);
  }, [pathname]);

  return (
    <Tabs 
      // tabBar={props => shouldShowTab ? <TabBar {...props} /> : null}
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(stack)"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(stack2)"
        options={{
          title: 'Historias',
          tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}

export default Tablayout