import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../constants/styles";
import { usePengaturan } from "../contexts/PengaturanContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  nilai?: string;
}

export default function SearchBox({ onCari, nilai }: SearchBoxProps) {
  const { theme } = usePengaturan();
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
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={19}
          color={theme.textMuted}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Cari nama kota..."
          placeholderTextColor={theme.textMuted}
          value={teks}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        />
        {teks.length > 0 && (
          <TouchableOpacity
            onPress={() => handleChange("")}
            style={styles.clearBtn}
            accessibilityLabel="Hapus teks pencarian"
          >
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: {
    fontFamily: fonts.medium,
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
});
