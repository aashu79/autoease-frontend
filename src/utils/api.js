export function apiMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => item.description || item.message || String(item)).join(" ");
  }

  return data?.message || error?.message || fallback;
}

export function listData(response) {
  return Array.isArray(response?.data) ? response.data : [];
}
