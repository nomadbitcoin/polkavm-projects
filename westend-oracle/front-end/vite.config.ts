import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log("env", process.cwd());

  return {
    plugins: [react()],
    define: {
      "process.env.WESTEND_ORACLE_MODULE": JSON.stringify(
        env.WESTEND_ORACLE_MODULE
      ),
    },
  };
});
