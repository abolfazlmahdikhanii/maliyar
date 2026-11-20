/// <reference types="node" />
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import {
  isValidJalaaliDate,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { daysAgoTehran, daysAheadTehran, todayTehran } from "./lib/date";
import { installmentDueDate } from "./lib/loanSchedule";
import { loadSettings } from "./settings";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

const GEMINI_MODEL = "gemini-3.8-flash";

const ZAI_URL = "https://api.z.ai/api/paas/v4/chat/completions";
const ZAI_MODEL = "glm-4.7-flash";

const LIMIT_PER_HOUR = 20;


const BANK_KEYS = [
  "mellat",
  "melli",
  "saman",
  "pasargad",
  "parsian",
  "tejarat",
  "saderat",
  "sepah",
  "maskan",
  "refah",
  "keshavarzi",
  "shahr",
  "ayandeh",
  "sina",
];

const BANK_TITLES: Record<string, string> = {
  mellat: "ملت",
  melli: "ملی",
  saman: "سامان",
  pasargad: "پاسارگاد",
  parsian: "پارسیان",
  tejarat: "تجارت",
  saderat: "صادرات",
  sepah: "سپه",
  maskan: "مسکن",
  refah: "رفاه",
  keshavarzi: "کشاورزی",
  shahr: "شهر",
  ayandeh: "آینده",
  sina: "سینا",
};

const CATEGORY_LABELS: Record<string, string> = {
  health: "سلامت",
  food: "خوراک",
  "daily-buy": "خرید روزانه",
  transport: "حمل و نقل",
  charge: "شارژ و قبض",
  entertainment: "سرگرمی",
  pay: "حقوق",
  freelancer: "فریلنسری",
  debt: "پرداخت بدهی",
  claim: "دریافت طلب",
  loan: "پرداخت وام",
  goal: "پس‌انداز هدف",
  subscription: "اشتراک",
  "check-income": "وصول چک",
  "check-outcome": "پرداخت چک",
};

const pad = (n: number | string) => String(n).padStart(2, "0");
const toIso = (g: { gy: number; gm: number; gd: number }) =>
  `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;


const fa = (iso: string) => {
  const [gy, gm, gd] = iso.split("-").map(Number);
  const j = toJalaali(gy, gm, gd);
  return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}`;
};

const toEn = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const percentOf = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;


export const checkLimit = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const since = Date.now() - 3_600_000;
    const recent = await ctx.db
      .query("aiRequests")
      .withIndex("by_user_at", (q) => q.eq("userId", userId).gte("at", since))
      .collect();
    if (recent.length >= LIMIT_PER_HOUR) {
      throw new ConvexError(
        "تعداد پرسش‌های این ساعتت تموم شد؛ کمی بعد دوباره امتحان کن.",
      );
    }
    await ctx.db.insert("aiRequests", { userId, at: Date.now() });
  },
});


