export const formatNumber = (raw: string):string => {
  const digitsOnly = raw.replace(/\D/g, "");
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
