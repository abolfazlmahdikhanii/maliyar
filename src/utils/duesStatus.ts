export const getDuesStatus = (d: { status: "open" | "paid"; dueDate: string }) => {
  if (d.status === "paid") return "paid";
  const today = new Date().toLocaleDateString("sv-SE");
  if (d.dueDate < today) return "overdue";
  const days = (Date.parse(d.dueDate) - Date.parse(today)) / 86_400_000;
  return days <= 3 ? "nearly" : "pending";
};