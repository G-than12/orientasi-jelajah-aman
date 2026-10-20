// src/db/database.web.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_CACHE = "@jelajah_aman:sqlite_web_cache_cuaca";
const STORAGE_KEY_VERSION = "@jelajah_aman:sqlite_web_user_version";

interface BarisCacheWeb {
  kunci: string;
  kota_id: number;
  nama_kota: string;
  latitude: number;
  longitude: number;
  cuaca_json: string;
  aqi_json: string;
  disimpan_pada: number;
  jumlah_dibuka?: number;
}

class WebSQLiteDatabase {
  async getFirstAsync<T>(
    query: string,
    params: any[] = []
  ): Promise<T | null> {
    const q = query.trim().toUpperCase();

    if (q.includes("PRAGMA USER_VERSION")) {
      const v = await AsyncStorage.getItem(STORAGE_KEY_VERSION);
      return { user_version: v ? parseInt(v, 10) : 0 } as T;
    }

    if (q.startsWith("SELECT * FROM CACHE_CUACA WHERE KUNCI =")) {
      const kunci = params[0];
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CACHE);
      const rows: BarisCacheWeb[] = raw ? JSON.parse(raw) : [];
      const found = rows.find((r) => r.kunci === kunci);
      return (found as T) || null;
    }

    return null;
  }

  async getAllAsync<T>(query: string, _params: any[] = []): Promise<T[]> {
    const q = query.trim().toUpperCase();

    if (q.includes("FROM CACHE_CUACA")) {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CACHE);
      let rows: BarisCacheWeb[] = raw ? JSON.parse(raw) : [];

      if (q.includes("ORDER BY DISIMPAN_PADA DESC")) {
        rows.sort((a, b) => b.disimpan_pada - a.disimpan_pada);
      }

      const matchLimit = q.match(/LIMIT\s+(\d+)/);
      if (matchLimit) {
        rows = rows.slice(0, parseInt(matchLimit[1], 10));
      } else if (q.includes("LIMIT 5")) {
        rows = rows.slice(0, 5);
      }

      return rows as T[];
    }

    return [];
  }

  async runAsync(
    query: string,
    params: any[] = []
  ): Promise<{ lastInsertRowId: number; changes: number }> {
    const q = query.trim().toUpperCase();

    if (q.startsWith("INSERT OR REPLACE INTO CACHE_CUACA")) {
      const [
        kunci,
        kota_id,
        nama_kota,
        latitude,
        longitude,
        cuaca_json,
        aqi_json,
        disimpan_pada,
      ] = params;
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CACHE);
      let rows: BarisCacheWeb[] = raw ? JSON.parse(raw) : [];

      const existingIndex = rows.findIndex((r) => r.kunci === kunci);
      const newRow: BarisCacheWeb = {
        kunci,
        kota_id,
        nama_kota,
        latitude,
        longitude,
        cuaca_json,
        aqi_json,
        disimpan_pada,
        jumlah_dibuka: 0,
      };

      if (existingIndex >= 0) {
        rows[existingIndex] = newRow;
      } else {
        rows.unshift(newRow);
      }

      await AsyncStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(rows));
      return { lastInsertRowId: 1, changes: 1 };
    }

    // Hapus satu kota spesifik berdasarkan kunci dan/atau nama kota
    if (
      q.includes("WHERE KUNCI = ? OR LOWER(NAMA_KOTA) = LOWER(?)") ||
      (q.includes("WHERE KUNCI =") && q.includes("LOWER(NAMA_KOTA)"))
    ) {
      const [kunci, namaKota] = params;
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CACHE);
      if (raw) {
        const rows: BarisCacheWeb[] = JSON.parse(raw);
        const targetKunci = String(kunci || "").trim();
        const targetNama = String(namaKota || "").trim().toLowerCase();
        const filtered = rows.filter((r) => {
          const matchKunci = targetKunci && r.kunci === targetKunci;
          const matchNama = targetNama && r.nama_kota.toLowerCase() === targetNama;
          return !(matchKunci || matchNama);
        });
        await AsyncStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(filtered));
      }
      return { lastInsertRowId: 0, changes: 1 };
    }

    if (q.includes("WHERE KUNCI =")) {
      const [kunci] = params;
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CACHE);
      if (raw) {
        const rows: BarisCacheWeb[] = JSON.parse(raw);
        const targetKunci = String(kunci || "").trim();
        const filtered = rows.filter((r) => r.kunci !== targetKunci);
        await AsyncStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(filtered));
      }
      return { lastInsertRowId: 0, changes: 1 };
    }

    if (q.includes("WHERE LOWER(NAMA_KOTA) =")) {
      const [namaKota] = params;
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CACHE);
      if (raw) {
        const rows: BarisCacheWeb[] = JSON.parse(raw);
        const targetNama = String(namaKota || "").trim().toLowerCase();
        const filtered = rows.filter((r) => r.nama_kota.toLowerCase() !== targetNama);
        await AsyncStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(filtered));
      }
      return { lastInsertRowId: 0, changes: 1 };
    }

    // Invalidation otomatis: bersihkan data lebih tua dari batas waktu
    if (q.includes("WHERE DISIMPAN_PADA <")) {
      const batasWaktu = params[0];
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CACHE);
      if (raw) {
        const rows: BarisCacheWeb[] = JSON.parse(raw);
        const filtered = rows.filter((r) => r.disimpan_pada >= batasWaktu);
        await AsyncStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(filtered));
      }
      return { lastInsertRowId: 0, changes: 1 };
    }

    // Invalidation manual: hanya hapus seluruh cache jika query tepat "DELETE FROM CACHE_CUACA" (tanpa WHERE)
    if (q === "DELETE FROM CACHE_CUACA") {
      await AsyncStorage.removeItem(STORAGE_KEY_CACHE);
      return { lastInsertRowId: 0, changes: 1 };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  async execAsync(queries: string): Promise<void> {
    const lines = queries.split(";");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const upper = line.toUpperCase();
      if (upper.startsWith("PRAGMA USER_VERSION =")) {
        const parts = line.split("=");
        if (parts.length > 1) {
          const ver = parts[1].trim();
          await AsyncStorage.setItem(STORAGE_KEY_VERSION, ver);
        }
      }
    }
  }
}

let dbInstance: any = null;

export async function ambilDatabase(): Promise<any> {
  if (!dbInstance) {
    dbInstance = new WebSQLiteDatabase();
    await dbInstance.execAsync("PRAGMA user_version = 2");
  }
  return dbInstance;
}
