// app/(tabs)/riwayat.tsx
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RiwayatList from "../../components/RiwayatList";
import { useRiwayat } from "../../contexts/RiwayatContext";
import { spacing } from "../../constants/styles";

export default function TabRiwayat() {
  const { riwayat } = useRiwayat();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RiwayatList daftarKota={riwayat.map((k) => k.name)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: spacing.sedang,
    paddingBottom: 40,
  },
});
