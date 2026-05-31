import accessRequest from "./accessRequest";

export async function getTokensRequest() {
  const response = await accessRequest(
    "/api/users/my_tokens/"
  );

  return response.json();
}

export async function changeAvatarRequest(formData: FormData) {
  const response = await accessRequest(
    "/api/users/avatar/", {
    method: 'PATCH',
    body: formData,
  });

  return response
}

export async function changePasswordRequest(body: any) {
  const response = await accessRequest(
    "api/users/change_password/", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });

  return response
}

