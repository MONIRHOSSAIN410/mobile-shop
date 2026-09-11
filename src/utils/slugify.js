const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
