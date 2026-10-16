 export const cardFormatter = (number: string): string[] => {
    const digits = number.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g) ?? [];
  };