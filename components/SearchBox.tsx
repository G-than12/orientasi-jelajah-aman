// components/SearchBox.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");

  // Tetap mendukung Live Search Pertemuan 4 (mengirim teks setiap mengetik)
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
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tombol Biru "Cari" Seperti Pertemuan 3 */}
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
