import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabbarButton from "./TabbarButton";
import { useState } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
export default function MyTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({
    width: 20,
    height: 100,
  });
  const buttonWidth = dimensions.width / state.routes.length;
  const onTabbarLayout =(e:LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    })
  }
  const tabPositionX = useSharedValue(0);
  const animateStyle = useAnimatedStyle(()=>{
    return{
      transform:[{translateX: tabPositionX.value}],
    }
  })
  return (
    <View onLayout={onTabbarLayout} style={styles.tabbar}>
      <Animated.View style={[animateStyle,{
        position: "absolute",
        backgroundColor: "#508D44",
        borderRadius: 30,
        marginHorizontal: 17,
        height:dimensions.height - 24,
        width: buttonWidth - 35,

      }]}/>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label:string|any=
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, { duration: 1500 });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabbarButton
          key={route.name}
          onPress={onPress}
          onLongPress={onLongPress}
          isFocused={isFocused}
          routeName={route.name}
          color={isFocused ? "#FFF" : "#222"}
          label={label}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 101,
    paddingVertical: 18,
    borderRadius: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
