import { isDev } from "../../config/config.ts";
import { WebhookPingEvent } from "../ts/webhookPingEvent.ts";
import { WebhookPushEvent } from "../ts/webhookPushEvent.ts";
import { SortDirection } from "../enums/generic.ts";
import dayjs from "../../deps/deps.ts";

export const log = (...text: any[]) => isDev && console.log("[Dev]", ...text);

export const parseId = (id?: string | number | bigint | boolean) =>
  id ? BigInt(id) : null;

export const isWebhookPingEvent = (
  webhookEvent: any
): webhookEvent is WebhookPingEvent => !!webhookEvent?.zen;

export const isWebhookPushEvent = (
  webhookEvent: any
): webhookEvent is WebhookPushEvent => !webhookEvent?.zen;

export const toCamelCase = (text: string) => {
  const array = text.toLowerCase().split(/-|_/g);
  const uppered = array.map((word, i) =>
    i === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`
  );
  const cameled = uppered.join("");

  return cameled;
};
export const getNestedValue = (object: Record<any, any>, key: string): any => {
  return key.split(".").reduce((acc, k) => (acc && acc[k]) ?? null, object);
};

export const isNumber = (value: any): value is number =>
  typeof value === "number" && !isNaN(value);
export const isString = (value: any): value is string =>
  typeof value === "string";
export const isBoolean = (value: any): value is boolean =>
  typeof value === "boolean";

export const sortMap =
  (key: string | number, direction: SortDirection) => (a: any, b: any) => {
    const keyISNum = typeof key === "number";

    const aVal = keyISNum ? a[key] : getNestedValue(a, key);
    const bVal = keyISNum ? b[key] : getNestedValue(b, key);

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const validFormats = [
      "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
      "YYYY-MM-DDTHH:mm:ss.SSSZ",
      "YYYY-MM-DDTHH:mm:ss.SSSZZ",
      "YYYY-MM-DDTHH:mm:ss[Z]",
      "YYYY-MM-DDTHH:mm:ssZ",
      "YYYY-MM-DDTHH:mm:ssZZ",
    ];

    const isDate = validFormats.some((format) =>
      dayjs(aVal, format, true).isValid()
    );

    if (isDate) {
      const aDate = dayjs(aVal);
      const bDate = dayjs(bVal);

      return direction === SortDirection.Ascending
        ? aDate.diff(bDate)
        : bDate.diff(aDate);
    }

    if (isNumber(aVal) && isNumber(bVal)) {
      return direction === SortDirection.Ascending ? aVal - bVal : bVal - aVal;
    }

    if (isString(aVal) && isString(bVal)) {
      return direction === SortDirection.Ascending
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (isBoolean(aVal) && isBoolean(bVal)) {
      return direction === SortDirection.Ascending
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    }

    return 0;
  };
