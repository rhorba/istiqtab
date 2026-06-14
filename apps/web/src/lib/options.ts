import { type Locale, type TriLabel, label } from "@istiqtab/core";

export type Option = { value: string; label: string };

/** Turn a trilingual label map into `{ value, label }[]` for the given locale. */
export function toOptions<K extends string>(map: Record<K, TriLabel>, locale: Locale): Option[] {
  return (Object.keys(map) as K[]).map((value) => ({ value, label: label(map, value, locale) }));
}
