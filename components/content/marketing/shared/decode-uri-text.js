/** Decode percent-encoded path/text for display (Arabic slugs, mixed problem messages). */
export function decodeUriText(value) {
  if (value == null) return value;
  const str = String(value);
  if (!/%[0-9A-Fa-f]{2}/i.test(str)) return str;

  try {
    return decodeURIComponent(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/gi, (seq) => {
      try {
        return decodeURIComponent(seq);
      } catch {
        return seq;
      }
    });
  }
}
