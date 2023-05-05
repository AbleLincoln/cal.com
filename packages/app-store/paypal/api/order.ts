import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@calcom/prisma";

import { getAccessToken } from "../lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { amount: value, currency: currency_code, intent } = req.body;
    const {
      key: { merchant_id_in_paypal },
    } = await prisma.credential.findFirst({
      where: {
        appId: "paypal",
        userId: req.session?.user.id,
      },
      select: {
        key: true,
      },
    });

    const url = "https://api-m.sandbox.paypal.com/v2/checkout/orders";
    const payload = {
      intent: intent === "ON_BOOKING" ? "CAPTURE" : "AUTHORIZE", // TODO: dynamic whether bill now or no-show fee
      purchase_units: [
        {
          amount: {
            value,
            currency_code,
          },
          payee: {
            merchant_id: merchant_id_in_paypal,
          },
        },
      ],
    };
    const headers = {
      Authorization: `Bearer ${await getAccessToken()}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify(payload),
    });
    const { id, error } = await response.json();
    if (error) {
      throw new Error(error);
    }
    res.send({ id });
  }
}
