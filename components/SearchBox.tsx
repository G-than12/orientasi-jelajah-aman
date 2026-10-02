// components/SearchBox.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  nilai?: string;
}

export default function SearchBox({ onCari, nilai }: SearchBoxProps) {
  const [teks, setTeks] = useState(nilai ?? "");

  // Sinkronisasi teks input jika nilai dari parent berubah (misal saat kota dipilih)
  useEffect(() => {
    if (nilai !== undefined) {
      setTeks(nilai);
    }
  }, [nilai]);

  // Mengirim teks setiap kali pengguna mengetik (Live Search)
  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  // Fungsi saat tombol biru "Cari" ditekan
  function handleSubmit() {
    onCari(teks.trim());
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Cari nama kota..."
          placeholderTextColor="#94a3b8"
          value={teks}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        />
        {teks.length > 0 && (
          <TouchableOpacity
            onPress={() => handleChange("")}
            style={styles.clearBtn}
            accessibilityLabel="Hapus teks pencarian"
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tombol Biru "Cari" */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="Tombol cari kota"
      >
        <Text style={styles.buttonText}>Cari</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
  },
  button: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
});
