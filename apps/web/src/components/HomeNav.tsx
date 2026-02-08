import Link from "next/link";
import { WalletConnect } from "./WalletConnect";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/" },
  { label: "Notifications", href: "/" },
  { label: "Messages", href: "/" },
  { label: "Bookmarks", href: "/" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/status" },
];

export const HomeNav = () => {
  return (
    <aside className="sticky top-6 hidden h-fit w-56 flex-col gap-6 lg:flex">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="text-2xl font-semibold">X</div>
        <nav className="mt-6 flex flex-col gap-3 text-sm font-semibold text-zinc-700">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-zinc-200 pt-4">
          <WalletConnect />
        </div>
      </div>
    </aside>
  );
};
