import { Tabs } from "expo-router";
import { Icon, IconName, palette } from "./ui";
const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: "home", title: "Inicio", icon: "grid-outline" },
  { name: "projects", title: "Proyectos", icon: "cube-outline" },
  { name: "files", title: "Archivos", icon: "folder-outline" },
  { name: "settings", title: "Configuración", icon: "options-outline" },
];
export function BottomNavigation() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: { backgroundColor: "white", borderTopColor: palette.line },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Icon name={tab.icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
