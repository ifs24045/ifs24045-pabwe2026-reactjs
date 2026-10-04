import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const ActionType = {
  SET_IS_AUTH_LOGIN: "SET_IS_AUTH_LOGIN",
  SET_IS_AUTH_REGISTER: "SET_IS_AUTH_REGISTER",
  SET_IS_AUTH_LOGOUT: "SET_IS_AUTH_LOGOUT",
};

/* ---------- Action creators ---------- */

function setIsAuthLoginActionCreator(status) {
  return {
    type: ActionType.SET_IS_AUTH_LOGIN,
    payload: { status },
  };
}

function setIsAuthRegisterActionCreator(status) {
  return {
    type: ActionType.SET_IS_AUTH_REGISTER,
    payload: { status },
  };
}

function setIsAuthLogoutActionCreator(status) {
  return {
    type: ActionType.SET_IS_AUTH_LOGOUT,
    payload: { status },
  };
}

/* ---------- Async thunks ---------- */

function asyncSetIsAuthLogin({ email, password }) {
  return async (dispatch) => {
    dispatch(setIsAuthLoginActionCreator(false));
    try {
      const token = await authApi.postLogin({ email, password });
      putAccessToken(token);
      dispatch(setIsAuthLoginActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

function asyncSetIsAuthRegister({ name, email, password }) {
  return async (dispatch) => {
    dispatch(setIsAuthRegisterActionCreator(false));
    try {
      const message = await authApi.postRegister({ name, email, password });
      showSuccessDialog(message);
      dispatch(setIsAuthRegisterActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

function asyncSetIsAuthLogout() {
  return async (dispatch) => {
    removeAccessToken();
    dispatch(setIsAuthLoginActionCreator(false));
    dispatch(setIsAuthLogoutActionCreator(true));
  };
}

export {
  ActionType,
  setIsAuthLoginActionCreator,
  setIsAuthRegisterActionCreator,
  setIsAuthLogoutActionCreator,
  asyncSetIsAuthLogin,
  asyncSetIsAuthRegister,
  asyncSetIsAuthLogout,
};