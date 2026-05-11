"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Users, BookOpen, Settings, Briefcase, Boxes } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Ledger", href: "/ledger", icon: BookOpen },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Labour", href: "/labour", icon: Briefcase },
  { name: "Stock", href: "/stock", icon: Boxes },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 hidden w-64 border-r border-slate-200/80 bg-white/95 backdrop-blur md:flex flex-col z-50">
        <div className="p-5 pb-4">
          <Link href="/" className="block mx-auto w-fit">
            <Image
              src="/logo.jpg?v=2"
              alt="miniKnockout logo"
              width={100}
              height={30}
              unoptimized
              className="h-auto w-auto object-contain"
              priority
            />
          </Link>
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.22em] mt-2 text-center">miniKnockout</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/80">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">MK</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">miniKnockout Admin</p>
              <p className="text-[10px] text-slate-500 truncate">Pakistan Unit</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe md:hidden">
        <div className="mx-auto flex h-16 items-center justify-around px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-0"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}



