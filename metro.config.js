// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tambahkan ekstensi wasm agar Metro dapat me-resolve binary WebAssembly wa-sqlite pada expo-sqlite (Web)
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

// Konfigurasi header COEP & COOP untuk mendukung SharedArrayBuffer / SQLite WebAssembly di Metro development server
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
