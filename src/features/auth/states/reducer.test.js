import { describe, it, expect } from "vitest";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
  isAuthLogoutReducer,
} from "./reducer";
import {
  setIsAuthLoginActionCreator,
  setIsAuthRegisterActionCreator,
  setIsAuthLogoutActionCreator,
} from "./action";

describe("auth reducer", () => {
  describe("isAuthLoginReducer", () => {
    it("bernilai false secara bawaan", () => {
      expect(isAuthLoginReducer(undefined, {})).toBe(false);
    });

    it("mengubah nilai sesuai action SET_IS_AUTH_LOGIN", () => {
      expect(isAuthLoginReducer(false, setIsAuthLoginActionCreator(true))).toBe(true);
      expect(isAuthLoginReducer(true, setIsAuthLoginActionCreator(false))).toBe(false);
    });

    it("mengabaikan action lain", () => {
      expect(isAuthLoginReducer(true, { type: "UNKNOWN" })).toBe(true);
    });
  });

  describe("isAuthRegisterReducer", () => {
    it("bernilai false secara bawaan", () => {
      expect(isAuthRegisterReducer(undefined, {})).toBe(false);
    });

    it("mengubah nilai sesuai action SET_IS_AUTH_REGISTER", () => {
      expect(isAuthRegisterReducer(false, setIsAuthRegisterActionCreator(true))).toBe(true);
    });

    it("mengabaikan action lain", () => {
      expect(isAuthRegisterReducer(true, { type: "UNKNOWN" })).toBe(true);
    });
  });

  describe("isAuthLogoutReducer", () => {
    it("bernilai false secara bawaan", () => {
      expect(isAuthLogoutReducer(undefined, {})).toBe(false);
    });

    it("mengubah nilai sesuai action SET_IS_AUTH_LOGOUT", () => {
      expect(isAuthLogoutReducer(false, setIsAuthLogoutActionCreator(true))).toBe(true);
    });

    it("mengabaikan action lain", () => {
      expect(isAuthLogoutReducer(true, { type: "UNKNOWN" })).toBe(true);
    });
  });
});