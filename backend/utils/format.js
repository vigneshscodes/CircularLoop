export const toNative = value => {
  if (value && typeof value.toNumber === "function") return value.toNumber();
  if (Array.isArray(value)) return value.map(toNative);
  if (value && typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto === Object.prototype || proto === null) {
      return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,toNative(v)]));
    }
  }
  return value;
};
export function recordObject(record) {
  return Object.fromEntries(record.keys.map(k => [k, toNative(record.get(k))]));
}
export const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
export function validId(value) { return typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value); }
