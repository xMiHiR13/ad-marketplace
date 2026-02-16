interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  filterCount?: number;
  onSortClick?: () => void;
  isSortActive?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onFilterClick,
  filterCount = 0,
  onSortClick,
  isSortActive = false,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:bg-white/[0.07] transition-all duration-200"
        />
      </div>
      {onSortClick && (
        <button
          onClick={onSortClick}
          className={`relative h-10 w-10 flex items-center justify-center border rounded-xl transition-all duration-200 ${
            isSortActive
              ? "bg-primary/10 border-primary text-primary"
              : "bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-white/20"
          }`}
        >
          <i className="ri-sort-desc text-base" />
        </button>
      )}
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className="relative h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-foreground hover:bg-white/10 hover:border-white/20 transition-all duration-200"
        >
          <i className="ri-equalizer-line text-base" />
          {filterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {filterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
