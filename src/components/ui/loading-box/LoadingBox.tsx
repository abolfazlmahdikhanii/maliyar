type DotsProps = {
  small?: boolean;
};
type LoadingBoxProps = {
  text?: string;
} & DotsProps;
type LoaderOverlayProps = {
  show: boolean;
} & LoadingBoxProps;
export function GooFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="goo" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -10"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </svg>
  );
}

function Dots({ small }: DotsProps) {
  const dot = small ? "h-3.5 w-3.5 -mt-[7px]" : "h-4 w-4 -mt-[7px]";
  return (
    <div
      className={`relative filter-[url(#goo)] ${
        small ? "h-4.5 w-15" : "h-9.5 w-21.5"
      }`}
    >
      <i
        className={`absolute right-0 top-1/2 rounded-full bg-primary animate-goo-right ${dot}`}
      />
      <i
        className={`absolute left-1/2 top-1/2 rounded-full bg-[#c9f89b] animate-goo-mid ${dot} ${
          small ? "-ml-1.75" : "-ml-2.5"
        }`}
      />
      <i
        className={`absolute left-0 top-1/2 rounded-full bg-primary animate-goo-left ${dot}`}
      />
    </div>
  );
}

export default function LoadingBox({
  text = "در حال دریافت اطلاعات…",
  small = false,
}: LoadingBoxProps) {
  return (
    <div
      className={`relative flex flex-col items-center overflow-hidden rounded-2xl box w-60 ${
        small
          ? "gap-3 rounded-[20px] px-8 pt-5.5 pb-4.5"
          : "gap-4.5 px-13.5 pt-8.5 pb-6"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b from-white/5 to-transparent to-40% pt-2" />

      <Dots small={small} />

      <div
        className={`rounded-full bg-black/45 blur-[6px] animate-goo-shadow ${
          small ? "h-1.5 w-10.5" : "h-2 w-15"
        }`}
      />

      <p className={`text-white/60 ${small ? "text-xs" : "text-[13px]"} pb-2`}>
        {text}
      </p>
    </div>
  );
}
export function Loader({
  text = "در حال دریافت اطلاعات…",
  small = false,
}: LoadingBoxProps) {
  return (
    <div
      className={`relative flex flex-col items-center overflow-hidden  w-full h-full justify-center ${
        small
          ? "gap-3 rounded-[20px] px-8 pt-5.5 pb-4.5"
          : "gap-4.5 px-13.5 pt-8.5 pb-6"
      }`}
    >
      

      <Dots small={small} />

      <div
        className={`rounded-full bg-black/45 blur-[6px] animate-goo-shadow ${
          small ? "h-1.5 w-10.5" : "h-2 w-15"
        }`}
      />

      <p className={`text-white/60 ${small ? "text-xs" : "text-[13px]"} pb-2`}>
        {text}
      </p>
    </div>
  );
}
export function LoaderOverlay({
  show,
  text = "در حال پردازش…",
}: LoaderOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-lg transition-opacity duration-200 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {show && (
        <div className="animate-box-in">
          <LoadingBox text={text} />
        </div>
      )}
    </div>
  );
}
