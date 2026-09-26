import { type Bank, banks } from "../../data/banks";
export const bankDetectorHandler = (cardNumber: string): Bank | null => {
  const existBank=banks.find((bank)=>bank.tempNumber.some(item=>cardNumber.startsWith(item)));
  if(existBank){
    return existBank;
  }
  return null;
};