export const summary = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = todayTehran();
    const [gy, gm, gd] = today.split("-").map(Number);
    const { jy, jm, jd } = toJalaali(gy, gm, gd);

    const monthRange = (y: number, m: number) => ({
      from: toIso(toGregorian(y, m, 1)),
      to: toIso(toGregorian(y, m, jalaaliMonthLength(y, m))),
    });
    const thisMonth = monthRange(jy, jm);
    const lastMonth =
      jm === 1 ? monthRange(jy - 1, 12) : monthRange(jy, jm - 1);

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", lastMonth.from)
          .lte("date", thisMonth.to),
      )
      .collect();
    const current = txs.filter((t) => t.date >= thisMonth.from);
    const previous = txs.filter((t) => t.date < thisMonth.from);

    const sum = (items: typeof txs, type: "income" | "outcome") =>
      items.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

    const byCategory = (items: typeof txs) => {
      const result = new Map<string, number>();
      for (const t of items) {
        if (t.type === "outcome") {
          result.set(t.categoryId, (result.get(t.categoryId) ?? 0) + t.amount);
        }
      }
      return result;
    };

    const change = (now: number, before: number) =>
      before > 0 ? Math.round(((now - before) / before) * 100) : null;

    const income = sum(current, "income");
    const outcome = sum(current, "outcome");
    const previousIncome = sum(previous, "income");
    const previousOutcome = sum(previous, "outcome");
    const spentNow = byCategory(current);
    const spentBefore = byCategory(previous);

    const [accounts, budgets, checks, dues, loans, goals, subs, settings] =
      await Promise.all([
        ctx.db
          .query("accounts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("budgets")
          .withIndex("by_user_category", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("checks")
          .withIndex("by_user_due", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("dues")
          .withIndex("by_user_status_due", (q) =>
            q.eq("userId", userId).eq("status", "open"),
          )
          .collect(),
        ctx.db
          .query("loans")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("goals")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        loadSettings(ctx, userId),
      ]);

    const limit = daysAheadTehran(14);
    const upcoming: {
      title: string;
      amount: number;
      due: string;
      daysLeft: number;
      out: boolean;
    }[] = [];
    const addUpcoming = (
      title: string,
      amount: number,
      date: string,
      out: boolean,
    ) => {
      if (date > limit) return;
      const daysLeft = Math.round(
        (Date.parse(date) - Date.parse(today)) / 86_400_000,
      );
      upcoming.push({ title, amount, due: fa(date), daysLeft, out });
    };

    for (const c of checks) {
      if (c.status !== "pending") continue;
      const issued = c.direction === "issued";
      addUpcoming(
        `${issued ? "چک پرداختی" : "چک دریافتی"} ${c.party}`,
        c.amount,
        c.dueDate,
        issued,
      );
    }
    for (const s of subs) {
      if (s.status === "active")
        addUpcoming(`اشتراک ${s.name}`, s.amount, s.nextPaymentDate, true);
    }
    for (const l of loans) {
      if (l.paidCount < l.installmentCount) {
        addUpcoming(
          `قسط وام ${l.title}`,
          l.installmentAmount,
          installmentDueDate(l.firstDueDate, l.paidCount + 1),
          true,
        );
      }
    }
    for (const d of dues) {
      const debt = d.type === "debt";
      addUpcoming(
        `${debt ? "بدهی به" : "طلب از"} ${d.party}`,
        d.amount,
        d.dueDate,
        debt,
      );
    }
    upcoming.sort((a, b) => a.daysLeft - b.daysLeft);

    const balance = accounts.reduce((s, a) => s + a.balance, 0);
    const needed = upcoming
      .filter((u) => u.out)
      .reduce((s, u) => s + u.amount, 0);
    const expected = upcoming
      .filter((u) => !u.out)
      .reduce((s, u) => s + u.amount, 0);

    const monthlyBase = previousOutcome > 0 ? previousOutcome : outcome;
    const incomeBase = previousIncome > 0 ? previousIncome : income;
    const monthlyInstallments = loans
      .filter((l) => l.paidCount < l.installmentCount)
      .reduce((s, l) => s + l.installmentAmount, 0);

    return {
      today: fa(today),
      accounts: accounts.map((a) => ({
        id: a._id,
        bank: a.bank,
        type: a.type,
        last4: a.cardNumber?.slice(-4) ?? null,
        balance: a.balance,
      })),
      defaultAccountId: settings.defaultAccountId,
      analysis: {
        totalBalance: balance,
        income,
        outcome,
        net: income - outcome,
        savingsRatePercent:
          income > 0 ? Math.round(((income - outcome) / income) * 100) : null,
        incomeChangePercent: change(income, previousIncome),
        outcomeChangePercent: change(outcome, previousOutcome),
        projectedMonthOutcome: Math.round(
          (outcome / jd) * jalaaliMonthLength(jy, jm),
        ),
        emergencyFundMonths:
          monthlyBase > 0 ? Math.round((balance / monthlyBase) * 10) / 10 : null,
        debtToIncomePercent:
          incomeBase > 0
            ? Math.round((monthlyInstallments / incomeBase) * 100)
            : null,
        topOutcome: [...spentNow]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, amount]) => ({
            category: CATEGORY_LABELS[id] ?? id,
            amount,
            previousMonth: spentBefore.get(id) ?? 0,
            changePercent: change(amount, spentBefore.get(id) ?? 0),
          })),
        budgets: budgets.map((b) => {
          const used = spentNow.get(b.categoryId) ?? 0;
          return {
            category: CATEGORY_LABELS[b.categoryId] ?? b.categoryId,
            limit: b.limit,
            used,
            usedPercent: percentOf(used, b.limit),
          };
        }),
        upcoming14Days: upcoming.slice(0, 10),
        cashNeededIn14Days: needed,
        balanceAfter14Days: balance + expected - needed,
        goals: goals.map((g) => ({
          title: g.title,
          saved: g.savedAmount,
          target: g.targetAmount,
          percent: percentOf(g.savedAmount, g.targetAmount),
        })),
      },
    };
  },
});


