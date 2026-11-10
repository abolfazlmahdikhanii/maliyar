import { Form } from "@heroui/react";
import { type ReactNode, type SyntheticEvent } from "react";

type SettingFormProps = {
  id: string;
  children: ReactNode;
  title: string;
  description: string;
  onSubmit?: (e: SyntheticEvent<HTMLFormElement>) => void;
};
const SettingForm = ({
  id,
  children,
  title,
  description,
  onSubmit,
}: SettingFormProps) => {
  return (
    <section id={id} className="box rounded-2xl p-7! scroll-mt-6">
      <div className="flex flex-col gap-y-1.75">
        <h3 className="text-xl font-bold ">{title}</h3>
        <p className="text-[13px] text-muted">{description}</p>
      </div>
      <Form onSubmit={onSubmit}>{children}</Form>
    </section>
  );
};

export default SettingForm;
