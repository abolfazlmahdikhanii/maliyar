import {
  BillListIcon,
  CardSendIcon,
  HandMoneyIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import CreditsBox from "../../components/credits-box/CreditsBox";
import CreditsForm from "../../components/credits-form/CreditsForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { percentOf, sumBy } from "../../utils/state";

const SLIDE = "keen-slider__slide px-1 pb-3 lg:min-w-0 lg:p-0";
const SLIDES_COUNT = 3;

const Credits = () => {
  const credits = useQuery(api.loans.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const all = credits ?? [];
  const total = sumBy(all, (l) => l.totalAmount);
  const paid = sumBy(all, (l) => l.paidAmount);
  const remaining = sumBy(all, (l) => l.remainingDebt);
  const remainingCount = sumBy(all, (l) => l.remainingCount);

  return (
    <div>
      <Title
        text="مدیریت وام"
        btnText="وام جدید"
        onOpen={() => setIsOpenModal(true)}
      />

      <div className="mt-6 mb-6 grid grid-cols-1 gap-4 lg:mt-14 lg:mb-8 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <div className="lg:contents">
          <div ref={sliderRef} className="keen-slider lg:contents">
            <div className={SLIDE}>
              <StatCard
                title="مجموع وام‌ها"
                icon={HandMoneyIcon}
                tone="blue"
                value={total}
                delta={{ text: `${all.length} وام`, label: "ثبت‌شده" }}
                loading={!credits}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title="پرداخت‌شده"
                icon={CardSendIcon}
                tone="green"
                value={paid}
                delta={{
                  text: `${percentOf(paid, total)}%`,
                  trend: "up",
                  label: "از کل بازپرداخت",
                }}
                loading={!credits}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title="مانده بدهی"
                icon={BillListIcon}
                tone="red"
                value={remaining}
                delta={{
                  text: `${remainingCount} قسط`,
                  tone: "yellow",
                  label: "باقی‌مانده",
                }}
                loading={!credits}
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

      {credits === undefined ? (
        <div className="mt-12 lg:mt-18">
          <Loader />
        </div>
      ) : credits.length === 0 ? (
        <EmptyState
          kind="loans"
          title="وامی ثبت نشده"
          description="وام و اقساطش رو اضافه کن تا مانده بدهی و سررسید بعدی رو ببینی."
          action={{ label: "وام جدید", onPress: () => setIsOpenModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 *:min-w-0">
          {credits.map((credit) => (
            <CreditsBox key={credit._id} creditInfo={credit} />
          ))}
        </div>
      )}

      <FormModal
        title="وام جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت وام"
        loading={isLoading}
        formId="credit-form"
      >
        <CreditsForm
          formId="credit-form"
          loading={isLoading}
          onLoadingChange={setIsLoading}
          onSuccess={() => setIsOpenModal(false)}
        />
      </FormModal>
    </div>
  );
};

export default Credits;