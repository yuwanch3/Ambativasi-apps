import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoundTouchableOpacity from "../components/SoundTouchableOpacity";
import { useTheme } from "../context/ThemeContext";

interface LevelCardItem {
  image: ImageSourcePropType;
  judul: string;
  sub: string;
  path: string;
}

interface LevelCardProps {
  item: LevelCardItem;
  onPress: (path: string) => void;
}

export function LevelCard({ item, onPress }: LevelCardProps) {
  const { colors } = useTheme();

  return (
    <SoundTouchableOpacity
      style={[
        styles.levelCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => onPress(item.path)}
    >
      <View style={styles.levelCardLeft}>
        <View style={[styles.levelBadge]}>
          <Image
            source={item.image}
            style={styles.badgeImage}
            resizeMode="cover"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.levelTitle, { color: colors.text }]}>
            {item.judul}
          </Text>
          <Text
            style={[styles.levelSubtitle, { color: colors.subtext }]}
            numberOfLines={1}
          >
            {item.sub}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
    </SoundTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#0f172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  levelCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  badgeImage: {
    width: "100%",
    height: "100%",
  },
  levelTitle: { fontSize: 16, fontWeight: "bold" },
  levelSubtitle: { fontSize: 12, marginTop: 2 },
});