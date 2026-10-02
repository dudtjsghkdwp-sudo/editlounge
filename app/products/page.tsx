"use client";

import { useEffect, useState } from "react";
import { Box, Plus, X, Sparkles, ExternalLink, Trash2, Tag, ShieldCheck } from "lucide-react";
import { ProductProfile } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product form
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [shape, setShape] = useState("");
  const [size, setSize] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [referenceImageUrl, setReferenceImageUrl] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim(),
          modelName: modelName.trim(),
          color: color.trim(),
          material: material.trim(),
          shape: shape.trim(),
          size: size.trim(),
          keyFeatures: keyFeatures.trim(),
          referenceImageUrl: referenceImageUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts([data.product, ...products]);
        setIsModalOpen(false);
        setName("");
        setBrand("");
        setModelName("");
        setColor("");
        setMaterial("");
        setShape("");
        setSize("");
        setKeyFeatures("");
        setReferenceImageUrl("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 제품 프로필을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            PRODUCT CONSISTENCY MANAGER
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-400" />
            제품 관리자 (Product Manager)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            제품 광고 제작 시 모델명, 형태, 색상, 재질, 로고 등의 일관성을 모든 Scene에 고정합니다.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          새 제품 등록
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-[#13151c] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-[#12141c] border border-dashed border-[#232734] rounded-2xl p-8 space-y-3">
          <Box className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">등록된 제품이 없습니다</h3>
          <p className="text-xs text-zinc-400">새 제품 등록 버튼을 눌러 광고 제품의 디테일을 저장해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-[#12141c] border border-[#212534] hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xl group"
            >
              <div className="space-y-3">
                {p.referenceImageUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#232738]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.referenceImageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white font-mono">
                      Ref Asset
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800/40">
                    {p.brand || "Brand"}
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {p.name}
                </h3>
                {p.modelName && (
                  <p className="text-xs text-zinc-400 font-mono -mt-1">{p.modelName}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-[#171923] p-2 rounded-lg border border-[#242838]">
                    <span className="text-zinc-400 block text-[10px]">색상</span>
                    <span className="text-zinc-200 line-clamp-1">{p.color || "—"}</span>
                  </div>
                  <div className="bg-[#171923] p-2 rounded-lg border border-[#242838]">
                    <span className="text-zinc-400 block text-[10px]">재질</span>
                    <span className="text-zinc-200 line-clamp-1">{p.material || "—"}</span>
                  </div>
                  <div className="bg-[#171923] p-2 rounded-lg border border-[#242838]">
                    <span className="text-zinc-400 block text-[10px]">형태</span>
                    <span className="text-zinc-200 line-clamp-1">{p.shape || "—"}</span>
                  </div>
                  <div className="bg-[#171923] p-2 rounded-lg border border-[#242838]">
                    <span className="text-zinc-400 block text-[10px]">크기</span>
                    <span className="text-zinc-200 line-clamp-1">{p.size || "—"}</span>
                  </div>
                </div>

                {p.keyFeatures && (
                  <p className="text-xs text-zinc-300 bg-[#161824] p-2.5 rounded-lg border border-[#252a3b] leading-relaxed">
                    <strong className="text-blue-400">특징: </strong> {p.keyFeatures}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#1e222e] text-[10px] text-zinc-400 flex items-center justify-between">
                <span>등록일: {new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="text-emerald-400 font-semibold">✓ 일관성 락 활성</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#252838] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#212534] bg-[#161823] flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                새 제품 프로필 등록
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">제품명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: VÉLOA D1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">브랜드</label>
                  <input
                    type="text"
                    placeholder="예: VÉLOA"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">모델명 / 세부코드</label>
                  <input
                    type="text"
                    placeholder="예: D1 Countertop"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">제품 색상</label>
                  <input
                    type="text"
                    placeholder="예: Ivory White, Matte Rose-Gold"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">재질 (Material)</label>
                  <input
                    type="text"
                    placeholder="예: Matte ceramic, tempered glass"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">형태 (Shape)</label>
                  <input
                    type="text"
                    placeholder="예: Rounded rectangular compact"
                    value={shape}
                    onChange={(e) => setShape(e.target.value)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">크기 및 비율</label>
                <input
                  type="text"
                  placeholder="예: 450mm x 420mm x 460mm"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">주요 디자인 특징 (Key Features)</label>
                <textarea
                  rows={2}
                  placeholder="예: 상단 히든 터치 디스플레이, 내부 은은한 LED 조명, 매트한 촉감"
                  value={keyFeatures}
                  onChange={(e) => setKeyFeatures(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">참조 이미지 URL (Reference Image)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  제품 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
