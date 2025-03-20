import crypto from 'crypto';

const now: any = () => {
  const t = Date.now();
  const last = now.last || t;
  return (now.last = t > last ? t : last + 1);
};

const random = (digit?: number) => {
  return crypto.randomBytes((+digit || 8) / 2).toString('hex');
};

const time = (): string => {
  return now().toString(36);
};

export const uniqid = (prefix?: string, suffix?: string): string => {
  return (prefix ? prefix : '') + time() + random() + (suffix ? suffix : '');
};

uniqid.time = time;
uniqid.random = random;
