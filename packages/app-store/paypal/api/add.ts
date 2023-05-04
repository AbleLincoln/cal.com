import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@calcom/prisma";

import { getAccessToken } from "../lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await prisma.user.findUnique({
    where: {
      id: req.session?.user?.id,
    },
    select: {
      email: true,
      name: true,
    },
  });

  const headers = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  };
  const body = {
    email: user?.email,
    operations: [
      {
        operation: "API_INTEGRATION",

        api_integration_preference: {
          rest_api_integration: {
            integration_method: "PAYPAL",

            integration_type: "THIRD_PARTY",

            third_party_details: {
              features: ["PAYMENT", "REFUND"],
            },
          },
        },
      },
    ],
    products: ["EXPRESS_CHECKOUT"],
    legal_consents: [
      {
        type: "SHARE_DATA_CONSENT",
        granted: false,
      },
    ],
  };

  const response = await fetch("https://api-m.sandbox.paypal.com/v2/customer/partner-referrals", {
    headers,
    method: "POST",
    body: JSON.stringify(body),
  });

  const { links } = await response.json();
  const { href } = links.find(({ rel }) => rel === "action_url");
  res.status(200).json({ url: href });
}
