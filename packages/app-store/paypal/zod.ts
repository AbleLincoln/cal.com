import { z } from "zod";

import { eventTypeAppCardZod } from "@calcom/app-store/eventTypeAppCardZod";

import { paymentOptions } from "./lib/constants";

// Extract the payment options enum from paymentOptions
// https://stackoverflow.com/a/73825370
type PaymentOption = (typeof paymentOptions)[number]["value"];
const VALUES: [PaymentOption, ...PaymentOption[]] = [
  paymentOptions[0].value,
  ...paymentOptions.slice(1).map((option) => option.value),
];
export const paymentOptionEnum = z.enum(VALUES);

export const appDataSchema = eventTypeAppCardZod.merge(
  z.object({
    price: z.number(),
    currency: z.string(),
    paymentOption: paymentOptionEnum.optional(),
  })
);
export const appKeysSchema = z.object({
  client_id: z.string().min(1),
  app_secret: z.string().min(1),
});
