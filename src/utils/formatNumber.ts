export const formatNumber = (raw: string):string => {
  const digitsOnly = raw.replace(/\D/g, "");
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const faToEn = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));