const TGJU_URL = "https://call.tgju.org/ajax.json";
const MARKET_TTL_MS = 10 * 60_000;

const DEPOSIT_RATE_PERCENT = 20;

type MarketItem = {
  symbol: string;
  title: string;
  unit: string;
  price: number; 
  changePercent: number | null;
};

type MarketData = {
  source: string;
  updatedAt: string; 
  items: MarketItem[];
};

const MARKET_SYMBOLS: { symbol: string; title: string; unit: string }[] = [
  { symbol: "price_dollar_rl", title: "دلار آمریکا", unit: "واحد" },
  { symbol: "price_eur", title: "یورو", unit: "واحد" },
  { symbol: "sekee", title: "سکه امامی", unit: "دستگاه" },
  { symbol: "sekeb", title: "سکه بهار آزادی", unit: "دستگاه" },
  { symbol: "nim", title: "نیم‌سکه", unit: "دستگاه" },
  { symbol: "rob", title: "ربع‌سکه", unit: "دستگاه" },
  { symbol: "geram18", title: "طلای ۱۸ عیار", unit: "گرم" },
  { symbol: "geram24", title: "طلای ۲۴ عیار", unit: "گرم" },
];

let marketCache: { at: number; data: MarketData } | null = null;

const parseRial = (raw: unknown): number | null => {
  const n = Number(toEn(String(raw ?? "")).replace(/[,٬\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n / 10) : null;
};

const tsToFa = (raw: unknown): string | null => {
  const m = String(raw ?? "").match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/,
  );
  if (!m) return null;
  const j = toJalaali(Number(m[1]), Number(m[2]), Number(m[3]));
  return `${j.jy}/${pad(j.jm)}/${pad(j.jd)} ${m[4]}:${m[5]}`;
};

const fetchMarket = async (): Promise<MarketData | null> => {
  if (marketCache && Date.now() - marketCache.at < MARKET_TTL_MS)
    return marketCache.data;

  let data: MarketData | null = null;
  try {
    const res = await fetch(TGJU_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      const json = (await res.json()) as {
        current?: Record<string, { p?: unknown; dp?: unknown; ts?: unknown }>;
      };
      const current = json.current ?? {};
      const items: MarketItem[] = [];
      let updatedAt: string | null = null;

      for (const meta of MARKET_SYMBOLS) {
        const row = current[meta.symbol];
        const price = parseRial(row?.p);
        if (!row || price === null) continue;
        items.push({
          symbol: meta.symbol,
          title: meta.title,
          unit: meta.unit,
          price,
          changePercent:
            typeof row.dp === "number" && Number.isFinite(row.dp)
              ? row.dp
              : null,
        });
        updatedAt = tsToFa(row.ts) ?? updatedAt;
      }

      if (items.length >= 3) {
        data = {
          source: "tgju.org",
          updatedAt: updatedAt ?? fa(todayTehran()),
          items,
        };
      }
    } else {
      console.error("TGJU error", res.status);
    }
  } catch (error) {
    console.error("TGJU fetch failed", error);
  }

  if (!data) return marketCache?.data ?? null;
  marketCache = { at: Date.now(), data };
  return data;
};


type Kind = "transaction" | "check" | "loan" | "goal" | "subscription";
export type Draft = {
  id: string;
  kind: Kind;
  payload: Record<string, unknown>;
};

const DATE = {
  type: "string",
  description:
    "تاریخ شمسی مثل 1405/09/15، یا تعداد روز نسبت به امروز (0 امروز، -1 دیروز، 7 یک هفته‌ی بعد)",
};
const AMOUNT = { type: "integer", description: "مبلغ به تومان، عدد صحیح" };
const ACCOUNT = {
  type: "string",
  description: "شناسه‌ی حساب (id) از فهرست accounts",
};
const TEXT = { type: "string" };
const choice = (...values: string[]) => ({ type: "string", enum: values });

const defineTool = (
  name: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[],
) => ({
  type: "function" as const,
  function: {
    name,
    description,
    parameters: { type: "object", properties, required },
  },
});

const BANK_DESC = `کلید بانک از فهرست مجاز: ${BANK_KEYS.map((k) => `${k} (${BANK_TITLES[k] ?? k})`).join("، ")}`;

const TOOLS = [
  defineTool(
    "add_transaction",
    "پیش‌نویس تراکنش",
    {
      type: choice("income", "outcome"),
      amount: AMOUNT,
      categoryId: choice(
        "pay",
        "freelancer",
        "health",
        "food",
        "daily-buy",
        "transport",
        "charge",
        "entertainment",
      ),
      accountId: ACCOUNT,
      date: DATE,
      title: TEXT,
      note: TEXT,
    },
    ["type", "amount", "categoryId", "accountId"],
  ),

  defineTool(
    "add_check",
    "پیش‌نویس چک",
    {
      direction: choice("received", "issued"),
      amount: AMOUNT,
      serial: { type: "string", description: "شماره سریال، فقط عدد" },
      bank: { type: "string", enum: BANK_KEYS, description: BANK_DESC },
      party: {
        type: "string",
        description: "صادرکننده (دریافتی) یا در وجه (پرداختی)",
      },
      issueDate: DATE,
      dueDate: DATE,
    },
    ["direction", "amount", "serial", "bank", "party", "dueDate"],
  ),

  defineTool(
    "add_loan",
    "پیش‌نویس وام",
    {
      title: TEXT,
      interestRate: { type: "number", description: "درصد سالانه" },
      receivedDate: DATE,
      firstDueDate: DATE,
      installmentAmount: AMOUNT,
      installmentCount: { type: "integer", description: "تعداد کل اقساط" },
    },
    [
      "title",
      "interestRate",
      "receivedDate",
      "firstDueDate",
      "installmentAmount",
      "installmentCount",
    ],
  ),

  defineTool(
    "add_goal",
    "پیش‌نویس هدف مالی",
    {
      title: TEXT,
      categoryId: choice(
        "travel",
        "car",
        "home",
        "education",
        "wedding",
        "gadget",
        "emergency",
        "other",
      ),
      targetAmount: AMOUNT,
      savedAmount: AMOUNT,
      deadline: DATE,
      accountId: ACCOUNT,
    },
    ["title", "categoryId", "targetAmount"],
  ),

  defineTool(
    "add_subscription",
    "پیش‌نویس اشتراک",
    {
      name: TEXT,
      categoryId: choice(
        "music",
        "video",
        "gaming",
        "software",
        "cloud",
        "education",
        "news",
        "ai",
        "other",
      ),
      amount: AMOUNT,
      cycle: choice("weekly", "monthly", "three-month", "yearly"),
      nextPaymentDate: DATE,
      accountId: ACCOUNT,
    },
    ["name", "categoryId", "amount", "cycle", "nextPaymentDate"],
  ),

  defineTool(
    "compare_investment",
    "مقایسه‌ی سرمایه‌گذاری طلا، سکه، ارز و سپرده بانکی برای یک مبلغ مشخص. فقط وقتی که کاربر درباره‌ی بهتر بودن خرید طلا/سکه/ارز یا سود سپرده پرسید.",
    {
      amount: AMOUNT,
      months: {
        type: "integer",
        description: "بازه‌ی سرمایه‌گذاری به ماه؛ پیش‌فرض ۱۲",
      },
    },
    ["amount"],
  ),
];

const KINDS: Record<string, Kind> = {
  add_transaction: "transaction",
  add_check: "check",
  add_loan: "loan",
  add_goal: "goal",
  add_subscription: "subscription",
};

function parseDate(input: unknown): string {
  const s = toEn(String(input).trim());

  if (/^[+-]?\d{1,4}$/.test(s)) {
    const n = Number(s);
    return n >= 0 ? daysAheadTehran(n) : daysAgoTehran(-n);
  }

  const m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (m && isValidJalaaliDate(Number(m[1]), Number(m[2]), Number(m[3]))) {
    return toIso(toGregorian(Number(m[1]), Number(m[2]), Number(m[3])));
  }
  throw new Error("تاریخ معتبر نیست");
}

function makeDraft(
  name: string,
  rawArgs: string,
  accounts: { id: string; type: string }[],
  index: number,
): Draft {
  const kind = KINDS[name];
  const def = TOOLS.find((t) => t.function.name === name);
  if (!kind || !def) throw new Error("ابزار ناشناخته");

  const parameters = def.function.parameters as {
    properties: Record<string, { type: string; enum?: string[] }>;
    required?: string[];
  };
  const fields = parameters.properties;
  const args = JSON.parse(rawArgs || "{}") as Record<string, unknown>;
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new Error("ساختار اطلاعات ارسالی معتبر نیست");
  }

  for (const key of parameters.required ?? []) {
    const value = args[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`اطلاعات ضروری «${key}» مشخص نشده است`);
    }
  }

  const payload: Record<string, unknown> = {};

  for (const [key, field] of Object.entries(fields)) {
    let value = args[key];
    if (value === undefined || value === null || value === "") continue;

    if (/date|deadline/i.test(key)) {
      value = parseDate(value);
    } else if (field.type === "integer" || field.type === "number") {
      const numeric = Number(toEn(String(value)).replace(/[,٬\s]/g, ""));
      if (!Number.isFinite(numeric))
        throw new Error(`مقدار عددی «${key}» معتبر نیست`);
      if (field.type === "integer" && !Number.isInteger(numeric)) {
        throw new Error(`مقدار «${key}» باید عدد صحیح باشد`);
      }
      if (
        ["amount", "targetAmount", "installmentAmount"].includes(key) &&
        numeric <= 0
      ) {
        throw new Error("مبلغ باید بزرگ‌تر از صفر باشد");
      }
      if (key === "savedAmount" && numeric < 0) {
        throw new Error("مبلغ پس‌انداز نمی‌تواند منفی باشد");
      }
      if (key === "installmentCount" && numeric < 1) {
        throw new Error("تعداد اقساط باید حداقل ۱ باشد");
      }
      if (key === "interestRate" && (numeric < 0 || numeric > 100)) {
        throw new Error("درصد سود باید بین صفر تا ۱۰۰ باشد");
      }
      value = numeric;
    } else if (key === "serial") {
      const serial = toEn(String(value)).replace(/\s/g, "");
      if (!/^\d+$/.test(serial))
        throw new Error("شماره سریال چک باید فقط شامل رقم باشد");
      value = serial;
    }

    if (field.enum && !field.enum.includes(String(value))) {
      throw new Error(
        key === "bank"
          ? `بانک «${value}» توی فهرست بانک‌های مجاز نیست؛ فقط این‌ها قبولن: ${field.enum.join("، ")}`
          : `مقدار «${value}» برای «${key}» معتبر نیست؛ مجاز: ${field.enum.join("، ")}`,
      );
    }

    payload[key] = value;
  }

  if (kind === "check" && !BANK_KEYS.includes(String(payload.bank))) {
    throw new Error(
      "بانک انتخاب‌شده پشتیبانی نمی‌شود؛ بانک را از فهرست مجاز انتخاب کن",
    );
  }

  if (kind === "transaction" || payload.accountId !== undefined) {
    const account = accounts.find((a) => a.id === payload.accountId);
    if (!account) throw new Error("حساب مشخص نیست");
    if (kind === "transaction") payload.paymentMethod = account.type;
  }

  if (kind === "transaction") payload.date ??= daysAheadTehran(0);
  if (kind === "check") payload.issueDate ??= daysAheadTehran(0);
  if (kind === "goal") payload.savedAmount ??= 0;
  if (kind === "subscription") payload.status = "active";

  return { id: `${Date.now()}-${index}`, kind, payload };
}


