"use client";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = Infinity,
  size = "md",
  disabled = false,
}: QuantitySelectorProps) {
  const isSm = size === "sm";

  const handleChange = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;
    onChange(Math.max(min, Math.min(max, n)));
  };

  return (
    <div
      className={`inline-flex items-center border border-gray-300 rounded overflow-hidden ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className={`flex items-center justify-center text-gray-600 hover:text-heading hover:bg-gray-100 transition-colors disabled:opacity-30 ${
          isSm ? "w-7 h-7 text-xs" : "w-10 h-10"
        }`}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {
          if (value < min) onChange(min);
        }}
        disabled={disabled}
        className={`text-center font-medium text-heading outline-none bg-transparent border-x border-gray-300 ${
          isSm ? "w-8 h-7 text-xs" : "w-12 h-10 text-sm"
        }`}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className={`flex items-center justify-center text-gray-600 hover:text-heading hover:bg-gray-100 transition-colors disabled:opacity-30 ${
          isSm ? "w-7 h-7 text-xs" : "w-10 h-10"
        }`}
      >
        +
      </button>
    </div>
  );
}
