export default (field: any): any => {
  if (!field) return null;
  const result = Object.assign({}, field);
  if (result.$gt && !(result.$gt instanceof Date)) result.$gt = new Date(result.$gt);
  if (result.$gte && !(result.$gte instanceof Date)) result.$gte = new Date(result.$gte);
  if (result.$lt && !(result.$lt instanceof Date)) result.$lt = new Date(result.$lt);
  if (result.$lte && !(result.$lte instanceof Date)) result.$lte = new Date(result.$lte);
  return result;
};
