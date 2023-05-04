import type { NextApiRequest, NextApiResponse } from "next";

import { getAccessToken } from "../lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderID } = req.query;
  console.log({ orderID });

  const url = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`;
  const headers = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(url, {
    headers,
    method: "POST",
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  res.json(data);
}
