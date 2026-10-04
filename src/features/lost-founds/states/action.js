import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const ActionType = {
  SET_LOST_FOUNDS: "SET_LOST_FOUNDS",
  SET_LOST_FOUND: "SET_LOST_FOUND",
  SET_IS_LOST_FOUND: "SET_IS_LOST_FOUND",
  SET_IS_LOST_FOUND_ADD: "SET_IS_LOST_FOUND_ADD",
  SET_IS_LOST_FOUND_ADDED: "SET_IS_LOST_FOUND_ADDED",
  SET_IS_LOST_FOUND_CHANGE: "SET_IS_LOST_FOUND_CHANGE",
  SET_IS_LOST_FOUND_CHANGED: "SET_IS_LOST_FOUND_CHANGED",
  SET_IS_LOST_FOUND_CHANGE_COVER: "SET_IS_LOST_FOUND_CHANGE_COVER",
  SET_IS_LOST_FOUND_CHANGED_COVER: "SET_IS_LOST_FOUND_CHANGED_COVER",
  SET_IS_LOST_FOUND_DELETE: "SET_IS_LOST_FOUND_DELETE",
  SET_IS_LOST_FOUND_DELETED: "SET_IS_LOST_FOUND_DELETED",
  SET_LOST_FOUND_STATS: "SET_LOST_FOUND_STATS",
};

/* ---------- Action creators ---------- */

function setLostFoundsActionCreator(lostFounds) {
  return { type: ActionType.SET_LOST_FOUNDS, payload: { lostFounds } };
}

function setLostFoundActionCreator(lostFound) {
  return { type: ActionType.SET_LOST_FOUND, payload: { lostFound } };
}

function setIsLostFoundActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND, payload: { status } };
}

function setIsLostFoundAddActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_ADD, payload: { status } };
}

function setIsLostFoundAddedActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_ADDED, payload: { status } };
}

function setIsLostFoundChangeActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_CHANGE, payload: { status } };
}

function setIsLostFoundChangedActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_CHANGED, payload: { status } };
}

function setIsLostFoundChangeCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
    payload: { status },
  };
}

function setIsLostFoundChangedCoverActionCreator(status) {
  return {
    type: ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
    payload: { status },
  };
}

function setIsLostFoundDeleteActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_DELETE, payload: { status } };
}

function setIsLostFoundDeletedActionCreator(status) {
  return { type: ActionType.SET_IS_LOST_FOUND_DELETED, payload: { status } };
}

function setLostFoundStatsActionCreator(stats) {
  return { type: ActionType.SET_LOST_FOUND_STATS, payload: { stats } };
}

/* ---------- Async thunks ---------- */

/** params: { status, is_completed, is_me } */
function asyncSetLostFounds(params = {}) {
  return async (dispatch) => {
    try {
      const lostFounds = await lostFoundApi.getLostFounds(params);
      dispatch(setLostFoundsActionCreator(lostFounds));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

function asyncSetLostFound(id) {
  return async (dispatch) => {
    dispatch(setIsLostFoundActionCreator(true));
    try {
      const lostFound = await lostFoundApi.getLostFound(id);
      dispatch(setLostFoundActionCreator(lostFound));
    } catch (error) {
      dispatch(setLostFoundActionCreator(null));
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundActionCreator(false));
  };
}

function asyncSetIsLostFoundAdd({ title, description, status }) {
  return async (dispatch) => {
    dispatch(setIsLostFoundAddActionCreator(true));
    dispatch(setIsLostFoundAddedActionCreator(false));
    try {
      const { message } = await lostFoundApi.postLostFound({
        title,
        description,
        status,
      });
      showSuccessDialog(message);
      dispatch(setIsLostFoundAddedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundAddActionCreator(false));
  };
}

function asyncSetIsLostFoundChange(
  id,
  { title, description, status, isCompleted }
) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangeActionCreator(true));
    dispatch(setIsLostFoundChangedActionCreator(false));
    try {
      const message = await lostFoundApi.putLostFound(id, {
        title,
        description,
        status,
        isCompleted,
      });
      showSuccessDialog(message);
      dispatch(setIsLostFoundChangedActionCreator(true));
      await dispatch(asyncSetLostFound(id));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundChangeActionCreator(false));
  };
}

function asyncSetIsLostFoundChangeCover(id, cover) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangeCoverActionCreator(true));
    dispatch(setIsLostFoundChangedCoverActionCreator(false));
    try {
      const message = await lostFoundApi.postLostFoundCover(id, cover);
      showSuccessDialog(message);
      dispatch(setIsLostFoundChangedCoverActionCreator(true));
      await dispatch(asyncSetLostFound(id));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundChangeCoverActionCreator(false));
  };
}

function asyncSetIsLostFoundDelete(id) {
  return async (dispatch) => {
    dispatch(setIsLostFoundDeleteActionCreator(true));
    dispatch(setIsLostFoundDeletedActionCreator(false));
    try {
      const message = await lostFoundApi.deleteLostFound(id);
      showSuccessDialog(message);
      dispatch(setIsLostFoundDeletedActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
    dispatch(setIsLostFoundDeleteActionCreator(false));
  };
}

/** Memuat statistik harian dan bulanan sekaligus. */
function asyncSetLostFoundStats(params = {}) {
  return async (dispatch) => {
    try {
      const [daily, monthly] = await Promise.all([
        lostFoundApi.getStatsDaily(params),
        lostFoundApi.getStatsMonthly(params),
      ]);
      dispatch(setLostFoundStatsActionCreator({ daily, monthly }));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export {
  ActionType,
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
  asyncSetLostFounds,
  asyncSetLostFound,
  asyncSetIsLostFoundAdd,
  asyncSetIsLostFoundChange,
  asyncSetIsLostFoundChangeCover,
  asyncSetIsLostFoundDelete,
  asyncSetLostFoundStats,
};