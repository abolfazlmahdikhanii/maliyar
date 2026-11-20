import type { CashflowPoint } from "../../../hooks/useCashflow";
import { toFa } from "../../../utils/barChart";

type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: CashflowPoint }[];
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const { label, income, outcome, net } = payload[0].payload;
  const deficit = net < 0;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "10px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        minWidth: 170,
      }}
    >
      <div style={{ fontSize: 12, color: "#8b8b8b", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: deficit ? "#f06060" : "#4fa84f",
          fontWeight: 600,
        }}
      >
        {deficit ? "کسری" : "مازاد"}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#0a0a0a",
          direction: "ltr",
          textAlign: "right",
        }}
      >
        {deficit ? "−" : ""}
        {toFa(Math.abs(net))} تومان
      </div>

      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px dashed #e2e2e2",
          display: "grid",
          gap: 4,
          fontSize: 12,
          color: "#555",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>درآمد</span>
          <span style={{ direction: "ltr" }}>{toFa(income)}</span>
        </div>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>هزینه</span>
          <span style={{ direction: "ltr" }}>{toFa(outcome)}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomTooltip;
