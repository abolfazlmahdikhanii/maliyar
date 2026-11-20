import {
  BillListIcon,
  Card2Icon,
  CardSendIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import BudgetBox from "../../components/budget-box/BudgetBox";
import BudgetForm from "../../components/budget-form/BudgetForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { getCurrentMonthRange } from "../../utils/currentMonthRange";
import { percentOf, sumBy } from "../../utils/state";

const SLIDE = "keen-slider__slide px-1 pb-3 lg:min-w-0 lg:p-0 w-full";
const SLIDES_COUNT = 3;

const Budgets = () => {
  const range = useMemo(() => getCurrentMonthRange(), []);
  const budgets = useQuery(api.budgets.list, range);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    rtl: true,
    initial: 0,
    slides: { perView: 1.1, spacing: 15, origin: "center" },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    breakpoints: {
      "(min-width: 1024px)": { disabled: true },
    },
  });

  const all = budgets ?? [];
  const limit = sumBy(all, (b) => b.limit);
  const spent = sumBy(all, (b) => b.used);
  const over = all.filter((b) => b.used > b.limit).length;
  const left = limit - spent;

  return (
    <>
      <Title
        text="بودجه بندی"
        btnText="افزودن بودجه"
        onOpen={() => setIsOpenModal(true)}
      />

      <div className="mt-6 mb-6 grid grid-cols-1 gap-4 lg:mt-14 lg:mb-8 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      
        <div className="lg:contents col-span-full w-full">
          <div ref={sliderRef} className="keen-slider lg:contents w-full">
            <div className={SLIDE}>
              <StatCard
                title="مجموع سقف بودجه"
                icon={BillListIcon}
                tone="blue"
                value={limit}
                delta={{
                  text: `${all.length} دسته`,
                  label: "بودجه‌بندی‌شده",
                }}
                loading={!budgets}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title="هزینه‌شده"
                icon={CardSendIcon}
                tone="yellow"
                value={spent}
                delta={{
                  text: `${percentOf(spent, limit)}%`,
                  tone: spent > limit ? "red" : "yellow",
                  label: "از سقف",
                }}
                loading={!budgets}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title={left >= 0 ? "باقی‌مانده" : "بیش از سقف"}
                icon={Card2Icon}
                tone={left >= 0 ? "green" : "red"}
                value={Math.abs(left)}
                delta={{
                  text:
                    over > 0 ? `${over} دسته فراتر از سقف` : "همه داخل سقف",
                  tone: over > 0 ? "red" : "green",
                }}
                loading={!budgets}
              />
            </div>
          </div>

        
          <div className="flex items-center justify-center gap-2 lg:hidden">
            {Array.from({ length: SLIDES_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`کارت ${i + 1}`}
                onClick={() => instanceRef.current?.moveToIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === i ? "w-6 bg-[#A3E96B]" : "w-2 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {budgets === undefined ? (
        <div className="mt-20 lg:mt-42">
          <Loader />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          kind="budgets"
          title="بودجه‌ای تعیین نکرده‌ای"
          description="برای هر دسته یه سقف ماهانه بذار تا خرجت از کنترل خارج نشه."
          action={{ label: "بودجه جدید", onPress: () => setIsOpenModal(true) }}
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:gap-5 xl:grid-cols-3 *:min-w-0">
          {budgets.map((budget) => (
            <BudgetBox key={budget._id} {...budget} />
          ))}
        </div>
      )}

      <FormModal
        title="بودجه جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت بودجه"
        formId="budget-form"
        loading={loadingForm}
      >
        <BudgetForm
          formId="budget-form"
          loading={loadingForm}
          onLoadingChange={setLoadingForm}
          onSuccess={() => setIsOpenModal(false)}
        />
      </FormModal>
    </>
  );
};

export default Budgets;