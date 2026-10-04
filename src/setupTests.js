import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Konstanta global yang di aplikasi disuntikkan oleh `define` di vite.config.js
globalThis.DELCOM_BASEURL ??= "https://open-api.delcom.org/api/v1";

afterEach(() => {
  cleanup();
  localStorage.clear();
});