const computeComparison = (
  amount: number,
  months: number,
  market: MarketData,
): Record<string, unknown> => {
  const depositProfit = Math.round(
    (amount * DEPOSIT_RATE_PERCENT * months) / (100 * 12),
  );
  const scenarios = [-10, 0, 10];

  const assets = market.items.map((item) => {
    const quantity = amount / item.price; 
    return {
      title: item.title,
      unit: item.unit,
      todayPrice: item.price,
      changePercentToday: item.changePercent,
      quantity: Math.round(quantity * 100) / 100,
      scenarios: scenarios.map((g) => ({
        changePercent: g,
        value: Math.round(quantity * item.price * (1 + g / 100)),
      })),
    };
  });

  return {
    amount,
    months,
    asOf: market.updatedAt,
    deposit: {
      ratePercentAssumed: DEPOSIT_RATE_PERCENT,
      profit: depositProfit,
      total: amount + depositProfit,
      note: "نرخ تقریبیه؛ سود سپرده‌ها بین بانک‌ها فرق داره.",
    },
    breakEvenGrowthPercent: Math.round((depositProfit / amount) * 1000) / 10,
    assets,
    note: "سناریوهای +۱۰٪، بدون تغییر و -۱۰٪ فقط فرض هستن، نه پیش‌بینی.",
  };
};


