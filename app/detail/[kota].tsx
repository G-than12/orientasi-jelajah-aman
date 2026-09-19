// app/detail/[kota].tsx
import { View, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import WeatherCard from "../../components/WeatherCard";
import { spacing } from "../../constants/styles";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{ kota: string }>();

  return (
    <View style={styles.container}>
      {/* 1. Tampilkan Kartu Cuaca */}
      <WeatherCard kota={kota ?? "Kota"} suhu={29} tingkatAQI="BAIK" />

      {/* 2. Tombol untuk Membuka Modal Tambah Favorit */}
      <View style={styles.buttonContainer}>
        <Button
          title="Tambahkan ke Favorit"
          onPress={() => router.push("/tambah-favorit")}
          accessibilityLabel={`Tambahkan kota ${kota} ke daftar favorit`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.sedang,
    gap: spacing.sedang,
    backgroundColor: "#f8fafc",
  },
  buttonContainer: {
    marginTop: 8,
  },
});
