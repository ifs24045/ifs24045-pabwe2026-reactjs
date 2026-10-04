import { describe, it, expect } from "vitest";
import {
  lostFoundsReducer,
  lostFoundReducer,
  isLostFoundReducer,
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
  lostFoundStatsReducer,
} from "./reducer";
import {
  setLostFoundsActionCreator,
  setLostFoundActionCreator,
  setIsLostFoundActionCreator,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangedActionCreator,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
  setLostFoundStatsActionCreator,
} from "./action";

describe("lost-founds reducer", () => {
  describe("lostFoundsReducer", () => {
    it("bernilai array kosong secara bawaan", () => {
      expect(lostFoundsReducer(undefined, {})).toEqual([]);
    });

    it("mengganti daftar laporan", () => {
      const list = [{ id: 1 }, { id: 2 }];
      expect(lostFoundsReducer([], setLostFoundsActionCreator(list))).toEqual(list);
    });

    it("mengabaikan action lain", () => {
      expect(lostFoundsReducer([{ id: 1 }], { type: "UNKNOWN" })).toEqual([{ id: 1 }]);
    });
  });

  describe("lostFoundReducer", () => {
    it("bernilai null secara bawaan", () => {
      expect(lostFoundReducer(undefined, {})).toBeNull();
    });

    it("mengganti dan mengosongkan detail laporan", () => {
      const filled = lostFoundReducer(null, setLostFoundActionCreator({ id: "abc" }));

      expect(filled).toEqual({ id: "abc" });
      expect(lostFoundReducer(filled, setLostFoundActionCreator(null))).toBeNull();
    });

    it("mengabaikan action lain", () => {
      expect(lostFoundReducer({ id: "abc" }, { type: "UNKNOWN" })).toEqual({ id: "abc" });
    });
  });

  describe("lostFoundStatsReducer", () => {
    it("bernilai null secara bawaan", () => {
      expect(lostFoundStatsReducer(undefined, {})).toBeNull();
    });

    it("mengganti statistik", () => {
      const stats = { daily: [1], monthly: [2] };
      expect(lostFoundStatsReducer(null, setLostFoundStatsActionCreator(stats))).toEqual(stats);
    });

    it("mengabaikan action lain", () => {
      expect(lostFoundStatsReducer({ daily: [] }, { type: "UNKNOWN" })).toEqual({ daily: [] });
    });
  });

  describe.each([
    ["isLostFoundReducer", isLostFoundReducer, setIsLostFoundActionCreator],
    ["isLostFoundAddReducer", isLostFoundAddReducer, setIsLostFoundAddActionCreator],
    ["isLostFoundAddedReducer", isLostFoundAddedReducer, setIsLostFoundAddedActionCreator],
    ["isLostFoundChangeReducer", isLostFoundChangeReducer, setIsLostFoundChangeActionCreator],
    ["isLostFoundChangedReducer", isLostFoundChangedReducer, setIsLostFoundChangedActionCreator],
    ["isLostFoundChangeCoverReducer", isLostFoundChangeCoverReducer, setIsLostFoundChangeCoverActionCreator],
    ["isLostFoundChangedCoverReducer", isLostFoundChangedCoverReducer, setIsLostFoundChangedCoverActionCreator],
    ["isLostFoundDeleteReducer", isLostFoundDeleteReducer, setIsLostFoundDeleteActionCreator],
    ["isLostFoundDeletedReducer", isLostFoundDeletedReducer, setIsLostFoundDeletedActionCreator],
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

    it("mengabaikan action status dari reducer lain", () => {
      const other = [
        setIsLostFoundActionCreator,
        setIsLostFoundAddActionCreator,
        setIsLostFoundDeleteActionCreator,
      ].find((c) => c !== creator);

      expect(reducer(false, other(true))).toBe(false);
    });
  });
});