const SYSTEM = `تو «دستیار مالی مالیار» هستی. کارهات: تحلیل و گزارش مالی، پیشنهاد مالی، توضیح قیمت بازار و راهنمایی آموزشی برای سرمایه‌گذاری، و آماده کردن پیش‌نویس ثبت (تراکنش، چک، وام، هدف، اشتراک).

قواعد کلی:
- فقط فارسی و کوتاه جواب بده.
- هیچ محاسبه‌ای خودت انجام نده؛ همه‌ی عددها آماده توی analysis و market هست. فقط همون‌ها رو بخون و تفسیر کن. چیزی که توی داده نیست رو نساز و اگه داده کافی نیست، راستش رو بگو.
- مبلغ‌ها تومانه و با جداکننده‌ی هزارگان نوشته می‌شن. تاریخ‌ها شمسی و به شکل سال/ماه/روز هستن.
- متن ساده بنویس؛ بدون ستاره، شارپ و جدول.

قالب گزارش (وقتی کاربر گزارش، تحلیل یا وضعیت مالی خواست):
خلاصه: دو جمله درباره‌ی درآمد، هزینه و نرخ پس‌انداز این ماه نسبت به ماه قبل.
نکات مهم:
- سه مورد، هر کدوم با یک عدد از analysis.
پیشنهادها:
- سه مورد مشخص و قابل اجرا، با مبلغ یا دسته‌ی دقیق. کلی‌گویی نکن.

قیمت بازار:
- قیمت طلا، سکه و ارز فقط از market.items خونده می‌شه و زمان آخرین به‌روزرسانی market.updatedAt ـه؛ همیشه اشاره کن. اگه market خالیه، بگو «قیمت لحظه‌ای الان در دسترس نیست».
- هیچ‌وقت قیمتی از خودت نگو و آینده‌ی قیمت‌ها رو پیش‌بینی نکن. روند فقط از changePercent هر مورد.
- اگه پرسید پس‌اندازش چقدر طلا یا دلاره، از market.yourBalanceEquals بخون.

سرمایه‌گذاری:
- راهنمایی آموزشی و متناسب با وضعیت خود کاربر بده، نه «بخر» یا «نفروش».
- ترتیب: ۱) analysis.emergencyFundMonths رو بگو؛ اگه کمتر از ۳ ماهه، اول صندوق اضطراری. ۲) اگه analysis.debtToIncomePercent بالای ۳۵ درصده یا وامی با بهره‌ی بالا داره، اول بدهی. ۳) بعد انواع دارایی (طلا و سکه، ارز، سپرده و صندوق درآمد ثابت، صندوق سهامی) رو کوتاه با مزیت و ریسک مقایسه کن؛ اگه افق زمانی یا ریسک‌پذیریش معلوم نیست، یک سوال کوتاه بپرس.
- اصول کلی: تنوع، خرید پله‌ای، و فقط پولی که تا یک سال لازم نداره.
- انتهای هر جواب سرمایه‌گذاری یک جمله: «این توصیه‌ی تخصصی نیست؛ برای تصمیم‌های بزرگ با مشاور مالی مجاز مشورت کن.»

قواعد ثبت:
- فقط وقتی کاربر صریح خواست چیزی ثبت بشه، ابزار مناسب رو صدا بزن. ابزار فقط پیش‌نویس می‌سازه و کاربر با دکمه‌ی تأیید ثبتش می‌کنه. هیچ‌وقت نگو «ثبت شد».
- اگه اطلاعات لازم کمه، فقط یک سوال کوتاه بپرس و ابزار رو صدا نزن.
- بانک چک باید یکی از بانک‌های فهرست ابزار باشه؛ اگه بانک دیگه‌ای گفت، بگو پشتیبانی نمی‌شه و ثبت نکن.
- مبلغ بدون واحد مبهمه (مثلا «۵۰۰ تومن»): بپرس. هزار = ×۱۰۰۰، میلیون = ×۱۰۰۰۰۰۰.
- حساب: اگه کاربر مشخص نکرد، از defaultAccountId استفاده کن؛ اگه نبود و بیشتر از یک حساب هست، بپرس کدوم.
- تاریخ تراکنش اگه گفته نشد امروزه. برای سررسید چک، وام و اشتراک تاریخ لازمه.
- توی یک پاسخ بیشتر از ۵ ابزار صدا نزن.`;


