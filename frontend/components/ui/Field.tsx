/* eslint-disable @typescript-eslint/no-explicit-any */
const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  icon: Icon,
  hidden,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: any;
  hidden?: boolean;
}) => {
  return (
    <div className="space-y-1 w-full text-left">
      <label className="block text-xs font-semibold text-slate-600 dark:text-cream uppercase tracking-wider">
        {label}
      </label>
      <div className="relative rounded-xl overflow-hidden">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-midgray">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          hidden={hidden}
          className={`w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-glanz-gold focus:ring-1 focus:ring-glanz-gold transition-all placeholder-midgray disabled:opacity-40 disabled:cursor-not-allowed ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

export default Field