import { useMemo, useState } from "react";
import { useGetUsersQuery } from "../api/endpoints";

export function UserSelect(props: {
  value?: number;
  onChange: (userId: number) => void;
  placeholder?: string;
  label?: string;
}) {
  const { data: users, isLoading } = useGetUsersQuery();
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!users) return [] as { id: number; name: string; email: string }[];
    const mapped = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));
    if (!q) return mapped.slice(0, 20);
    return mapped
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [users, query]);

  const selected = useMemo(
    () => users?.find((u) => u.id === props.value),
    [users, props.value]
  );

  return (
    <div className="grid gap-1">
      {props.label && (
        <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
          {props.label}
        </label>
      )}
      <div className="relative">
        <input
          className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder={props.placeholder || "Search users by name or email"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow">
          {isLoading && (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          )}
          {!isLoading && list.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No users found
            </div>
          )}
          {!isLoading &&
            list.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 ${
                  selected?.id === u.id ? "bg-indigo-50" : ""
                }`}
                onClick={() => props.onChange(u.id)}
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </button>
            ))}
        </div>
      </div>
      {selected && (
        <div className="text-xs text-gray-600">Selected: {selected.name}</div>
      )}
    </div>
  );
}

