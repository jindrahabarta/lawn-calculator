export const getColor = (index: number) => {
  const colors = [
    "#16a34a",
    "#2563eb",
    "#dc2626",
    "#9333ea",
    "#f59e0b",
    "#0d9488",
  ];
  return colors[index % colors.length];
};
