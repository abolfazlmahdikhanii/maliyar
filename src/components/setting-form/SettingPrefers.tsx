import { toast } from "@heroui/react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getBankName } from "../../utils/bankDetector";
import FormSelect from "../ui/form-select/FormSelect";
import { Loader } from "../ui/loading-box/LoadingBox";
import CheckboxItem from "./elements/CheckboxItem";
import SettingForm from "./SettingForm";

type Settings = NonNullable<FunctionReturnType<typeof api.settings.get>>;

const NONE = "none";

const TOGGLES = [
  {
    key: "notifyChecks",
    title: "سررسید چک‌ها",
    desc: "۳ روز قبل از سررسید یادآوری کن",
  },
  {
    key: "notifySubscriptions",
    title: "پرداخت اشتراک‌ها",
    desc: "۳ روز قبل از تاریخ پرداخت بعدی",
  },
  {
    key: "notifyInstallments",
    title: "اقساط وام و بدهی‌ها",
    desc: "روز سررسید یادآوری کن",
  },
  {
    key: "notifyBudget",
    title: "عبور از بودجه",
    desc: "وقتی هزینه‌ی یک دسته به سقفش رسید",
  },
] as const;

const SettingPrefers = () => {
  const settings = useQuery(api.settings.get);
  const accounts = useQuery(api.accounts.list);
  const update = useMutation(api.settings.update);
  const [loading, setLoading] = useState<boolean>(false);

  const saveSettingHandler = async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    if (!settings || loading) return;

    setLoading(true);
    const next = { ...settings, [key]: value };
    try {
      await update({
        ...next,
        defaultAccountId:
          (next.defaultAccountId as Id<"accounts">) ?? undefined,
      });
      toast.success("ذخیره شد");
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ذخیره‌ی تنظیمات",
      );
    } finally {
      setLoading(false);
    }
  };
  const accountOptions = [
    { id: NONE, label: "بدون حساب پیش‌فرض" },
    ...(accounts ?? []).map((a) => ({ id: a._id, label: getBankName(a.bank) })),
  ];
  return (
    <SettingForm
      id="notification"
      title="ترجیحات"
      description="یادآوری‌ها و حساب پیش‌فرض"
    >
      <div className="pt-6">
        {!settings ? (
          <Loader />
        ) : (
          <>
            {TOGGLES.map((t) => (
              <CheckboxItem
                key={t.key}
                title={t.title}
                description={t.desc}
                checked={settings?.[t.key]}
                disabled={loading}
                onChange={(checked) => saveSettingHandler(t.key, checked)}
              />
            ))}
            <div className="py-4 *:max-w-xs ">
              <FormSelect
                label="حساب پیش‌فرض"
                value={settings.defaultAccountId ?? NONE}
                onChange={(key) =>
                  saveSettingHandler(
                    "defaultAccountId",
                    !key || key === NONE ? null : (key as Id<"accounts">),
                  )
                }
                options={accountOptions}
              />
            </div>
          </>
        )}
      </div>
    </SettingForm>
  );
};

export default SettingPrefers;
