import { Label } from "@heroui/react";
import { AltArrowDownIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import { CATEGORIES } from "../../../../data/categories";

type CategoriesProps = {
  categoryId: string | null;
  setCategoryId: (data: string) => void;
  onCategoryName?: (data: string) => void;
};

const inVisibleCategory = [
  "claim",
  "check-income",
  "check-outcome",
  "loan",
  "debt",
  "subscription",
  "goal",
];

const MOBILE_LIMIT = 6;

const visibleCategories = CATEGORIES.filter(
  (c) => !inVisibleCategory.includes(c.id),
);

const Categories = ({ categoryId, setCategoryId }: CategoriesProps) => {
  const selectedIndex = visibleCategories.findIndex((c) => c.id === categoryId);
  const [isExpanded, setIsExpanded] = useState<boolean>(
    selectedIndex >= MOBILE_LIMIT,
  );

  return (
    <section className="mt-5 flex max-w-2xl flex-col gap-2 sm:mt-5.5">
      <Label className="text-muted text-sm">دسته بندی</Label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {visibleCategories.map((category, index) => {
          const isSelected = categoryId === category.id;

          const isHiddenOnMobile = !isExpanded && index >= MOBILE_LIMIT;

          return (
            <button
              key={category.id}
              type="button"
              className={`min-w-0 cursor-pointer flex-col items-center gap-2 rounded-xl border px-2 py-2.5 transition-all duration-200 sm:flex sm:gap-3 sm:px-3 ${
                isHiddenOnMobile ? "hidden" : "flex"
              } ${isSelected ? "" : "border-secondary bg-secondary"}`}
              onClick={() => setCategoryId(category.id)}
              style={
                isSelected
                  ? {
                      backgroundColor: category.bg,
                      borderColor: category.color,
                    }
                  : undefined
              }
            >
              <div
                className="grid size-10 min-h-10 min-w-10 place-content-center rounded-full sm:size-11 sm:min-h-11 sm:min-w-11"
                style={{ background: category.bg, color: category.color }}
              >
                <category.icon size={21} />
              </div>
              <p
                className={`w-full truncate text-center text-xs sm:text-sm ${
                  isSelected ? "text-white" : "text-muted"
                }`}
              >
                {category.label}
              </p>
            </button>
          );
        })}
      </div>

      {visibleCategories.length > MOBILE_LIMIT && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-secondary bg-secondary py-2.5 text-xs text-muted sm:hidden"
        >
          {isExpanded ? "مشاهده کمتر" : "مشاهده بیشتر"}
          <AltArrowDownIcon
            size={14}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </section>
  );
};

export default Categories;
