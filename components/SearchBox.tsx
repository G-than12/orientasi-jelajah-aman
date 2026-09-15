// components/SearchBox.tsx
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

interface SearchBoxProps {
  onCari: (kota: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [inputKota, setInputKota] = useState("");

  const handleSubmit = () => {
    if (inputKota.trim()) {
      onCari(inputKota.trim());
      setInputKota(""); // Kosongkan input setelah cari
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Masukkan nama kota..."
        value={inputKota}
        onChangeText={setInputKota}
        onSubmitEditing={handleSubmit}
      />
      <Button
        title="Cari"
        onPress={handleSubmit}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
});
