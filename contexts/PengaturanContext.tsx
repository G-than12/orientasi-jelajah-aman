// contexts/PengaturanContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  ambilPreferensi,
  simpanPreferensi,
  PreferensiPengguna,
  PREFERENSI_DEFAULT,
} from "../services/pengaturanStorage";
import { ThemeColors, lightTheme, darkTheme } from "../constants/theme";

export interface ThemeTransitionState {
  active: boolean;
  x: number;
  y: number;
  nextIsDark: boolean;
}

export interface PengaturanContextType {
  celcius: boolean;
  notifikasi: boolean;
  darkMode: boolean;
  theme: ThemeColors;
  sedangMemuat: boolean;
  transition: ThemeTransitionState | null;
  setCelcius: (nilai: boolean) => Promise<void>;
  setNotifikasi: (nilai: boolean) => Promise<void>;
  setDarkMode: (nilai: boolean) => Promise<void>;
  toggleDarkMode: (coords?: { x: number; y: number }) => void;
  applyThemeChange: (nextIsDark: boolean) => void;
  completeTransition: () => void;
  konversiSuhu: (celsius: number, isCelcius?: boolean) => number;
  formatSuhu: (celsius: number, isCelcius?: boolean) => string;
  satuanLabel: string;
  satuanNama: string;
}

/**
 * Mengonversi nilai suhu dari Celsius ke satuan yang diinginkan (Celsius atau Fahrenheit).
 * Rumus konversi: °F = (°C × 9/5) + 32
 */
export function hitungKonversiSuhu(
  celsius: number,
  celciusAktif: boolean
): number {
  if (celciusAktif) {
    return Math.round(celsius);
  }
  return Math.round((celsius * 9) / 5 + 32);
}

const defaultContextValue: PengaturanContextType = {
  celcius: PREFERENSI_DEFAULT.celcius,
  notifikasi: PREFERENSI_DEFAULT.notifikasi,
  darkMode: PREFERENSI_DEFAULT.darkMode,
  theme: lightTheme,
  sedangMemuat: false,
  transition: null,
  setCelcius: async () => {},
  setNotifikasi: async () => {},
  setDarkMode: async () => {},
  toggleDarkMode: () => {},
  applyThemeChange: () => {},
  completeTransition: () => {},
  konversiSuhu: (celsius: number, isCelcius?: boolean) =>
    hitungKonversiSuhu(celsius, isCelcius ?? true),
  formatSuhu: (celsius: number, isCelcius?: boolean) => {
    const nilai = hitungKonversiSuhu(celsius, isCelcius ?? true);
    return `${nilai}°`;
  },
  satuanLabel: "°C",
  satuanNama: "Celsius",
};

const PengaturanContext =
  createContext<PengaturanContextType>(defaultContextValue);

export function PengaturanProvider({ children }: { children: ReactNode }) {
  const [preferensi, setPreferensi] =
    useState<PreferensiPengguna>(PREFERENSI_DEFAULT);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [transition, setTransition] = useState<ThemeTransitionState | null>(null);

  useEffect(() => {
    let aktif = true;
    ambilPreferensi()
      .then((data) => {
        if (aktif) {
          setPreferensi(data);
          setSedangMemuat(false);
        }
      })
      .catch(() => {
        if (aktif) setSedangMemuat(false);
      });

    return () => {
      aktif = false;
    };
  }, []);

  const setCelcius = useCallback(async (nilai: boolean) => {
    setPreferensi((prev) => ({ ...prev, celcius: nilai }));
    await simpanPreferensi({ celcius: nilai });
  }, []);

  const setNotifikasi = useCallback(async (nilai: boolean) => {
    setPreferensi((prev) => ({ ...prev, notifikasi: nilai }));
    await simpanPreferensi({ notifikasi: nilai });
  }, []);

  const setDarkMode = useCallback(async (nilai: boolean) => {
    setPreferensi((prev) => ({ ...prev, darkMode: nilai }));
    await simpanPreferensi({ darkMode: nilai });
  }, []);

  const toggleDarkMode = useCallback(
    (coords?: { x: number; y: number }) => {
      setPreferensi((prev) => {
        const nextIsDark = !prev.darkMode;
        simpanPreferensi({ darkMode: nextIsDark });
        setTransition({
          active: true,
          x: coords?.x ?? -1,
          y: coords?.y ?? -1,
          nextIsDark,
        });
        return { ...prev, darkMode: nextIsDark };
      });
    },
    []
  );

  const applyThemeChange = useCallback(async (nextIsDark: boolean) => {
    setPreferensi((prev) => ({ ...prev, darkMode: nextIsDark }));
    await simpanPreferensi({ darkMode: nextIsDark });
  }, []);

  const completeTransition = useCallback(() => {
    setTransition(null);
  }, []);

  const konversiSuhu = useCallback(
    (celsius: number, isCelcius?: boolean) => {
      const aktif = isCelcius !== undefined ? isCelcius : preferensi.celcius;
      return hitungKonversiSuhu(celsius, aktif);
    },
    [preferensi.celcius]
  );

  const formatSuhu = useCallback(
    (celsius: number, isCelcius?: boolean) => {
      const nilai = konversiSuhu(celsius, isCelcius);
      return `${nilai}°`;
    },
    [konversiSuhu]
  );

  const satuanLabel = preferensi.celcius ? "°C" : "°F";
  const satuanNama = preferensi.celcius ? "Celsius" : "Fahrenheit";
  const theme = preferensi.darkMode ? darkTheme : lightTheme;

  return (
    <PengaturanContext.Provider
      value={{
        celcius: preferensi.celcius,
        notifikasi: preferensi.notifikasi,
        darkMode: preferensi.darkMode,
        theme,
        sedangMemuat,
        transition,
        setCelcius,
        setNotifikasi,
        setDarkMode,
        toggleDarkMode,
        applyThemeChange,
        completeTransition,
        konversiSuhu,
        formatSuhu,
        satuanLabel,
        satuanNama,
      }}
    >
      {children}
    </PengaturanContext.Provider>
  );
}

export function usePengaturan() {
  return useContext(PengaturanContext);
}
