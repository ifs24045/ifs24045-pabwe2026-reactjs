import { fetchApi } from "../../../helpers/apiHelper";

const lostFoundApi = {
  /**
   * GET /lost-founds
   * params: { status: "lost" | "found", is_completed: 0 | 1, is_me: 1 }
   */
  async getLostFounds(params = {}) {
    const responseJson = await fetchApi("/lost-founds", { params });
    return responseJson.data.lost_founds;
  },

  /** GET /lost-founds/:id */
  async getLostFound(id) {
    const responseJson = await fetchApi(`/lost-founds/${id}`);
    return responseJson.data.lost_found;
  },

  /** POST /lost-founds → mengembalikan id laporan baru */
  async postLostFound({ title, description, status }) {
    const responseJson = await fetchApi("/lost-founds", {
      method: "POST",
      body: { title, description, status },
    });
    return {
      id: responseJson.data.lost_found_id,
      message: responseJson.message,
    };
  },

  /** PUT /lost-founds/:id */
  async putLostFound(id, { title, description, status, isCompleted }) {
    const responseJson = await fetchApi(`/lost-founds/${id}`, {
      method: "PUT",
      body: {
        title,
        description,
        status,
        is_completed: isCompleted ? 1 : 0,
      },
    });
    return responseJson.message;
  },

  /** POST /lost-founds/:id/cover (multipart, field "cover") */
  async postLostFoundCover(id, cover) {
    const formData = new FormData();
    formData.append("cover", cover);

    const responseJson = await fetchApi(`/lost-founds/${id}/cover`, {
      method: "POST",
      body: formData,
    });
    return responseJson.message;
  },

  /** DELETE /lost-founds/:id */
  async deleteLostFound(id) {
    const responseJson = await fetchApi(`/lost-founds/${id}`, {
      method: "DELETE",
    });
    return responseJson.message;
  },

  /** GET /lost-founds/stats/daily */
  async getStatsDaily(params = {}) {
    const responseJson = await fetchApi("/lost-founds/stats/daily", { params });
    return responseJson.data;
  },

  /** GET /lost-founds/stats/monthly */
  async getStatsMonthly(params = {}) {
    const responseJson = await fetchApi("/lost-founds/stats/monthly", { params });
    return responseJson.data;
  },
};

export default lostFoundApi;