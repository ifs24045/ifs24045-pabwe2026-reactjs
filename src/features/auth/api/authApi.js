import { fetchApi } from "../../../helpers/apiHelper";

const authApi = {
  /** POST /auth/login → mengembalikan token */
  async postLogin({ email, password }) {
    const responseJson = await fetchApi("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    return responseJson.data.token;
  },

  /** POST /auth/register → mengembalikan pesan dari server */
  async postRegister({ name, email, password }) {
    const responseJson = await fetchApi("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    });

    return responseJson.message;
  },
};

export default authApi;