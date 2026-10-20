// contexts/RiwayatContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface KotaRiwayat {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  timestamp?: number;
}

interface RiwayatContextType {
  riwayat: KotaRiwayat[];
  tambahRiwayat: (kota: KotaRiwayat) => Promise<void>;
  hapusRiwayat: (nama: string) => Promise<void>;
  hapusSemuaRiwayat: () => Promise<void>;
  sedangMemuat: boolean;
}

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
const MAKSIMAL_RIWAYAT = 10;

const RiwayatContext = createContext<RiwayatContextType>({
  riwayat: [],
  tambahRiwayat: async () => {},
  hapusRiwayat: async () => {},
  hapusSemuaRiwayat: async () => {},
  sedangMemuat: false,
});

export function RiwayatProvider({ children }: { children: ReactNode }) {
  const [riwayat, setRiwayat] = useState<KotaRiwayat[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Muat riwayat pencarian dari AsyncStorage saat awal aplikasi dibuka
  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KUNCI_RIWAYAT);
        if (raw && aktif) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setRiwayat(parsed.slice(0, MAKSIMAL_RIWAYAT));
          }
        }
      } catch (err) {
        console.error("Gagal membaca riwayat pencarian dari storage:", err);
      } finally {
        if (aktif) setSedangMemuat(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  // Simpan data kota baru ke riwayat (maksimal 10 kota, LIFO & deduplikasi)
  const tambahRiwayat = useCallback(async (kota: KotaRiwayat) => {
    setRiwayat((prev) => {
      const kotaDenganWaktu: KotaRiwayat = {
        ...kota,
        timestamp: kota.timestamp ?? Date.now(),
      };
      // Hapus jika sudah pernah ada sebelumnya agar pindah ke urutan teratas
      const filtered = prev.filter(
        (k) => k.name.trim().toLowerCase() !== kota.name.trim().toLowerCase()
      );
      const baru = [kotaDenganWaktu, ...filtered].slice(0, MAKSIMAL_RIWAYAT);
      AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(baru)).catch((err) =>
        console.error("Gagal menyimpan riwayat:", err)
      );
      return baru;
    });
  }, []);

  // Hapus satu item riwayat berdasarkan nama
  const hapusRiwayat = useCallback(async (nama: string) => {
    setRiwayat((prev) => {
      const baru = prev.filter(
        (k) => k.name.trim().toLowerCase() !== nama.trim().toLowerCase()
      );
      AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(baru)).catch((err) =>
        console.error("Gagal menghapus item riwayat:", err)
      );
      return baru;
    });
  }, []);

  // Hapus seluruh riwayat pencarian
  const hapusSemuaRiwayat = useCallback(async () => {
    setRiwayat([]);
    try {
      await AsyncStorage.removeItem(KUNCI_RIWAYAT);
    } catch (err) {
      console.error("Gagal mengosongkan riwayat:", err);
    }
  }, []);

  return (
    <RiwayatContext.Provider
      value={{
        riwayat,
        tambahRiwayat,
        hapusRiwayat,
        hapusSemuaRiwayat,
        sedangMemuat,
      }}
    >
      {children}
    </RiwayatContext.Provider>
  );
}

export function useRiwayat() {
  return useContext(RiwayatContext);
}
