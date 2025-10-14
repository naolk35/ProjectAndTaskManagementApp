import { useMemo, useState } from "react";
import { AutoComplete, Input } from "antd";
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
    <AutoComplete
      style={{ width: "100%" }}
      open={open}
      onBlur={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      options={filtered.map((u) => ({
        value: String(u.id),
        label: (
          <div>
            <div style={{ fontWeight: 500, fontSize: 12 }}>{u.name}</div>
            <div style={{ color: "#888", fontSize: 11 }}>{u.email}</div>
          </div>
        ),
      }))}
      onSelect={(value) => {
        onChange(Number(value));
        setQuery("");
        setOpen(false);
      }}
      onSearch={(text) => {
        setQuery(text);
        if (selected) onChange(null);
      }}
    >
      <Input
        placeholder={placeholder || "Search user by name or email"}
        value={selected ? `${selected.name} (${selected.email})` : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (selected) onChange(null);
        }}
      />
    </AutoComplete>
  );
}
