import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setUsersActionCreator,
  setUserActionCreator,
  setProfileActionCreator,
  setIsProfileActionCreator,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsChangeProfilePasswordActionCreator,
  asyncSetUsers,
  asyncSetProfile,
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePhoto,
  asyncSetIsChangeProfilePassword,
} from "./action";
import userApi from "../api/userApi";
import { removeAccessToken } from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/userApi", () => ({
  default: {
    getUsers: vi.fn(),
    getMe: vi.fn(),
    putMe: vi.fn(),
    postMePhoto: vi.fn(),
    putMePassword: vi.fn(),
  },
}));
vi.mock("../../../helpers/apiHelper", () => ({ removeAccessToken: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("users action", () => {
  let dispatch;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatch = vi.fn();
  });

  describe("action creators", () => {
    it("setUsersActionCreator", () => {
      expect(setUsersActionCreator([{ id: 1 }])).toEqual({
        type: ActionType.SET_USERS,
        payload: { users: [{ id: 1 }] },
      });
    });

    it("setUserActionCreator", () => {
      expect(setUserActionCreator({ id: 1 })).toEqual({
        type: ActionType.SET_USER,
        payload: { user: { id: 1 } },
      });
    });

    it("setProfileActionCreator", () => {
      expect(setProfileActionCreator({ id: 1 })).toEqual({
        type: ActionType.SET_PROFILE,
        payload: { profile: { id: 1 } },
      });
    });

    it.each([
      ["setIsProfileActionCreator", setIsProfileActionCreator, ActionType.SET_IS_PROFILE],
      ["setIsChangeProfileActionCreator", setIsChangeProfileActionCreator, ActionType.SET_IS_CHANGE_PROFILE],
      ["setIsChangeProfilePhotoActionCreator", setIsChangeProfilePhotoActionCreator, ActionType.SET_IS_CHANGE_PROFILE_PHOTO],
      ["setIsChangeProfilePasswordActionCreator", setIsChangeProfilePasswordActionCreator, ActionType.SET_IS_CHANGE_PROFILE_PASSWORD],
    ])("%s membuat action status", (_name, creator, type) => {
      expect(creator(true)).toEqual({ type, payload: { status: true } });
    });
  });

  describe("asyncSetUsers", () => {
    it("menyimpan daftar pengguna jika berhasil", async () => {
      userApi.getUsers.mockResolvedValue([{ id: 1 }]);

      await asyncSetUsers()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([{ id: 1 }]));
      expect(showErrorDialog).not.toHaveBeenCalled();
    });

    it("menampilkan dialog error jika gagal", async () => {
      userApi.getUsers.mockRejectedValue(new Error("Gagal memuat"));

      await asyncSetUsers()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe("asyncSetProfile", () => {
    it("menyimpan profil dan menandai profil sudah dimuat", async () => {
      userApi.getMe.mockResolvedValue({ id: 1, name: "Budi" });

      await asyncSetProfile()(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, setIsProfileActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setProfileActionCreator({ id: 1, name: "Budi" }));
      expect(dispatch).toHaveBeenNthCalledWith(3, setIsProfileActionCreator(true));
      expect(removeAccessToken).not.toHaveBeenCalled();
    });

    it("menghapus token dan mengosongkan profil jika gagal", async () => {
      userApi.getMe.mockRejectedValue(new Error("Token tidak valid"));

      await asyncSetProfile()(dispatch);

      expect(removeAccessToken).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(null));
      expect(showErrorDialog).toHaveBeenCalledWith("Token tidak valid");
      expect(dispatch).not.toHaveBeenCalledWith(setIsProfileActionCreator(true));
    });
  });

  describe("asyncSetIsChangeProfile", () => {
    it("mengubah profil, menampilkan pesan, dan memuat ulang profil", async () => {
      userApi.putMe.mockResolvedValue("Profil diperbarui");

      await asyncSetIsChangeProfile({ name: "Budi", email: "budi@b.com" })(dispatch);

      expect(userApi.putMe).toHaveBeenCalledWith({ name: "Budi", email: "budi@b.com" });
      expect(showSuccessDialog).toHaveBeenCalledWith("Profil diperbarui");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsChangeProfileActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsChangeProfileActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(3, expect.any(Function)); // asyncSetProfile
    });

    it("menampilkan dialog error jika gagal", async () => {
      userApi.putMe.mockRejectedValue(new Error("Email sudah dipakai"));

      await asyncSetIsChangeProfile({ name: "Budi", email: "budi@b.com" })(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
      expect(dispatch).not.toHaveBeenCalledWith(setIsChangeProfileActionCreator(true));
    });
  });

  describe("asyncSetIsChangeProfilePhoto", () => {
    it("mengunggah foto, menampilkan pesan, dan memuat ulang profil", async () => {
      const file = new File(["x"], "foto.png", { type: "image/png" });
      userApi.postMePhoto.mockResolvedValue("Foto diperbarui");

      await asyncSetIsChangeProfilePhoto(file)(dispatch);

      expect(userApi.postMePhoto).toHaveBeenCalledWith(file);
      expect(showSuccessDialog).toHaveBeenCalledWith("Foto diperbarui");
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsChangeProfilePhotoActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(3, expect.any(Function));
    });

    it("menampilkan dialog error jika gagal", async () => {
      userApi.postMePhoto.mockRejectedValue(new Error("File terlalu besar"));

      await asyncSetIsChangeProfilePhoto(new File(["x"], "f.png"))(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar");
      expect(dispatch).not.toHaveBeenCalledWith(setIsChangeProfilePhotoActionCreator(true));
    });
  });

  describe("asyncSetIsChangeProfilePassword", () => {
    it("mengganti kata sandi dan menampilkan pesan sukses", async () => {
      userApi.putMePassword.mockResolvedValue("Kata sandi diperbarui");

      await asyncSetIsChangeProfilePassword({
        password: "lama123",
        newPassword: "baru123",
      })(dispatch);

      expect(userApi.putMePassword).toHaveBeenCalledWith({
        password: "lama123",
        newPassword: "baru123",
      });
      expect(showSuccessDialog).toHaveBeenCalledWith("Kata sandi diperbarui");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsChangeProfilePasswordActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsChangeProfilePasswordActionCreator(true));
      expect(dispatch).toHaveBeenCalledTimes(2); // tidak perlu memuat ulang profil
    });

    it("menampilkan dialog error jika kata sandi lama salah", async () => {
      userApi.putMePassword.mockRejectedValue(new Error("Kata sandi lama salah"));

      await asyncSetIsChangeProfilePassword({
        password: "salah",
        newPassword: "baru123",
      })(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Kata sandi lama salah");
      expect(dispatch).not.toHaveBeenCalledWith(setIsChangeProfilePasswordActionCreator(true));
    });
  });
});