import { Button, Modal, toast } from "@heroui/react";
import { useAction, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import ChatInput from "./elements/ChatInput";
import DraftCard, { type Draft, type DraftStatus } from "./elements/DraftCard";

type DraftItem = Draft & { status: DraftStatus };
type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  drafts?: DraftItem[];
};

type Suggestion = {
  label: string;
  text: string;

  autoSend?: boolean;
};

const SUGGESTIONS: Suggestion[] = [
  { label: "گزارش این ماه", text: "گزارش مالی این ماه را بده", autoSend: true },
  { label: "کم کردن خرج", text: "کجا می‌توانم صرفه‌جویی کنم؟", autoSend: true },
  { label: "بودجه‌ها", text: "وضعیت بودجه‌هایم چطور است؟", autoSend: true },
  { label: "تراکنش جدید", text: "خرج " },
  { label: "چک جدید", text: "چک " },
  { label: "وام جدید", text: "وام " },
  { label: "اشتراک جدید", text: "اشتراک " },
  { label: "هدف جدید", text: "هدف: " },
  {
    label: "قیمت طلا و ارز",
    text: "قیمت طلا، سکه و دلار الان چنده؟",
    autoSend: true,
  },
  {
    label: "مقایسه سرمایه‌گذاری",
    text: "۱۰۰ میلیون تومن طلا بخرم بهتره یا سکه یا سپرده؟",
    autoSend: true,
  },
];

type ChatModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
};

const errorText = (error: unknown, fallback: string) =>
  error instanceof ConvexError ? String(error.data) : fallback;

const ChatModal = ({ isOpen, onOpenChange }: ChatModalProps) => {
  const ask = useAction(api.ai.chat);

  const add = {
    transaction: useMutation(api.transactions.add),
    check: useMutation(api.checks.create),
    loan: useMutation(api.loans.add),
    goal: useMutation(api.goals.add),
    subscription: useMutation(api.subscriptions.add),
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (value: string) => {
    const text = value.trim();
    if (!text || loading) return;

    const history: Message[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", text },
    ];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const result = await ask({
        messages: history.map((m) => ({ role: m.role, content: m.text })),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: result.text,
          drafts: result.drafts.map((d) => ({
            ...d,
            status: "pending" as const,
          })),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: errorText(error, "خطا در ارتباط با دستیار."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setDraftStatus = (
    messageId: string,
    draftId: string,
    status: DraftStatus,
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== messageId
          ? m
          : {
              ...m,
              drafts: m.drafts?.map((d) =>
                d.id === draftId ? { ...d, status } : d,
              ),
            },
      ),
    );
  };

  const confirmDraft = async (messageId: string, draft: DraftItem) => {
    if (draft.status !== "pending") return;
    setDraftStatus(messageId, draft.id, "saving");
    try {
      await add[draft.kind](draft.payload as never);
      setDraftStatus(messageId, draft.id, "saved");
      toast.success("ثبت شد");
    } catch (error) {
      setDraftStatus(messageId, draft.id, "pending");
      toast.danger(errorText(error, "خطا در ثبت"));
    }
  };

  const pickSuggestion = (s: Suggestion) => {
    if (s.autoSend) {
      send(s.text);
      return;
    }
    setInput(s.text);
    inputRef.current?.focus();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container className="p-0! sm:p-4!">
            <Modal.Dialog className="box-modal w-full! max-w-none! rounded-b-none sm:max-w-135! sm:rounded-b-2xl max-h-[85vh]">
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

            <Modal.Body className="min-h-65 flex-1 overflow-y-auto">
              <div className="mt-3 flex flex-col gap-3">
                {messages.length === 0 && (
                  <p className="mx-auto mt-10 max-w-xs text-center text-sm leading-7 text-white/50">
                    تراکنش، چک، وام، اشتراک یا هدف جدیدت را بنویس، یا تحلیل و
                    پیشنهاد بخواه.
                  </p>
                )}

                {messages.map((m) => (
                  <div key={m.id} className="flex flex-col">
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[85%] self-start rounded-2xl rounded-ss-sm bg-primary px-4 py-2 text-sm leading-7 text-black"
                          : "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-se-sm bg-white/10 px-4 py-2 text-sm leading-7"
                      }
                    >
                      {m.text}
                    </div>

                    {m.drafts?.map((d) => (
                      <div key={d.id} className="w-[85%] self-end">
                        <DraftCard
                          draft={d}
                          status={d.status}
                          onConfirm={() => confirmDraft(m.id, d)}
                          onReject={() =>
                            setDraftStatus(m.id, d.id, "rejected")
                          }
                        />
                      </div>
                    ))}
                  </div>
                ))}

                {loading && (
                  <div
                    className="flex gap-1 self-end rounded-2xl rounded-se-sm bg-white/10 px-4 py-3"
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
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => send(input)}
                loading={loading}
                inputRef={inputRef}
              />
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ChatModal;
