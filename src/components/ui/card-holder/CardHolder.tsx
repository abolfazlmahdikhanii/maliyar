import { useMemo } from "react";
import { bankDetectorHandler } from "../../../utils/bankDetector";

type CardHolderProps = {
  cardNumber: string[];
  iban?: string;
  isForm?: boolean;
  type?: "card" | "wallet";

};

const CardHolder = ({
  cardNumber,
  iban,
  isForm = false,
  type = "card",

}: CardHolderProps) => {
  const bankData = useMemo(() => bankDetectorHandler(cardNumber.join("")), [
    cardNumber,
  ]);
  const hasRecognizedCard =
    type === "card" && cardNumber.length > 0 && bankData !== null;

  const cardNumberGroups = hasRecognizedCard
    ? cardNumber.map((number, index) =>
        !isForm && (index === 1 || index === 2) ? "****" : number,
      )
    : Array(4).fill("****");
  const backgroundImage =
    type === "wallet"
      ? "/images/banks/wallet.svg"
      : bankData?.bg ?? "/images/banks/nobank.svg";

  return (
    <div>
      <div
        className="relative h-65 w-full bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "100%",
        }}
      >
        <div
          className="absolute inset-x-0 top-[49.5%] flex flex-row-reverse items-center justify-center gap-x-12 text-2xl font-semibold tracking-wide"
          style={{ color: bankData?.color }}
        >
          {cardNumberGroups.map((group, index) => (
            <p key={`${group}-${index}`}>{group}</p>
          ))}
        </div>
        {iban ? (
          <div
            className="absolute bottom-[12.5%] left-16 -translate-x-1/2 text-sm tracking-wide"
            style={{ color: bankData?.color }}
          >
            <p>{`IR-${iban}`}</p>
          </div>
        ) : (
          <div
            className="absolute bottom-[12.5%] left-24 -translate-x-1/2 text-sm tracking-wide"
            style={{ color: bankData?.color }}
          >
            <p className="text-[13px]">
              {hasRecognizedCard ? "شماره شبا ثبت نشده" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardHolder;
