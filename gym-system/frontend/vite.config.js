import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // La entrada ESM de tfjs-tflite viene rota; se usa su bundle ya armado
      "@tensorflow/tfjs-tflite": fileURLToPath(
        new URL("./node_modules/@tensorflow/tfjs-tflite/dist/tf-tflite.fesm.js", import.meta.url)
      ),
    },
  },
  server: {
    port: 5173,
  },
});
