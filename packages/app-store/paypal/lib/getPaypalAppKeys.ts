import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";
import { appKeysSchema } from "../zod";

export const getPaypalAppKeys = () => getParsedAppKeysFromSlug("paypal", appKeysSchema);
