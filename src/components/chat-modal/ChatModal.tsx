import { Button, Modal } from "@heroui/react";
import { useRef, useState } from "react";
import ChatInput from "./elements/ChatInput";

type Message = { id: string; role: "user" | "assistant"; text: string };

type Suggestion = {
  label: string;
  text: string;
  // true: sends immediately. false: fills the input so the user can finish it.
  autoSend?: boolean;
};

const SUGGESTIONS: Suggestion[] = [
  {
    label: "تحلیل این ماه",
    text: "خرج و درآمد این ماه را تحلیل کن",
    autoSend: true,
  },
  {
    label: "کم کردن خرج",
    text: "چطور می‌توانم خرج‌هایم را کم کنم؟",
    autoSend: true,
  },
  { label: "تراکنش جدید", text: "خرج " },
  { label: "چک جدید", text: "چک " },
  { label: "وام جدید", text: "وام " },
  { label: "اشتراک جدید", text: "اشتراک " },
  { label: "هدف جدید", text: "هدف: " },
];

type ChatModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  /** Receives the user's text and returns the assistant's reply. */
  onSend: (text: string) => Promise<string>;
};
const ChatModal = ({ isOpen, onOpenChange, onSend }: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const pickSuggestion = (s: Suggestion) => {
    if (s.autoSend) {
      //   send(s.text);
      return;
    }
    setInput(s.text);
    inputRef.current?.focus();
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop >
        <Modal.Container>
          <Modal.Dialog className="box-modal flex max-h-[85vh] max-w-xl flex-col">
            <Modal.Header className="flex flex-row items-center justify-between">
              <Modal.Heading>دستیار مالیار</Modal.Heading>
              <Button isIconOnly variant="outline" size="sm" slot="close">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </Modal.Header>

            <Modal.Body className="min-h-[260px] flex-1 overflow-y-auto">
              <div className="mt-3 flex flex-col gap-3">
                {messages.length === 0 && (
                  <p className="mx-auto mt-10 max-w-xs text-center text-sm leading-7 text-white/50">
                    تراکنش، چک، وام، اشتراک یا هدف جدیدت را بنویس، یا تحلیل و
                    پیشنهاد بخواه.
                  </p>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === "user"
                        ? "max-w-[85%] self-start rounded-2xl rounded-ss-sm bg-primary px-4 py-2 text-sm leading-7 text-black"
                        : "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-se-sm bg-white/10 px-4 py-2 text-sm leading-7"
                    }
                  >
                    {m.text}
                  </div>
                ))}

                {loading && (
                  <div
                    className="flex gap-1 self-end rounded-2xl bg-white/10 px-4 py-3"
                    aria-label="در حال پاسخ"
                  >
                    <span className="size-1.5 animate-pulse rounded-full bg-white/60" />
                    <span className="size-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:150ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:300ms]" />
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </Modal.Body>

            <Modal.Footer className="flex-col items-stretch gap-2 pb-1">
              {/* Suggestions */}
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s.label}
                    size="sm"
                    variant="outline"
                    isDisabled={loading}
                    onPress={() => pickSuggestion(s)}
                    className="shrink-0 rounded-full bg-secondary text-white/80"
                  >
                    {s.label}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <ChatInput />
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ChatModal;
