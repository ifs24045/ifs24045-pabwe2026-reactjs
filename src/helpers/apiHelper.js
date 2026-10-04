const ACCESS_TOKEN_KEY = "accessToken";

/** Ambil token dari localStorage (null jika belum login). */
function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Simpan token ke localStorage. */
function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/** Hapus token dari localStorage (dipakai saat logout). */
function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/** Susun query string dari object, nilai kosong dilewati. */
function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * Wrapper fetch ke REST API Delcom.
 * - path    : contoh "/auth/login"
 * - params  : query params, contoh { status: "lost", is_completed: 0 }
 * - body    : object (dikirim sebagai JSON) atau FormData (untuk upload file)
 * - auth    : sertakan header Authorization Bearer jika true
 */
async function fetchApi(
  path,
  { method = "GET", params, body, headers = {}, auth = true } = {}
) {
  const finalHeaders = { ...headers };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody;
  if (body instanceof FormData) {
    // Content-Type diisi otomatis oleh browser (beserta boundary)
    finalBody = body;
  } else if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(`${DELCOM_BASEURL}${path}${buildQuery(params)}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || "Terjadi kesalahan pada server");
  }

  return responseJson;
}

export {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  buildQuery,
  fetchApi,
};