const logDatetime = () => {
  const pad = (n: number, length = 2) => {
    return String(n).padStart(length, '0');
  }

  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const ms = pad(now.getMilliseconds(), 3); // pad to 3 digits

  return `${yy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}`;
};

export default logDatetime;