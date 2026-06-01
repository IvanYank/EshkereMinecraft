export default async function accessRequest(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("Отсутствует токен авторизации");
  }

  let response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 403) {
    const refreshResponse = await fetch("/api/users/refresh/", {
      method: "POST",
    });

    if (!refreshResponse.ok) {
      localStorage.removeItem("accessToken");
      throw new Error("Отсутствует токен обновления");
    }

    const refreshData = await refreshResponse.json();

    accessToken = refreshData.access
    localStorage.setItem("accessToken", refreshData.access);

    response = await fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return response;
}