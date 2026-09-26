// hooks/use-debounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(nilai: T, delay: number = 500): T {
  const [nilaiTertunda, setNilaiTertunda] = useState(nilai);

  useEffect(() => {
    // Pasang timer untuk memperbarui nilai setelah jeda (delay)
    const timer = setTimeout(() => {
      setNilaiTertunda(nilai);
    }, delay);

    // Batalkan timer lama jika pengguna masih mengetik huruf baru
    return () => clearTimeout(timer);
  }, [nilai, delay]);

  return nilaiTertunda;
}