type ApiRequestMessage = {
  role: string;
  content: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
};

type ApiToolCall = {
  id?: string;
  type?: string;
  function?: {
    name?: string;
    arguments?: string;
  };
  extra_content?: {
    google?: {
      thought_signature?: string;
    };
  };
  [key: string]: unknown;
};

type ApiMessage = {
  content?: string | null;
  tool_calls?: ApiToolCall[];
};

type AIResponse = {
  choices?: {
    message?: ApiMessage;
  }[];
};

type Provider = {
  name: string;
  url: string;
  key: string;
  model: string;
};

class ProviderError extends Error {
  retryable: boolean;
  constructor(message: string, retryable: boolean) {
    super(message);
    this.retryable = retryable;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const RETRY_DELAYS = [0, 1500, 4000];

const getProviders = (): Provider[] => {
  const providers: Provider[] = [];

  const geminiKey = process.env.GEMINI_API_KEY;
  const zaiKey = process.env.ZAI_API_KEY;

  if (geminiKey) {
    providers.push({
      name: "Gemini",
      url: GEMINI_URL,
      key: geminiKey,
      model: GEMINI_MODEL,
    });
  }

  if (zaiKey) {
    providers.push({
      name: "Z.ai",
      url: ZAI_URL,
      key: zaiKey,
      model: ZAI_MODEL,
    });
  }

  return providers;
};

const callProvider = async (
  provider: Provider,
  body: Record<string, unknown>,
): Promise<AIResponse> => {
  let lastError = "";

  for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
    if (RETRY_DELAYS[attempt] > 0) await sleep(RETRY_DELAYS[attempt]);

    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({ ...body, model: provider.model }),
        signal: AbortSignal.timeout(90_000),
      });

