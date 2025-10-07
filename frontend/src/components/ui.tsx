import type { ReactNode, CSSProperties } from "react";

export function Container({ children }: { children: ReactNode }) {
  return <div className="max-w-[1100px] mx-auto p-6">{children}</div>;
}

export function Header({ children }: { children?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-slate-700 backdrop-blur">
      <div className="max-w-[1100px] mx-auto py-3 px-6 flex items-center justify-between">
        <div className="font-bold">Project & Task Manager</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Button(
  props: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className, style, ...rest } = props as {
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...rest}
      style={style}
      className={
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition " +
        "disabled:opacity-50 disabled:cursor-not-allowed " +
        (className ||
          "bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400")
      }
    />
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 shadow">
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger" | "info" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "bg-green-100 text-green-800"
      : tone === "danger"
      ? "bg-red-100 text-red-800"
      : tone === "info"
      ? "bg-blue-100 text-blue-800"
      : tone === "warning"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function Spinner() {
  return (
    <span
      role="status"
      aria-label="loading"
      className="inline-block w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
    />
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="border border-red-200 text-red-900 bg-red-100 rounded-lg p-3">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="border border-green-200 text-green-900 bg-green-100 rounded-lg p-3">
      {message}
    </div>
  );
}

export function Sidebar(
  props: {
    items: Array<{
      key: string;
      label: string;
      href?: string;
      onClick?: () => void;
    }>;
    activeKey?: string;
    header?: ReactNode;
    footer?: ReactNode;
    width?: number;
  } & React.HTMLAttributes<HTMLDivElement>
) {
  const width = props.width ?? 220;
  return (
    <aside
      {...props}
      className={`flex flex-col border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950`}
      style={{ width, ...(props.style as CSSProperties) }}
    >
      {props.header && <div className="p-4 font-semibold">{props.header}</div>}
      <nav className="p-2 grid gap-1">
        {props.items.map((it) => {
          const isActive = it.key === props.activeKey;
          return (
            <button
              key={it.key}
              onClick={it.onClick}
              className={`text-left rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-gray-100 dark:hover:bg-slate-900"
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </nav>
      {props.footer && <div className="mt-auto p-3">{props.footer}</div>}
    </aside>
  );
}

export function Modal(
  props: {
    open: boolean;
    title?: string;
    onClose: () => void;
    actions?: ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
) {
  if (!props.open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 grid place-items-center z-50"
      onClick={props.onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(720px,92vw)] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl"
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="font-bold">{props.title}</div>
        </div>
        <div className="p-4">{props.children}</div>
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex gap-2 justify-end">
          {props.actions}
        </div>
      </div>
    </div>
  );
}
