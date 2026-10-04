import { describe, it, expect } from "vitest";
import {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
} from "./reducer";
import {
  setUsersActionCreator,
  setUserActionCreator,
  setProfileActionCreator,
  setIsProfileActionCreator,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsChangeProfilePasswordActionCreator,
} from "./action";

describe("users reducer", () => {
  describe("usersReducer", () => {
    it("bernilai array kosong secara bawaan", () => {
      expect(usersReducer(undefined, {})).toEqual([]);
    });

    it("mengganti daftar pengguna", () => {
      const users = [{ id: 1 }, { id: 2 }];
      expect(usersReducer([], setUsersActionCreator(users))).toEqual(users);
    });

    it("mengabaikan action lain", () => {
      expect(usersReducer([{ id: 1 }], { type: "UNKNOWN" })).toEqual([{ id: 1 }]);
    });
  });

  describe("userReducer", () => {
    it("bernilai null secara bawaan", () => {
      expect(userReducer(undefined, {})).toBeNull();
    });

    it("mengganti pengguna terpilih", () => {
      expect(userReducer(null, setUserActionCreator({ id: 3 }))).toEqual({ id: 3 });
    });

    it("mengabaikan action lain", () => {
      expect(userReducer({ id: 3 }, { type: "UNKNOWN" })).toEqual({ id: 3 });
    });
  });

  describe("profileReducer", () => {
    it("bernilai null secara bawaan", () => {
      expect(profileReducer(undefined, {})).toBeNull();
    });

    it("mengganti dan mengosongkan profil", () => {
      const profile = { id: 1, name: "Budi" };
      const filled = profileReducer(null, setProfileActionCreator(profile));

      expect(filled).toEqual(profile);
      expect(profileReducer(filled, setProfileActionCreator(null))).toBeNull();
    });

    it("mengabaikan action lain", () => {
      expect(profileReducer({ id: 1 }, { type: "UNKNOWN" })).toEqual({ id: 1 });
    });
  });

  describe.each([
    ["isProfileReducer", isProfileReducer, setIsProfileActionCreator],
    ["isChangeProfileReducer", isChangeProfileReducer, setIsChangeProfileActionCreator],
    ["isChangeProfilePhotoReducer", isChangeProfilePhotoReducer, setIsChangeProfilePhotoActionCreator],
    ["isChangeProfilePasswordReducer", isChangeProfilePasswordReducer, setIsChangeProfilePasswordActionCreator],
  ])("%s", (_name, reducer, creator) => {
    it("bernilai false secara bawaan", () => {
      expect(reducer(undefined, {})).toBe(false);
    });

    it("mengubah nilai sesuai action", () => {
      expect(reducer(false, creator(true))).toBe(true);
      expect(reducer(true, creator(false))).toBe(false);
    });

    it("mengabaikan action lain", () => {
      expect(reducer(true, { type: "UNKNOWN" })).toBe(true);
    });
  });
});