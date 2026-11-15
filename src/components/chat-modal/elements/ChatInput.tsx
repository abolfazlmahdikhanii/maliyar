import { Button, InputGroup, Kbd, TextField, Tooltip } from "@heroui/react";
import { ArrowUpIcon } from "@solar-icons/react/outline";
import type { RefObject } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};
const ChatInput = ({
  value,
  onChange,
  onSend,
  loading,
  inputRef,
}: ChatInputProps) => {
  return (
    <TextField
      fullWidth
      aria-label="Prompt input"
      className="flex w-full flex-col  mt-2"
      name="prompt"
    >
      <InputGroup
        fullWidth
        className="flex flex-col gap-2 rounded-3xl py-2 box-date w-full  data-[focus-within='true']:border-primary data-[focus-within='true']:ring-1 data-[focus-within='true']:ring-primary"
      >
        <InputGroup.TextArea
          className="w-full resize-none px-3.5 py-0"

          rows={2}
          ref={inputRef}
          value={value}
          placeholder="پیامت را بنویس..."
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        <div className="ms-auto flex items-center gap-1.5">
          <Tooltip delay={0}>
            <Button
              isIconOnly
              aria-label="Send prompt"
              isDisabled={loading || !value.trim()}
              onPress={onSend}
              className="h-9 w-9 rounded-full bg-primary text-black hover:bg-[#6BC945]"
            >
              <ArrowUpIcon />
            </Button>
            <Tooltip.Content className="flex items-center gap-1">
              <p className="text-xs">ارسال</p>
              <Kbd className="h-4 rounded-sm px-1">
                <Kbd.Abbr keyValue="enter" />
              </Kbd>
            </Tooltip.Content>
          </Tooltip>
        </div>
      </InputGroup>
    </TextField>
  );
};

export default ChatInput;
