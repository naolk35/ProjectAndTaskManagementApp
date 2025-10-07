import { useMemo, useState } from "react";
import type { User } from "../api/endpoints";

export function UserAutocomplete(props: {
  users: User[] | undefined;
  value?: number | null;
  onChange: (userId: number | null) => void;
  placeholder?: string;
}) {
  const { users, value, onChange, placeholder } = props;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!users) return [] as User[];
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 20);
    return users
      .filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q))
      .slice(0, 20);
  }, [users, query]);

  const selected = useMemo(() => {
    return users?.find((u) => u.id === value) || null;
  }, [users, value]);

  return (
    <div className="relative">
      <input
        className="w-full border rounded-md px-3 py-2 text-sm bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600 dark:placeholder:text-slate-400"
        placeholder={placeholder || "Search user by name or email"}
        value={selected ? `${selected.name} (${selected.email})` : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (selected) onChange(null);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border border-gray-200 dark:border-slate-700 bg-white text-gray-900 dark:bg-slate-900 dark:text-slate-100 shadow">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">
              No results
            </div>
          ) : (
            filtered.map((u) => (
              <button
                type="button"
                key={u.id}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => {
                  onChange(u.id);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <div className="font-medium text-sm">{u.name}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {u.email}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
