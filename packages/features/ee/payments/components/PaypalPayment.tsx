import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { Payment } from "@prisma/client";

type Props = {
  payment: Payment;
};

export default function PaypalPaymentComponent(props: Props) {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": "AQWBHYEPy0pLOR9coJcK0Ve4zSheTYHwEzTMLSDWlEyHaAELb6Br_pFERk0YD2hSYXl_hS9zZrJ0j1h-",
      }}>
      <div className="rounded bg-white p-3 pt-5">
        <PayPalButtons
          createOrder={async () => {
            const body = {
              amount: props.payment.amount,
              currency: props.payment.currency,
              intent: props.payment.paymentOption,
            };
            const response = await fetch("/api/integrations/paypal/order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
            const { id } = await response.json();
            return id;
          }}
          onApprove={async ({ orderID }, actions) => {
            console.log({ orderID });
            const response = await fetch(`/api/integrations/paypal/capture?orderID=${orderID}`, {
              method: "POST",
            });

            const res = await response.json();
            const { details, debug_id, purchase_units } = res;

            // Three cases to handle:
            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            //   (2) Other non-recoverable errors -> Show a failure message
            //   (3) Successful transaction -> Show confirmation or thank you

            const error = Array.isArray(details) && details[0];
            if (error && error.issue === "INSTRUMENT_DECLINED") {
              return actions.restart(); // Recoverable state, per:
              // https://developer.paypal.com/docs/checkout/integration-features/funding-failure/
            }

            if (error) {
              // TODO: display some kind of error
              console.error(error.description);
              if (debug_id) console.error(debug_id);
              return alert("it broked");
            }

            console.log("Capture result", res, JSON.stringify(res, null, 2));
            const transaction = purchase_units[0].payments.captures[0];
            console.log(
              "Transaction " +
                transaction.status +
                ": " +
                transaction.id +
                "See console for all available details"
            );

            // transaction completed :)
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
