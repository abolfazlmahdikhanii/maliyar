import { Button } from "@heroui/react";
import { ArrowLeftUpIcon } from "@solar-icons/react/outline";
import { type ReactNode } from "react";


type CurveBoxProps={
    children:ReactNode,
    path?:string
}

const CurveBox = ({children,path}:CurveBoxProps) => {
  return (
   <div className="relative">
     <div className="box inverted-radius h-70 w-full">
        {children}
  
    </div>
      {
        path&&path.length>0&&  <Button
        isIconOnly
        className={
          " absolute top-1 left-3.5 bg-white w-13.75 h-13.75 rounded-full text-black"
        }
      >
        <ArrowLeftUpIcon size={24} />
      </Button>
      }
   </div>
  );
};

export default CurveBox;
