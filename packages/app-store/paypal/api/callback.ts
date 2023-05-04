import type { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "querystring";

import prisma from "@calcom/prisma";

import { getAccessToken } from "../lib";

import getInstalledAppPath from "../../_utils/getInstalledAppPath";

function getReturnToValueFromQueryState(req: NextApiRequest) {
  let returnTo = "";
  try {
    returnTo = JSON.parse(`${req.query.state}`).returnTo;
  } catch (error) {
    console.info("No 'returnTo' in req.query.state");
  }
  return returnTo;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { merchantIdInPaypal, error} = req.query;
  const partner_merchant_id = process.env.PARTNER_MERCHANT_ID;

  if (error) {
    const query = stringify({ error});
    res.redirect("/apps/installed?" + query);
    return;
  }

  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

    // Track seller onboarding status
  const headers = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  }

  const response = await fetch(`https://api-m.sandbox.paypal.com/v1/customer/partners/${merchantIdInPaypal}/merchant-integrations/${partner_merchant_id}`, {
    headers,
    method: "GET"
  });

  const {payments_receivable, primary_email_confirmed, oauth_third_party, merchant_id} = await response.json();
  
  if (!payments_receivable || !primary_email_confirmed || !oauth_third_party) {
    // figure out whether to redirect to onboarding or to error page
  }

  await prisma.credential.create({
    data: {
      type: "paypal_payment",
      key: merchant_id,
      userId: req.session.user.id,
      appId: "paypal",
    },
  });

  const returnTo = getReturnToValueFromQueryState(req);
  res.redirect(returnTo || getInstalledAppPath({ variant: "payment", slug: "stripe" }));
}
