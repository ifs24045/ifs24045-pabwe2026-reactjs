import { ActionType } from "./action";

function isAuthLoginReducer(isAuthLogin = false, action = {}) {
  if (action.type === ActionType.SET_IS_AUTH_LOGIN) {
    return action.payload.status;
  }
  return isAuthLogin;
}

function isAuthRegisterReducer(isAuthRegister = false, action = {}) {
  if (action.type === ActionType.SET_IS_AUTH_REGISTER) {
    return action.payload.status;
  }
  return isAuthRegister;
}

function isAuthLogoutReducer(isAuthLogout = false, action = {}) {
  if (action.type === ActionType.SET_IS_AUTH_LOGOUT) {
    return action.payload.status;
  }
  return isAuthLogout;
}

export { isAuthLoginReducer, isAuthRegisterReducer, isAuthLogoutReducer };