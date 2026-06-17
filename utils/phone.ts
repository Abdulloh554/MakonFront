const UZ_OPERATORS = [
  "90",
  "91",
  "93",
  "94",
  "95",
  "97",
  "98",
  "99",
  "33",
  "88",
  "77",
  "50",
  "55",
  "66",
  "70",
  "71",
];

export function normalizePhone(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return "+" + digits;
  }
  if (digits.length === 9) {
    return "+998" + digits;
  }
  if (digits.length === 11 && digits.startsWith("8")) {
    return "+998" + digits.slice(1);
  }
  if (digits.length === 13 && digits.startsWith("998")) {
    return "+" + digits;
  }
  return raw.trim();
}

export function isValidUzbekPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  const match = normalized.match(/^\+998(\d{2})(\d{7})$/);
  if (!match) return false;
  return UZ_OPERATORS.includes(match[1]);
}

export function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";

  let result = "+998";
  const rest = digits.startsWith("998")
    ? digits.slice(3)
    : digits.startsWith("8")
      ? digits.slice(1)
      : digits;

  if (rest.length > 0) result += " " + rest.slice(0, 2);
  if (rest.length > 2) result += " " + rest.slice(2, 5);
  if (rest.length > 5) result += " " + rest.slice(5, 7);
  if (rest.length > 7) result += " " + rest.slice(7, 9);

  return result;
}

export function formatLocalPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (!digits.length) return "";

  let result = digits.slice(0, 2);
  if (digits.length > 2) result += " " + digits.slice(2, 5);
  if (digits.length > 5) result += " " + digits.slice(5, 7);
  if (digits.length > 7) result += " " + digits.slice(7, 9);

  return result;
}
