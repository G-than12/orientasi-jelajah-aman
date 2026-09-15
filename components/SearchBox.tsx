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
  onCari: (kota: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [inputKota, setInputKota] = useState("");

  const handleSubmit = () => {
    if (inputKota.trim()) {
      onCari(inputKota.trim());
      setInputKota("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Cari nama kota..."
        placeholderTextColor="#94a3b8"
        value={inputKota}
        onChangeText={setInputKota}
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
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
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0f172a",
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
