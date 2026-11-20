import type { CSSProperties } from "react";
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
  const bankData = useMemo(
    () => bankDetectorHandler(cardNumber.join("")),
    [cardNumber],
  );
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
      : (bankData?.bg ?? "/images/banks/nobank.svg");

  return (
    <div className="@container">
      <div
        className="relative w-full bg-no-repeat sm:h-65 bg-size-[100%] bg-secondary sm:bg-[image:var(--card-bg)] rounded-t-2xl"
        style={{ backgroundImage: `url(${backgroundImage})` } as CSSProperties}
      >
        <img
          src={backgroundImage}
          alt=""
          className="block h-auto w-full  sm:hidden  relative -z-10"
        />

        <div
          className="absolute inset-x-0 top-[49.5%] flex flex-row-reverse items-center justify-center gap-x-[8cqw] text-[5.5cqw] font-semibold tracking-wide sm:gap-x-12 sm:text-2xl"
          style={{ color: bankData?.color }}
        >
          {cardNumberGroups.map((group, index) => (
            <p key={`${group}-${index}`}>{group}</p>
          ))}
        </div>

        {iban ? (
          <div
            className="absolute bottom-[12.5%] left-[18%] -translate-x-1/2 text-[3.6cqw] tracking-wide sm:left-16 sm:text-sm"
            style={{ color: bankData?.color }}
          >
            <p>{`IR-${iban}`}</p>
          </div>
        ) : (
          <div
            className="absolute bottom-[12.5%] left-[26%] -translate-x-1/2 text-[3.6cqw] tracking-wide sm:left-24 sm:text-sm"
            style={{ color: bankData?.color }}
          >
            <p className="text-[3.4cqw] sm:text-[13px]">
              {hasRecognizedCard ? "شماره شبا ثبت نشده" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardHolder;
