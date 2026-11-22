import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  BackHandler,
  StyleSheet,
} from "react-native";

import data from "./data/data.json"; // file created by the C++ tool
import HostelListScreen from "./src/screens/HostelListScreen";
import HostelDetailScreen from "./src/screens/HostelDetailScreen";
import MessListScreen from "./src/screens/MessListScreen";
import { colors } from "./src/theme";

export default function App() {
  const [tab, setTab] = useState("hostels"); // 'hostels' or 'messes'
  const [selectedHostel, setSelectedHostel] = useState(null);

  // Android back button: close the detail screen instead of closing the app
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedHostel) {
        setSelectedHostel(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [selectedHostel]);

  let screen;
  if (selectedHostel) {
    screen = (
      <HostelDetailScreen
        hostel={selectedHostel}
        onBack={() => setSelectedHostel(null)}
      />
    );
  } else if (tab === "hostels") {
    screen = (
      <HostelListScreen hostels={data.hostels} onOpen={setSelectedHostel} />
    );
  } else {
    screen = <MessListScreen messes={data.messes} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.content}>{screen}</View>

      {/* Bottom tab bar is hidden on the detail screen */}
      {!selectedHostel && (
        <View style={styles.tabBar}>
          <TabButton
            label="Hostels"
            active={tab === "hostels"}
            onPress={() => setTab("hostels")}
          />
          <TabButton
            label="Messes"
            active={tab === "messes"}
            onPress={() => setTab("messes")}
          />
        </View>
      )}
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
  },
  content: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 3,
    borderTopColor: "transparent",
  },
  tabActive: { borderTopColor: colors.primary },
  tabText: { fontSize: 15, color: colors.grey },
  tabTextActive: { color: colors.primary, fontWeight: "700" },
});
