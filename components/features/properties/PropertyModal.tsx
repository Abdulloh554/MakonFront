"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import {
  X,
  MapPin,
  Maximize,
  BedDouble,
  Layers,
  Calendar,
  DollarSign,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Building2,
  Eye,
} from "lucide-react";
import type { Property } from "@/types";
import {
  PROPERTY_TYPE_LABELS,
  DEAL_TYPE_LABELS,
  STATUS_LABELS,
} from "@/constants";
import { getSeller } from "@/store";
import { useToast } from "@/components/ui/ToastProvider";
import FloorPlanView from "./FloorPlanView";
import Link from "next/link";

const statusConfig: Record<
  string,
  { color: string; bg: string; border: string; dot: string }
> = {
  ready: {
    color: "var(--success)",
    bg: "color-mix(in srgb, var(--success) 15%, transparent)",
    border: "color-mix(in srgb, var(--success) 25%, transparent)",
    dot: "var(--success)",
  },
  "half-ready": {
    color: "var(--warning)",
    bg: "color-mix(in srgb, var(--warning) 15%, transparent)",
    border: "color-mix(in srgb, var(--warning) 25%, transparent)",
    dot: "var(--warning)",
  },
  land: {
    color: "var(--primary)",
    bg: "color-mix(in srgb, var(--primary) 15%, transparent)",
    border: "color-mix(in srgb, var(--primary) 25%, transparent)",
    dot: "var(--primary)",
  },
};

