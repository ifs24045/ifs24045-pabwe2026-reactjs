import { ActionType } from "./action";

function lostFoundsReducer(lostFounds = [], action = {}) {
  if (action.type === ActionType.SET_LOST_FOUNDS) {
    return action.payload.lostFounds;
  }
  return lostFounds;
}

function lostFoundReducer(lostFound = null, action = {}) {
  if (action.type === ActionType.SET_LOST_FOUND) {
    return action.payload.lostFound;
  }
  return lostFound;
}

/** Pembuat reducer boolean sederhana: true/false sesuai satu jenis action. */
function createStatusReducer(actionType) {
  return function statusReducer(status = false, action = {}) {
    if (action.type === actionType) return action.payload.status;
    return status;
  };
}

const isLostFoundReducer = createStatusReducer(ActionType.SET_IS_LOST_FOUND);
const isLostFoundAddReducer = createStatusReducer(ActionType.SET_IS_LOST_FOUND_ADD);
const isLostFoundAddedReducer = createStatusReducer(ActionType.SET_IS_LOST_FOUND_ADDED);
const isLostFoundChangeReducer = createStatusReducer(ActionType.SET_IS_LOST_FOUND_CHANGE);
const isLostFoundChangedReducer = createStatusReducer(ActionType.SET_IS_LOST_FOUND_CHANGED);
const isLostFoundChangeCoverReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGE_COVER
);
const isLostFoundChangedCoverReducer = createStatusReducer(
  ActionType.SET_IS_LOST_FOUND_CHANGED_COVER
);
const isLostFoundDeleteReducer = createStatusReducer(ActionType.SET_IS_LOST_FOUND_DELETE);
const isLostFoundDeletedReducer = createStatusReducer(ActionType.SET_IS_LOST_FOUND_DELETED);

function lostFoundStatsReducer(stats = null, action = {}) {
  if (action.type === ActionType.SET_LOST_FOUND_STATS) {
    return action.payload.stats;
  }
  return stats;
}

export {
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
};