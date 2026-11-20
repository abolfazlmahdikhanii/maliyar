import { useAuthActions } from "@convex-dev/auth/react";
import { Button, toast } from "@heroui/react";
import { useConvex, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type ReactNode } from "react";
import { api } from "../../../convex/_generated/api";
import { getCategory } from "../../../data/categories";
import { getBankName } from "../../utils/bankDetector";
import { downloadCsv } from "../../utils/exportCsv";
import { formatDate } from "../../utils/formatDate";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";
import SettingForm from "./SettingForm";

type Modal = "clear" | "delete" | null;
type Loading = "export" | "sample" | "clear" | "delete" | null;

type RowProps = {
  title: string;
  desc: string;
  danger?: boolean;
  children: ReactNode;
};

const Row = ({ title, desc, danger, children }: RowProps) => (
  <div className="flex flex-col gap-3 border-t border-dashed border-secondary py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <div className="min-w-0">
      <p
        className={`text-sm ${danger ? "text-[#ff8a8a]" : "text-neutral-100"}`}
      >
        {title}
      </p>
      <p className="mt-1 text-xs leading-6 text-neutral-400">{desc}</p>
    </div>
    <div className="w-full shrink-0 sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
      {children}
    </div>
  </div>
);

const errorText = (error: unknown, fallback: string) =>
  error instanceof ConvexError ? String(error.data) : fallback;

const SettingData = () => {
  const convex = useConvex();
  const loadSample = useMutation(api.settings.loadSampleData);
  const clearData = useMutation(api.settings.clearData);
  const deleteAccount = useMutation(api.settings.deleteAccount);
  const { signOut } = useAuthActions();

  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState<Loading>(null);

  const exportHandler = async () => {
    if (loading) return;
    setLoading("export");
    try {
      const rows = await convex.query(api.settings.exportTransactions);
      if (rows.length === 0)
        return toast.danger("تراکنشی برای خروجی گرفتن نیست.");

      downloadCsv(
        "maliyar-transactions.csv",
        [
          "تاریخ",
          "ساعت",
          "نوع",
          "مبلغ (تومان)",
          "عنوان",
          "دسته",
          "حساب",
          "یادداشت",
        ],
        rows.map((r) => [
          formatDate(r.date) ?? r.date,
          r.time,
          r.type === "income" ? "درآمد" : "هزینه",
          r.amount,
          r.title,
          getCategory(r.categoryId)?.label.trim() ?? r.categoryId,
          r.bank ? getBankName(r.bank) : "",
          r.note,
        ]),
      );
      toast.success("فایل آماده شد");
    } catch (error) {
      toast.danger(errorText(error, "خطا در گرفتن خروجی"));
    } finally {
      setLoading(null);
    }
  };

  const sampleHandler = async () => {
    if (loading) return;
    setLoading("sample");
    try {
      await loadSample();
      toast.success("داده‌ی نمونه بارگذاری شد");
    } catch (error) {
      toast.danger(errorText(error, "خطا در بارگذاری داده‌ی نمونه"));
    } finally {
      setLoading(null);
    }
  };

  const clearHandler = async () => {
    if (loading) return;
    setLoading("clear");
    try {
      await clearData();
      toast.success("داده‌ها پاک شد");
      setModal(null);
    } catch (error) {
      toast.danger(errorText(error, "خطا در پاک کردن داده‌ها"));
    } finally {
      setLoading(null);
    }
  };

  const deleteHandler = async () => {
    if (loading) return;
    setLoading("delete");
    try {
      await deleteAccount();
      await signOut().catch(() => undefined);
      toast.success("حساب حذف شد");
    } catch (error) {
      toast.danger(errorText(error, "خطا در حذف حساب"));
    } finally {
      setLoading(null);
    }
  };

  return (
    <SettingForm
      id="data"
      title="داده‌ها"
      description="از اطلاعاتت خروجی بگیر یا حسابت رو حذف کن"
    >
      <div className="pt-6">
        <Row title="خروجی همه‌ی تراکنش‌ها" desc="فایل CSV برای اکسل">
          <Button
            variant="outline"
            className="h-12 px-5 rounded-xl border-secondary"
            isDisabled={loading !== null}
            onPress={exportHandler}
          >
            دانلود
          </Button>
        </Row>

        <Row
          title="بارگذاری داده‌ی نمونه"
          desc="چند حساب، شش ماه تراکنش، چک، هدف و اشتراک برای دیدن برنامه؛ فقط وقتی حسابی نداری"
        >
          <Button
            variant="outline"
            className="h-12 px-5 rounded-xl border-secondary"
            isDisabled={loading !== null}
            onPress={sampleHandler}
          >
            بارگذاری
          </Button>
        </Row>

        <Row
          title="پاک کردن همه‌ی داده‌ها"
          desc="حساب‌ها، تراکنش‌ها، چک‌ها و ... پاک می‌شن؛ حساب کاربری می‌مونه"
          danger
        >
          <Button
            variant="danger-soft"
            className="h-12 px-5 rounded-xl"
            onPress={() => setModal("clear")}
          >
            پاک کردن
          </Button>
        </Row>

        <Row
          title="حذف حساب کاربری"
          desc="حساب و همه‌ی اطلاعاتت برای همیشه حذف می‌شه"
          danger
        >
          <Button
            variant="danger-soft"
            className="h-12 px-5 rounded-xl"
            onPress={() => setModal("delete")}
          >
            حذف حساب
          </Button>
        </Row>
      </div>

      <DeleteDialog
        isShowDelete={modal === "clear"}
        onChangeShowDelete={() => setModal(null)}
        title="پاک کردن همه‌ی داده‌ها"
        description="همه‌ی حساب‌ها، تراکنش‌ها، چک‌ها، اهداف، اشتراک‌ها و وام‌هات پاک می‌شن و برگشت‌پذیر نیست. ادامه می‌دی؟"
        loading={loading === "clear"}
        onRemove={clearHandler}
      />

      <DeleteDialog
        isShowDelete={modal === "delete"}
        onChangeShowDelete={() => setModal(null)}
        title="حذف حساب کاربری"
        description="حساب و همه‌ی اطلاعاتت برای همیشه حذف می‌شه و دیگه نمی‌تونی واردش بشی. ادامه می‌دی؟"
        loading={loading === "delete"}
        onRemove={deleteHandler}
      />
    </SettingForm>
  );
};

export default SettingData;
