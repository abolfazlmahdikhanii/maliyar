import { useMemo } from "react";
import { bankDetectorHandler } from "../../../utils/bankDetector";

type CardHolderProps = {
  cardNumber: string;
};

const CardHolder = ({ cardNumber }: CardHolderProps) => {
  const bankData = useMemo(() => bankDetectorHandler(cardNumber), [cardNumber]);

  return (
    <div className="">
      <div
        className="w-full h-65 relative   bg-no-repeat"
        style={
          bankData
            ? { backgroundImage: `url(${bankData.bg})`, backgroundSize: "100%" }
            : undefined
        }
      >
        <div
          className="absolute top-[49.5%] left-9  text-xl font-semibold tracking-wide flex justify-between items-center"
          style={{ color: bankData?.color }}
        >
          <p>{cardNumber}</p>
        </div>
        <div
          className="absolute bottom-[12.5%] left-16 -translate-x-1/2 text-sm tracking-wide"
          style={{ color: bankData?.color }}
        >
          <p>IR-25694</p>
        </div>
      </div>
      <div className="box rounded-b-2xl "></div>
    </div>
  );
};

export default CardHolder;
