export default (sort: any): { [key: string]: 1 | 0 } => {
  if (typeof sort === 'object') return sort;
  return (
    sort &&
    sort.split(' ').reduce((o, key) => {
      if (!key) return o;
      key = key.trim();
      if (key.startsWith('-')) o[key.slice(1)] = 0;
      else o[key] = 1;
      return o;
    }, {})
  );
};
