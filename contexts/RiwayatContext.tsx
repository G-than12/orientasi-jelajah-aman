// contexts/RiwayatContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export interface KotaRiwayat {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

interface RiwayatContextType {
  riwayat: KotaRiwayat[];
  tambahRiwayat: (kota: KotaRiwayat) => void;
}

const RiwayatContext = createContext<RiwayatContextType>({
  riwayat: [],
  tambahRiwayat: () => {},
});

export function RiwayatProvider({ children }: { children: ReactNode }) {
  const [riwayat, setRiwayat] = useState<KotaRiwayat[]>([
    { name: "Pekalongan", latitude: -6.8886, longitude: 109.6753 },
  ]);

  function tambahRiwayat(kota: KotaRiwayat) {
    setRiwayat((prev) => {
      // Pindahkan ke posisi paling depan jika sudah pernah dicari
      const filtered = prev.filter(
        (k) => k.name.toLowerCase() !== kota.name.toLowerCase()
      );
      return [kota, ...filtered];
    });
  }

  return (
    <RiwayatContext.Provider value={{ riwayat, tambahRiwayat }}>
      {children}
    </RiwayatContext.Provider>
  );
}

export function useRiwayat() {
  return useContext(RiwayatContext);
}