      if (res.ok) {
        const json = (await res.json().catch(() => null)) as AIResponse | null;
        if (!json?.choices?.[0]?.message) {
          throw new ProviderError("ساختار پاسخ مدل معتبر نیست", false);
        }
        return json;
      }

      const text = (await res.text().catch(() => "")).slice(0, 500);
      const retryable = res.status === 429 || res.status >= 500;
      throw new ProviderError(`${res.status}: ${text}`, retryable);
    } catch (error) {
      lastError = error instanceof Error ? error.message : "network error";
      console.error(
        `${provider.name} failed (attempt ${attempt + 1})`,
        lastError,
      );

      if (error instanceof ProviderError && !error.retryable) break;
    }
  }

  throw new Error(
    `${provider.name} unavailable: ${lastError || "unknown error"}`,
  );
};

const callAI = async (body: Record<string, unknown>): Promise<AIResponse> => {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new ConvexError(
      "هیچ کلید API تنظیم نشده است. متغیرهای GEMINI_API_KEY و ZAI_API_KEY را در Convex تعریف کن.",
    );
  }

  let lastError = "";

  for (const provider of providers) {
    try {
      console.log(`Trying AI provider: ${provider.name}`);
      const result = await callProvider(provider, body);
      console.log(`AI provider succeeded: ${provider.name}`);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "unknown error";

      console.error(`Fallback after ${provider.name} failure`, lastError);
    }
  }

  console.error("All AI providers failed", lastError);

  throw new ConvexError(
    "Gemini و Z.ai هر دو در دسترس نیستند. کلیدهای API و وضعیت سرویس‌ها را بررسی کن و دوباره امتحان کن.",
  );
};


