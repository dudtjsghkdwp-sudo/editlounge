"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Film,
  Camera,
  PenTool,
  Image as ImageIcon,
  Video as VideoIcon,
  Palette,
  User,
  Settings,
  Clapperboard,
  Sparkles,
  Package,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const navigationItems: NavItem[] = [
  { name: "홈", href: "/", icon: Home },
  { name: "프로젝트", href: "/projects", icon: Film },
  { name: "촬영 설계", href: "/director", icon: Camera },
  { name: "프롬프트", href: "/prompts", icon: PenTool },
  { name: "이미지", href: "/images", icon: ImageIcon },
  { name: "영상", href: "/videos", icon: VideoIcon },
  { name: "스타일", href: "/styles", icon: Palette },
  { name: "캐릭터", href: "/characters", icon: User },
  { name: "제품", href: "/products", icon: Package },
  { name: "설정", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#101217] border-r border-[#1e212b] flex flex-col h-screen fixed left-0 top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e212b] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Clapperboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-sm text-white flex items-center gap-1.5">
              AI VIDEO DIRECTOR
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-[11px] text-zinc-400 tracking-tight">영상 PD 프리프로덕션 워크스테이션</div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          워크스페이스 메뉴
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#171922]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-zinc-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status Box */}
      <div className="p-4 border-t border-[#1e212b] bg-[#0c0d12]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">Phase 3 엔진 가동 중</span>
        </div>
        <div className="text-[11px] text-zinc-400 leading-relaxed">
          AI 콘티 · 촬영 설계 · 이미지/영상 파이프라인
        </div>
      </div>
    </aside>
  );
}
