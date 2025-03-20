export default (value: string): string => {
  if (!value) return value;
  if (typeof value !== 'string') throw new Error(`value must be a string`);

  const result = [];
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .forEach((word) => {
      result.push(word.charAt(0).toUpperCase() + word.slice(1));
    });

  return result?.filter((v) => v).join(' ');
};
