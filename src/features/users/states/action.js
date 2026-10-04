import userApi from "../api/userApi";
import { removeAccessToken } from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const ActionType = {
  SET_USERS: "SET_USERS",
  SET_USER: "SET_USER",
  SET_PROFILE: "SET_PROFILE",
  SET_IS_PROFILE: "SET_IS_PROFILE",
  SET_IS_CHANGE_PROFILE: "SET_IS_CHANGE_PROFILE",
  SET_IS_CHANGE_PROFILE_PHOTO: "SET_IS_CHANGE_PROFILE_PHOTO",
  SET_IS_CHANGE_PROFILE_PASSWORD: "SET_IS_CHANGE_PROFILE_PASSWORD",
};

/* ---------- Action creators ---------- */

function setUsersActionCreator(users) {
  return { type: ActionType.SET_USERS, payload: { users } };
}

function setUserActionCreator(user) {
  return { type: ActionType.SET_USER, payload: { user } };
}

function setProfileActionCreator(profile) {
  return { type: ActionType.SET_PROFILE, payload: { profile } };
}

function setIsProfileActionCreator(status) {
  return { type: ActionType.SET_IS_PROFILE, payload: { status } };
}

function setIsChangeProfileActionCreator(status) {
  return { type: ActionType.SET_IS_CHANGE_PROFILE, payload: { status } };
}

function setIsChangeProfilePhotoActionCreator(status) {
  return { type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: { status } };
}

function setIsChangeProfilePasswordActionCreator(status) {
  return {
    type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
    payload: { status },
  };
}

/* ---------- Async thunks ---------- */

function asyncSetUsers() {
  return async (dispatch) => {
    try {
      const users = await userApi.getUsers();
      dispatch(setUsersActionCreator(users));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

/** Muat profil pengguna yang login. Dipakai juga sebagai pengecek sesi (route guard). */
function asyncSetProfile() {
  return async (dispatch) => {
    dispatch(setIsProfileActionCreator(false));
    try {
      const profile = await userApi.getMe();
      dispatch(setProfileActionCreator(profile));
      dispatch(setIsProfileActionCreator(true));
    } catch (error) {
      // Token tidak valid / kedaluwarsa -> sesi dibersihkan
      removeAccessToken();
      dispatch(setProfileActionCreator(null));
      showErrorDialog(error.message);
    }
  };
}

function asyncSetIsChangeProfile({ name, email }) {
  return async (dispatch) => {
    dispatch(setIsChangeProfileActionCreator(false));
    try {
      const message = await userApi.putMe({ name, email });
      showSuccessDialog(message);
      dispatch(setIsChangeProfileActionCreator(true));
      await dispatch(asyncSetProfile());
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

function asyncSetIsChangeProfilePhoto(photo) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePhotoActionCreator(false));
    try {
      const message = await userApi.postMePhoto(photo);
      showSuccessDialog(message);
      dispatch(setIsChangeProfilePhotoActionCreator(true));
      await dispatch(asyncSetProfile());
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

function asyncSetIsChangeProfilePassword({ password, newPassword }) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePasswordActionCreator(false));
    try {
      const message = await userApi.putMePassword({ password, newPassword });
      showSuccessDialog(message);
      dispatch(setIsChangeProfilePasswordActionCreator(true));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export {
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
};