import fetch from "node-fetch";

import { getPaypalAppKeys } from ".";

export async function getAccessToken() {
  const { client_id, app_secret } = await getPaypalAppKeys();

  const url = "https://api-m.sandbox.paypal.com/v1/oauth2/token";
  const response = await fetch(url, {
    body: "grant_type=client_credentials",
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(client_id + ":" + app_secret).toString("base64"),
    },
  });
  const { access_token } = await response.json();
  return access_token;
}
