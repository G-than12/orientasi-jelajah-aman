// app/tambah-favorit.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { spacing, typeScale } from "../constants/styles";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

  async function simpan() {
    setSedangMenyimpan(true);
    try {
      await tambahFavorit({
        id: Number(id),
        nama: nama || "Kota Pilihan",
        latitude: Number(lat),
        longitude: Number(lon),
      });
      router.back();
    } catch (error) {
      console.error("Gagal menyimpan favorit:", error);
    } finally {
      setSedangMenyimpan(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 36 }}>⭐</Text>
        </View>

        <Text style={styles.judul}>Simpan ke Favorit</Text>
        <Text style={styles.deskripsi}>
          Tambahkan <Text style={{ fontWeight: "700", color: "#1e293b" }}>{nama || "kota ini"}</Text> ke daftar favorit?
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.simpanButton}
            onPress={simpan}
            disabled={sedangMenyimpan}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Simpan ke Favorit"
          >
            {sedangMenyimpan ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.simpanButtonText}>Simpan</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.batalButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Batal"
          >
            <Text style={styles.batalButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    padding: spacing.sedang,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: spacing.besar,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sedang,
  },
  judul: {
    fontSize: typeScale.judul,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: spacing.kecil,
  },
  deskripsi: {
    fontSize: typeScale.isi,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.besar,
  },
  buttonGroup: {
    width: "100%",
    gap: 10,
  },
  simpanButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  simpanButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  batalButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  batalButtonText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
});