export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      }),
    ),
  },
  handler: async (
    ctx,
    { messages },
  ): Promise<{ text: string; drafts: Draft[] }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("لطفا وارد حساب شو.");

    const recent = messages
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (recent.length === 0 || recent[recent.length - 1].role !== "user") {
      throw new ConvexError("پیام معتبر نیست.");
    }

    await ctx.runMutation(internal.ai.checkLimit, { userId });
    const summaryData = await ctx.runQuery(internal.ai.summary, { userId });

    const market = await fetchMarket();
    const totalBalance = summaryData.analysis.totalBalance;
    const data = {
      ...summaryData,
      market: market && {
        ...market,
        yourBalanceEquals: market.items.map((i) => ({
          title: i.title,
          unit: i.unit,
          quantity: Math.round((totalBalance / i.price) * 100) / 100,
        })),
      },
    };

    const baseMessages: ApiRequestMessage[] = [
      {
        role: "system",
        content: `${SYSTEM}\n\nداده‌های کاربر:\n${JSON.stringify(data)}`,
      },
      ...recent,
    ];

    const json = await callAI({
      messages: baseMessages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 1200,
      stream: false,
    });

    const message = json?.choices?.[0]?.message;
    const accounts = summaryData.accounts.map((a) => ({
      id: a.id as string,
      type: a.type,
    }));
    const calls: ApiToolCall[] = message?.tool_calls ?? [];

    const drafts: Draft[] = [];
    const errors: string[] = [];
    calls.slice(0, 5).forEach((call, i) => {
      const name = call?.function?.name ?? "";
      if (name === "compare_investment") return; 
      try {
        drafts.push(
          makeDraft(name, call?.function?.arguments ?? "", accounts, i),
        );
      } catch (error) {
        errors.push(
          error instanceof Error ? error.message : "پیش‌نویس نامعتبر",
        );
      }
    });

    let text: string = message?.content?.trim() ?? "";

    const compareCall = calls.find(
      (c) => c?.function?.name === "compare_investment",
    );
    if (compareCall) {
      try {
        const raw = JSON.parse(compareCall.function?.arguments || "{}") as {
          amount?: unknown;
          months?: unknown;
        };
        const amount = Number(
          toEn(String(raw.amount ?? "")).replace(/[,٬\s]/g, ""),
        );
        const monthsRaw = Number(
          toEn(String(raw.months ?? 12)).replace(/[,٬\s]/g, ""),
        );
        const months = Number.isFinite(monthsRaw)
          ? Math.min(60, Math.max(1, Math.round(monthsRaw)))
          : 12;

        let computed: Record<string, unknown>;
        if (!Number.isFinite(amount) || amount <= 0) {
          computed = {
            error: "مبلغ مقایسه مشخص نبود؛ فقط از کاربر مبلغ رو بپرس.",
          };
        } else if (!market) {
          computed = {
            error:
              "قیمت‌ها الان در دسترس نیستن؛ به کاربر بگو بعدا دوباره امتحان کنه.",
          };
        } else {
          computed = computeComparison(amount, months, market);
        }

        const toolResults: ApiRequestMessage[] = calls.map((call, i) => ({
          role: "tool",
          tool_call_id: call.id ?? `call_${i}`,
          content:
            call.function?.name === "compare_investment"
              ? JSON.stringify({ ...computed, draftsCount: drafts.length })
              : "پیش‌نویس آماده شد و منتظر تأیید کاربر است.",
        }));

        const followUp = await callAI({
          messages: [
            ...baseMessages,
            {
              role: "assistant",
              content: message?.content ?? null,
              tool_calls: calls,
            },
            ...toolResults,
          ],
          temperature: 0.3,
          max_tokens: 1200,
          stream: false,
        });
        const secondText = followUp?.choices?.[0]?.message?.content?.trim();
        if (secondText) text = secondText;
      } catch (error) {
        console.error("compare_investment failed", error);
      }
    }

    if (!text && drafts.length > 0) {
      text = "پیش‌نویس رو آماده کردم؛ بررسی کن و تأیید کن تا ثبت بشه.";
    }
    if (errors.length > 0) {
      text += `${text ? "\n\n" : ""}نتونستم بعضی موارد رو بسازم (${errors.join("، ")}). اطلاعات رو کامل‌تر بگو.`;
    }
    return { text: text || "جوابی تولید نشد؛ دوباره امتحان کن.", drafts };
  },
});