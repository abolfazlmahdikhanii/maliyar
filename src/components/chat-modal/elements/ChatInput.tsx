import { Button, InputGroup, Kbd, Spinner, TextField, Tooltip } from "@heroui/react";
import { ArrowUpIcon } from "@solar-icons/react/outline";

const ChatInput = () => {
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
          placeholder="Assign tasks or ask anything..."
          rows={2}
        //   value={input}
        //   onChange={(event) => setInput(event.target.value)}
        />

        <div className="ms-auto flex items-center gap-1.5">
          <Tooltip delay={0}>
            <Button
              isIconOnly
              aria-label="Send prompt"
              //   isDisabled={!value.trim()}
              //   isPending={isSubmitting}
              //   onPress={handleSubmit}
              className="h-9 w-9 rounded-full bg-primary text-black hover:bg-[#6BC945]"
            >
              {({ isPending }) =>
                isPending ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <ArrowUpIcon />
                )
              }
            </Button>
            <Tooltip.Content className="flex items-center gap-1">
              <p className="text-xs">Send</p>
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
