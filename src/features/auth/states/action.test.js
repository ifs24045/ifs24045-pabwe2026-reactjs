import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setIsAuthLoginActionCreator,
  setIsAuthRegisterActionCreator,
  setIsAuthLogoutActionCreator,
  asyncSetIsAuthLogin,
  asyncSetIsAuthRegister,
  asyncSetIsAuthLogout,
} from "./action";
import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn(), postRegister: vi.fn() },
}));
vi.mock("../../../helpers/apiHelper", () => ({
  putAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("auth action", () => {
  let dispatch;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatch = vi.fn();
  });

  describe("action creators", () => {
    it("setIsAuthLoginActionCreator membuat action yang benar", () => {
      expect(setIsAuthLoginActionCreator(true)).toEqual({
        type: ActionType.SET_IS_AUTH_LOGIN,
        payload: { status: true },
      });
    });

    it("setIsAuthRegisterActionCreator membuat action yang benar", () => {
      expect(setIsAuthRegisterActionCreator(true)).toEqual({
        type: ActionType.SET_IS_AUTH_REGISTER,
        payload: { status: true },
      });
    });

    it("setIsAuthLogoutActionCreator membuat action yang benar", () => {
      expect(setIsAuthLogoutActionCreator(true)).toEqual({
        type: ActionType.SET_IS_AUTH_LOGOUT,
        payload: { status: true },
      });
    });
  });

  describe("asyncSetIsAuthLogin", () => {
    it("menyimpan token dan menandai login sukses", async () => {
      authApi.postLogin.mockResolvedValue("token-123");

      await asyncSetIsAuthLogin({ email: "a@b.com", password: "123456" })(dispatch);

      expect(authApi.postLogin).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "123456",
      });
      expect(putAccessToken).toHaveBeenCalledWith("token-123");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsAuthLoginActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsAuthLoginActionCreator(true));
      expect(showErrorDialog).not.toHaveBeenCalled();
    });

    it("menampilkan dialog error dan tidak menyimpan token jika gagal", async () => {
      authApi.postLogin.mockRejectedValue(new Error("Email atau kata sandi salah"));

      await asyncSetIsAuthLogin({ email: "a@b.com", password: "salah" })(dispatch);

      expect(putAccessToken).not.toHaveBeenCalled();
      expect(showErrorDialog).toHaveBeenCalledWith("Email atau kata sandi salah");
      expect(dispatch).not.toHaveBeenCalledWith(setIsAuthLoginActionCreator(true));
    });
  });

  describe("asyncSetIsAuthRegister", () => {
    it("menampilkan dialog sukses dan menandai registrasi sukses", async () => {
      authApi.postRegister.mockResolvedValue("Akun berhasil dibuat");

      await asyncSetIsAuthRegister({
        name: "Budi",
        email: "budi@b.com",
        password: "123456",
      })(dispatch);

      expect(showSuccessDialog).toHaveBeenCalledWith("Akun berhasil dibuat");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsAuthRegisterActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsAuthRegisterActionCreator(true));
    });

    it("menampilkan dialog error jika registrasi gagal", async () => {
      authApi.postRegister.mockRejectedValue(new Error("Email sudah terdaftar"));

      await asyncSetIsAuthRegister({
        name: "Budi",
        email: "budi@b.com",
        password: "123456",
      })(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar");
      expect(showSuccessDialog).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalledWith(setIsAuthRegisterActionCreator(true));
    });
  });

  describe("asyncSetIsAuthLogout", () => {
    it("menghapus token, mereset status login, dan menandai logout", async () => {
      await asyncSetIsAuthLogout()(dispatch);

      expect(removeAccessToken).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsAuthLoginActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsAuthLogoutActionCreator(true));
    });
  });
});