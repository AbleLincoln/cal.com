import { useState } from "react";

import { useAppContextWithSchema } from "@calcom/app-store/EventTypeAppContext";
import AppCard from "@calcom/app-store/_components/AppCard";
import type { EventTypeAppCardComponent } from "@calcom/app-store/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { TextField, Select } from "@calcom/ui";

import { paymentOptions } from "../lib/constants";
import type { appDataSchema } from "../zod";

type Option = { value: string; label: string };

const EventTypeAppCard: EventTypeAppCardComponent = function EventTypeAppCard({ eventType, app }) {
  const [getAppData, setAppData] = useAppContextWithSchema<typeof appDataSchema>();
  const price = getAppData("price");
  const currency = getAppData("currency");
  const paymentOption = getAppData("paymentOption");
  const paymentOptionSelectValue = paymentOptions.find((option) => paymentOption === option.value);
  const [requirePayment, setRequirePayment] = useState(getAppData("enabled"));
  const { t } = useLocale();
  const seatsEnabled = !!eventType.seatsPerTimeSlot;

  // TODO: could this be a util now that its in 2 places?
  const getCurrencySymbol = (locale: string, currency: string) =>
    (0)
      .toLocaleString(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, "")
      .trim();

  return (
    <AppCard
      setAppData={setAppData}
      app={app}
      switchOnClick={(enabled) => {
        setRequirePayment(enabled);
      }}
      switchChecked={requirePayment}>
      <div className="mt-2 block items-center justify-start sm:flex sm:space-x-2">
        <TextField
          label=""
          className="h-[38px]"
          addOnLeading={<>{currency ? getCurrencySymbol("en", currency) : "$"}</>}
          addOnClassname="h-[38px]"
          step="0.01"
          min="0.5"
          type="number"
          required
          placeholder="Price"
          onChange={(e) => {
            setAppData("price", Number(e.target.value) * 100);
            setAppData("currency", "usd"); // TODO: remove this bs
          }}
          value={price > 0 ? price / 100 : undefined}
        />
        <Select<Option>
          defaultValue={
            paymentOptionSelectValue
              ? { ...paymentOptionSelectValue, label: t(paymentOptionSelectValue.label) }
              : { ...paymentOptions[0], label: t(paymentOptions[0].label) }
          }
          options={paymentOptions.map((option) => {
            return { ...option, label: t(option.label) || option.label };
          })}
          onChange={(input) => {
            if (input) setAppData("paymentOption", input.value);
          }}
          className="mb-1 h-[38px] w-full"
          isDisabled={seatsEnabled}
        />
      </div>
    </AppCard>
  );
};

export default EventTypeAppCard;
