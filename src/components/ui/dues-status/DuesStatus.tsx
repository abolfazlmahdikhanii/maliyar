type DuesStatusProps = {
  status: "paid" | "nearly" | "pending" | "overdue";
};

const DuesStatus = ({ status }: DuesStatusProps) => {
  if (status === "nearly") {
    return (
      <div className="text-[#ffb86c] bg-[#ffb86c]/12 border border-[#ffb86c]/28 text-xs py-1 px-2.75  rounded-lg">
        سررسید نزدیک
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="text-[#6bb5ff] bg-[#6bb5ff]/12 border border-[#6bb5ff]/28 text-xs py-1 px-2.75   rounded-lg">
        در جریان
      </div>
    );
  }
  if (status === "overdue") {
    return (
      <div className="bg-[#f060601a] text-[#f06060] border border-[#f06060]/28 text-xs py-1 px-2.75   rounded-lg">
        سررسید گذشته
      </div>
    );
  }
  if (status === "paid") {
    return (
      <div className="text-primary bg-primary/12 border border-primary/28 text-xs py-1 px-2.75   rounded-lg">
       پرداخت شده
      </div>
    );
  }
};

export default DuesStatus;