const dealConfig: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  sale: { color: "var(--primary)", bg: "color-mix(in srgb, var(--primary) 15%, transparent)", border: "color-mix(in srgb, var(--primary) 25%, transparent)" },
  rent: { color: "var(--success)", bg: "color-mix(in srgb, var(--success) 15%, transparent)", border: "color-mix(in srgb, var(--success) 25%, transparent)" },
  daily: { color: "var(--accent-gold)", bg: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", border: "color-mix(in srgb, var(--accent-gold) 25%, transparent)" },
  installment: {
    color: "var(--primary)",
    bg: "color-mix(in srgb, var(--primary) 15%, transparent)",
    border: "color-mix(in srgb, var(--primary) 25%, transparent)",
  },
};

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyModal({
  property,
  onClose,
}: PropertyModalProps) {
  const { t } = useI18n();
  const seller = getSeller(property.sellerId);
  const { showToast } = useToast();
  const [imgIndex, setImgIndex] = useState(0);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const images = property.images?.length ? property.images : [];
  const hasMultiple = images.length > 1;
  const st = statusConfig[property.status] || statusConfig.ready;
  const dl = dealConfig[property.dealType] || dealConfig.sale;
  const createdAt = property.createdAt ? new Date(property.createdAt) : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 animate-fade-in"
        style={{
          background: "rgba(15,23,42,0.65)",
          backdropFilter: "blur(6px)",
        }}
      />

      <div
        className="relative w-full max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto z-10 rounded-2xl animate-scale-in"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 80px rgba(15,23,42,0.22), 0 8px 24px rgba(15,23,42,0.10)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-90"
          style={{
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(8px)",
            color: "white",
          }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative h-60 sm:h-72 md:h-80 overflow-hidden rounded-t-2xl" style={{ background: 'var(--surface-2)' }}>
          <img
            key={imgIndex}
            src={images[imgIndex] || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover absolute inset-0"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.10) 45%, transparent 100%)",
            }}
          />
          {property.floorPlan && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowFloorPlan(true) }}
              className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
              style={{
                background: "rgba(24,95,165,0.75)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 16px rgba(24,95,165,0.35)",
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              {t('property_form.description_label')}
            </button>
          )}
          {hasMultiple && (
            <>
              {imgIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIndex(imgIndex - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-90"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {imgIndex < images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setImgIndex(imgIndex + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-90"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className="rounded-full transition-all duration-200 hover:scale-125"
                    style={{
                      width: i === imgIndex ? 20 : 6,
                      height: 6,
                      background: i === imgIndex ? "white" : "rgba(255,255,255,0.45)",
                    }}
                  />
                ))}
              </div>
              <div
                className="absolute top-3.5 left-3.5 z-10 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                style={{
                  background: "rgba(15,23,42,0.45)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {imgIndex + 1} / {images.length}
              </div>
            </>
          )}
          <div className="absolute bottom-4 left-4 z-10">
            <p
              className="text-2xl sm:text-3xl font-black leading-none"
              style={{ color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
            >
              {new Intl.NumberFormat("uz-UZ").format(property.price)}$
            </p>
            {property.dealType === "installment" && property.installmentMonths && (
              <p className="text-xs text-white/75 font-medium mt-0.5">
                oyiga {new Intl.NumberFormat("uz-UZ").format(property.installmentPrice || 0)}$ / {property.installmentMonths} oy
              </p>
            )}
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] leading-snug mb-3">
              {property.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: dl.bg, color: dl.color, border: `1px solid ${dl.border}` }}
              >
                {DEAL_TYPE_LABELS[property.dealType]}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                {STATUS_LABELS[property.status]}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                <Building2 className="w-3 h-3" />
                {PROPERTY_TYPE_LABELS[property.type]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              { icon: <Maximize className="w-4 h-4" />, label: `${property.area} m²`, color: "var(--primary)", bg: "color-mix(in srgb, var(--primary) 12%, transparent)" },
              ...(property.rooms > 0 ? [{ icon: <BedDouble className="w-4 h-4" />, label: `${property.rooms} xona`, color: "var(--primary)", bg: "color-mix(in srgb, var(--primary) 12%, transparent)" }] : []),
              ...(property.floor !== undefined && property.totalFloors ? [{ icon: <Layers className="w-4 h-4" />, label: `${property.floor}/${property.totalFloors} qavat`, color: "var(--primary)", bg: "color-mix(in srgb, var(--primary) 12%, transparent)" }] : []),
              { icon: <DollarSign className="w-4 h-4" />, label: property.dealType === "installment" ? "Bo'lib to'lov" : "Naxt to'lov", color: "var(--success)", bg: "color-mix(in srgb, var(--success) 12%, transparent)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-slate-700 truncate">{item.label}</span>
              </div>
            ))}

            <div className="col-span-2 md:col-span-3 flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}>
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-[var(--text-secondary)] truncate">{property.location.address}</span>
            </div>

            <div className="col-span-2 md:col-span-3 flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}>
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-[var(--text-muted)]">
                {createdAt ? createdAt.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('property_form.description_label')}</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{property.description}</p>
          </div>

          {seller && (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="px-4 py-2.5" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{t('sellers.title')}</h4>
              </div>
              <Link href={`/sellers/${seller.id}`} className="flex items-center gap-3.5 p-4 transition-colors group" style={{ background: 'var(--surface)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md shrink-0" style={{ background: "var(--primary)" }}>
                  {seller.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{seller.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{seller.phone}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3" style={{ fill: i < Math.floor(seller.rating) ? "var(--warning)" : "none", color: i < Math.floor(seller.rating) ? "var(--warning)" : "var(--border)" }} />
                    ))}
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent-gold)' }}>{seller.rating}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] transition-colors shrink-0" />
              </Link>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => showToast(seller?.phone || t('common.no_data'), 'info')}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: "var(--primary)",
              }}
            >
              <Phone className="w-4 h-4" />
              {seller?.phone || t('sellers.contact')}
            </button>
            <a
              href={`/messages?property=${property.id}`}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{ border: "2px solid var(--primary)", color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 6%, transparent)" }}
            >
              <MessageCircle className="w-4 h-4" />
              {t('messages.type_placeholder')}
            </a>
          </div>
        </div>
      </div>

      {showFloorPlan && property.floorPlan && (
        <FloorPlanView plan={property.floorPlan} onClose={() => setShowFloorPlan(false)} />
      )}
    </div>
  );
}
