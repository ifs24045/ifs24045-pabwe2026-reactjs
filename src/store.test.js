import { describe, it, expect } from "vitest";
import store, { createStore } from "./store";
import { setUsersActionCreator, setProfileActionCreator } from "./features/users/states/action";
import { ActionType as AuthActionType } from "./features/auth/states/action";

describe("store", () => {
  it("memuat semua slice reducer dari fitur auth, users, dan lost-founds", () => {
    const keys = Object.keys(createStore().getState());

    expect(keys).toEqual(
      expect.arrayContaining([
        // auth
        "isAuthLogin",
        "isAuthRegister",
        "isAuthLogout",
        // users
        "users",
        "user",
        "profile",
        "isProfile",
        "isChangeProfile",
        "isChangeProfilePhoto",
        "isChangeProfilePassword",
        // lost-founds
        "lostFounds",
        "lostFound",
        "isLostFound",
        "isLostFoundAdd",
        "isLostFoundAdded",
        "isLostFoundChange",
        "isLostFoundChanged",
        "isLostFoundChangeCover",
        "isLostFoundChangedCover",
        "isLostFoundDelete",
        "isLostFoundDeleted",
        "lostFoundStats",
      ])
    );
    expect(keys).toHaveLength(22);
  });

  it("memiliki state awal yang benar", () => {
    const state = createStore().getState();

    expect(state.isAuthLogin).toBe(false);
    expect(state.users).toEqual([]);
    expect(state.profile).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isProfile).toBe(false);
    expect(state.lostFounds).toEqual([]);
  });

  it("menerima preloadedState", () => {
    const state = createStore({ isAuthLogin: true, users: [{ id: "1" }] }).getState();

    expect(state.isAuthLogin).toBe(true);
    expect(state.users).toEqual([{ id: "1" }]);
    expect(state.profile).toBeNull();
  });

  it("memperbarui state ketika action di-dispatch", () => {
    const testStore = createStore();

    testStore.dispatch(setUsersActionCreator([{ id: "1", name: "Budi" }]));
    testStore.dispatch(setProfileActionCreator({ id: "1", name: "Budi" }));
    testStore.dispatch({
      type: AuthActionType.SET_IS_AUTH_LOGIN,
      payload: { status: true },
    });

    const state = testStore.getState();
    expect(state.users).toEqual([{ id: "1", name: "Budi" }]);
    expect(state.profile).toEqual({ id: "1", name: "Budi" });
    expect(state.isAuthLogin).toBe(true);
  });

  it("membuat store baru yang terpisah setiap createStore dipanggil", () => {
    const a = createStore();
    const b = createStore();

    a.dispatch(setUsersActionCreator([{ id: "1" }]));

    expect(a.getState().users).toHaveLength(1);
    expect(b.getState().users).toHaveLength(0);
  });

  it("mengekspor store singleton sebagai default export", () => {
    expect(typeof store.getState).toBe("function");
    expect(typeof store.dispatch).toBe("function");
    expect(store.getState().users).toEqual([]);
  });
});