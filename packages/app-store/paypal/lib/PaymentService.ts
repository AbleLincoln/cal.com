import { v4 as uuidv4 } from "uuid";

import type { IAbstractPaymentService } from "@calcom/lib/PaymentService";
import prisma from "@calcom/prisma";

export class PaymentService implements IAbstractPaymentService {
  async create(
    payment: Pick<Prisma.PaymentUncheckedCreateInput, "amount" | "currency">,
    bookingId: Booking["id"],
    bookerEmail: string,
    paymentOption: PaymentOption
  ) {
    console.log("creating PayPal payment");

    const paymentData = await prisma.payment.create({
      data: {
        uid: uuidv4(),
        app: {
          connect: {
            slug: "paypal",
          },
        },
        booking: {
          connect: {
            id: bookingId,
          },
        },
        amount: payment.amount,
        currency: payment.currency,
        externalId: uuidv4(),

        data: {},
        fee: 1,
        refunded: false,
        success: false,
        paymentOption: paymentOption || "ON_BOOKING",
      },
    });

    return paymentData;
  }

  async afterPayment() {
    console.log("after payment");
  }
}
