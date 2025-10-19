import React from "react";

interface SimpleTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  typeLabel: "Answers" | "Games";
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ active, payload, label, typeLabel }) => {
  if (!active || !payload?.length) return null;

  const count = payload[0]?.value ?? 0;
  const plural = count === 1 ? typeLabel.slice(0, -1) : typeLabel; // Answer / Answers

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-center">
      <div className="text-lg font-semibold text-gray-800">{label}</div>
      <div className="text-sm text-gray-500">
        {count} {plural}
      </div>
    </div>
  );
};

export default SimpleTooltip;
