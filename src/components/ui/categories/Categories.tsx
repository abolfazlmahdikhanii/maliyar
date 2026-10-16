import { Label } from "@heroui/react";
import {CATEGORIES} from "../../../../data/categories"



type CategoriesProps = {
  categoryId: string | null;
  setCategoryId: (data: string) => void;
  onCategoryName?: (data: string) => void;
};

const Categories = ({
  categoryId,
  setCategoryId,
  onCategoryName,
}: CategoriesProps) => {
  return (
    <section className="flex flex-col gap-2  max-w-2xl mt-5.5">
      <Label htmlFor="title" className="text-muted text-sm">
        دسته بندی{" "}
      </Label>
      <div className="grid grid-cols-4 gap-3">
        {CATEGORIES.map((category) => (
          <div
            key={category.id}
            className={`flex flex-col items-center gap-3 py-2.5 px-3 transition-all duration-200  border  rounded-xl cursor-pointer ${
              categoryId !== category.id ? "bg-secondary border-secondary" : ""
            }`}
            onClick={() => {
              setCategoryId(category.id);
              onCategoryName?.(category.label);
            }}
            style={
              categoryId === category.id
                ? {
                    backgroundColor: category.bg,
                    borderColor: category.color,
                  }
                : undefined
            }
          >
            <div
              className={`w-11 h-11 min-w-11 min-h-11 grid rounded-full place-content-center `}
              style={{ background: category.bg, color: category.color }}
            >
              <category.icon size={21} />
            </div>
            <p
              className={`${
                category.id === categoryId ? "text-white" : "text-muted"
              } text-sm whitespace-nowrap`}
            >
              {category.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
