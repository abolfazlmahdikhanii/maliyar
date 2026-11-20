import { InputGroup, Tag, TagGroup, TextField } from "@heroui/react";
import { formatNumber } from "../../../utils/formatNumber";
import TomanIcon from "../toman-icon/TomanIcon";
const suggestPrice = [
  {
    id: crypto.randomUUID(),
    num: "50_000",
    price: "50 هزار",
  },
  {
    id: crypto.randomUUID(),
    num: "100_000",
    price: "100 هزار",
  },
  {
    id: crypto.randomUUID(),
    num: "500_000",
    price: "500 هزار",
  },
  {
    id: crypto.randomUUID(),
    num: "1_000_000",
    price: "1 میلیون",
  },
  {
    id: crypto.randomUUID(),
    num: "5_000_000",
    price: "5 میلیون",
  },
];

type InputPriceProps = {
  price: string;
  setPrice: (data: string) => void;
};

const InputPrice = ({ price, setPrice }: InputPriceProps) => {
  return (
    <section className="mt-4 flex w-full max-w-2xl flex-col items-center justify-center gap-5 sm:gap-6">
      <TextField className="w-full min-w-0" name="primary">
        <InputGroup className="w-full min-w-0 bg-transparent focus-within:ring-0 focus-within:shadow-none">
          <InputGroup.Input
            placeholder="0"
            inputMode="numeric"
            value={formatNumber(price)}
            className="w-full min-w-0 origin-center border-b-3 border-secondary py-4 text-center text-2xl font-semibold transition-all duration-200 focus:border-b-primary focus:outline-none focus:ring-0 sm:py-5 sm:text-3xl"
            onChange={(e) => setPrice(e.target.value)}
          />
          <InputGroup.Prefix className="shrink-0">
             <span className="hidden lg:block">
               <TomanIcon width="24" height="24" />

             </span>
             <span className="lg:hidden">
               <TomanIcon width="20" height="20" />
               
             </span>
          </InputGroup.Prefix>
        </InputGroup>
      </TextField>

      <TagGroup selectionMode="single" size="lg" className="w-full">
        <TagGroup.List className="flex flex-wrap justify-center gap-2">
          {suggestPrice.map((item) => (
            <Tag
              key={item.id}
              className="rounded-xl border border-secondary bg-secondary py-2 text-xs text-muted hover:border-primary hover:bg-[rgba(94,232,126,.1)] hover:text-primary"
              onClick={() => setPrice(formatNumber(item.num))}
            >
              {item.price}
            </Tag>
          ))}
        </TagGroup.List>
      </TagGroup>
    </section>
  );
};

export default InputPrice;
