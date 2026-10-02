"use client";

import Link from "next/link";
import { Sparkles, SlidersHorizontal, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-14 bg-[#101217] border-b border-[#1e212b] sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800/60">
          PRO EDITION
        </span>
        <span className="text-xs text-zinc-400">
          Professional Pre-Production Workstation
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white bg-[#171923] hover:bg-[#202330] border border-[#262a39] px-3 py-1.5 rounded-lg transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          <span>API 설정</span>
        </Link>
      </div>
    </header>
  );
}
