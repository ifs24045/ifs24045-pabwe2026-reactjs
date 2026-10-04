import { ActionType } from "./action";

function usersReducer(users = [], action = {}) {
  if (action.type === ActionType.SET_USERS) return action.payload.users;
  return users;
}

function userReducer(user = null, action = {}) {
  if (action.type === ActionType.SET_USER) return action.payload.user;
  return user;
}

function profileReducer(profile = null, action = {}) {
  if (action.type === ActionType.SET_PROFILE) return action.payload.profile;
  return profile;
}

function isProfileReducer(isProfile = false, action = {}) {
  if (action.type === ActionType.SET_IS_PROFILE) return action.payload.status;
  return isProfile;
}

function isChangeProfileReducer(isChangeProfile = false, action = {}) {
  if (action.type === ActionType.SET_IS_CHANGE_PROFILE) {
    return action.payload.status;
  }
  return isChangeProfile;
}

function isChangeProfilePhotoReducer(isChangeProfilePhoto = false, action = {}) {
  if (action.type === ActionType.SET_IS_CHANGE_PROFILE_PHOTO) {
    return action.payload.status;
  }
  return isChangeProfilePhoto;
}

function isChangeProfilePasswordReducer(
  isChangeProfilePassword = false,
  action = {}
) {
  if (action.type === ActionType.SET_IS_CHANGE_PROFILE_PASSWORD) {
    return action.payload.status;
  }
  return isChangeProfilePassword;
}

export {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
};