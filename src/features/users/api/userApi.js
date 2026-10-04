import { fetchApi } from "../../../helpers/apiHelper";

const userApi = {
  /** GET /users → daftar semua pengguna */
  async getUsers() {
    const responseJson = await fetchApi("/users");
    return responseJson.data.users;
  },

  /** GET /users/me → data profil pengguna yang sedang login */
  async getMe() {
    const responseJson = await fetchApi("/users/me");
    return responseJson.data.user;
  },

  /** PUT /users/me → ubah nama dan email */
  async putMe({ name, email }) {
    const responseJson = await fetchApi("/users/me", {
      method: "PUT",
      body: { name, email },
    });
    return responseJson.message;
  },

  /** POST /users/me/photo → unggah foto profil (multipart/form-data) */
  async postMePhoto(photo) {
    const formData = new FormData();
    formData.append("photo", photo);

    const responseJson = await fetchApi("/users/me/photo", {
      method: "POST",
      body: formData,
    });
    return responseJson.message;
  },

  /** PUT /users/me/password → ganti kata sandi */
  async putMePassword({ password, newPassword }) {
    const responseJson = await fetchApi("/users/me/password", {
      method: "PUT",
      body: { password, new_password: newPassword },
    });
    return responseJson.message;
  },
};

export default userApi;