// app/tambah-favorit.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { typeScale, spacing } from "../constants/styles";

export default function ModalTambahFavorit() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 36 }}>⭐</Text>
        </View>

        <Text style={styles.judul}>Simpan ke Favorit</Text>
        <Text style={styles.deskripsi}>
          Tambahkan kota ini ke daftar favorit Anda agar dapat dipantau cuacanya
          dengan cepat setiap saat.
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.simpanButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.simpanButtonText}>Simpan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.batalButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
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
