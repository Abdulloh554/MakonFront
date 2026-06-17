"use client";

import { useEffect, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

const statusConfig: Record<
  string,
  { color: string; bg: string; border: string; dot: string }
> = {
  ready: {
    color: "#059669",
    bg: "#ecfdf5",
    border: "rgba(5,150,105,0.2)",
    dot: "#34d399",
  },
  "half-ready": {
    color: "#d97706",
    bg: "#fffbeb",
    border: "rgba(217,119,6,0.2)",
    dot: "#fbbf24",
  },
  land: {
    color: "#185FA5",
    bg: "#E6F1FB",
    border: "rgba(24,95,165,0.2)",
    dot: "#60a5fa",
  },
};

const dealConfig: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  sale: { color: "#0C447C", bg: "#E6F1FB", border: "rgba(24,95,165,0.2)" },
  rent: { color: "#059669", bg: "#ecfdf5", border: "rgba(5,150,105,0.2)" },
  daily: { color: "#b45309", bg: "#fefce8", border: "rgba(180,83,9,0.2)" },
  installment: {
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "rgba(109,40,217,0.2)",
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

  const hasMultiple = property.images.length > 1;
  const st = statusConfig[property.status] || statusConfig.ready;
  const dl = dealConfig[property.dealType] || dealConfig.sale;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(6px)",
          }}
        />

        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="relative w-full max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[93dvh] overflow-y-auto z-10 rounded-t-3xl sm:rounded-3xl"
          style={{
            background: "white",
            boxShadow:
              "0 32px 80px rgba(15,23,42,0.22), 0 8px 24px rgba(15,23,42,0.10)",
          }}
        >
          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 flex items-center justify-center w-8 h-8 rounded-full"
            style={{
              background: "rgba(15,23,42,0.45)",
              backdropFilter: "blur(8px)",
              color: "white",
            }}
          >
            <X className="w-4 h-4" />
          </motion.button>

          {/* Image section */}
          <div className="relative h-60 sm:h-72 md:h-80 overflow-hidden rounded-t-3xl sm:rounded-t-3xl bg-slate-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIndex}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28 }}
                src={property.images[imgIndex] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover absolute inset-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
              />
            </AnimatePresence>
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.10) 45%, transparent 100%)",
              }}
            />
            {/* Floor plan button */}
            {property.floorPlan && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setShowFloorPlan(true) }}
                className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{
                  background: "rgba(24,95,165,0.75)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 16px rgba(24,95,165,0.35)",
                }}
              >
                <Eye className="w-3.5 h-3.5" />
                Uy chizmasi
              </motion.button>
            )}
            {/* Image nav */}
            {hasMultiple && (
              <>
                {imgIndex > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImgIndex(imgIndex - 1);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                )}
                {imgIndex < property.images.length - 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImgIndex(imgIndex + 1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {property.images.map((_, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.3 }}
                      onClick={() => setImgIndex(i)}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: i === imgIndex ? 20 : 6,
                        height: 6,
                        background:
                          i === imgIndex ? "white" : "rgba(255,255,255,0.45)",
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
                  {imgIndex + 1} / {property.images.length}
                </div>
              </>
            )}
            {/* Bottom price on image */}
            <div className="absolute bottom-4 left-4 z-10">
              <p
                className="text-2xl sm:text-3xl font-black leading-none"
                style={{
                  color: "white",
                  textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                }}
              >
                {new Intl.NumberFormat("uz-UZ").format(property.price)}$
              </p>
              {property.dealType === "installment" &&
                property.installmentMonths && (
                  <p className="text-xs text-white/75 font-medium mt-0.5">
                    oyiga{" "}
                    {new Intl.NumberFormat("uz-UZ").format(
                      property.installmentPrice || 0,
                    )}
                    $ / {property.installmentMonths} oy
                  </p>
                )}
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.3 }}
            className="p-5 md:p-6 space-y-5"
          >
            {/* Title + badges */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                {property.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: dl.bg,
                    color: dl.color,
                    border: `1px solid ${dl.border}`,
                  }}
                >
                  {DEAL_TYPE_LABELS[property.dealType]}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: st.bg,
                    color: st.color,
                    border: `1px solid ${st.border}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: st.dot }}
                  />
                  {STATUS_LABELS[property.status]}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "var(--gray-100)",
                    color: "var(--gray-600)",
                    border: "1px solid var(--gray-200)",
                  }}
                >
                  <Building2 className="w-3 h-3" />
                  {PROPERTY_TYPE_LABELS[property.type]}
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {[
                {
                  icon: <Maximize className="w-4 h-4" />,
                  label: `${property.area} m²`,
                  color: "#378ADD",
                  bg: "#E6F1FB",
                },
                ...(property.rooms > 0
                  ? [
                      {
                        icon: <BedDouble className="w-4 h-4" />,
                        label: `${property.rooms} xona`,
                        color: "#8b5cf6",
                        bg: "#f5f3ff",
                      },
                    ]
                  : []),
                ...(property.floor !== undefined && property.totalFloors
                  ? [
                      {
                        icon: <Layers className="w-4 h-4" />,
                        label: `${property.floor}/${property.totalFloors} qavat`,
                        color: "#0ea5e9",
                        bg: "#f0f9ff",
                      },
                    ]
                  : []),
                {
                  icon: <DollarSign className="w-4 h-4" />,
                  label:
                    property.dealType === "installment"
                      ? "Bo'lib to'lov"
                      : "Naxt to'lov",
                  color: "#059669",
                  bg: "#ecfdf5",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{
                    background: "var(--gray-50)",
                    border: "1px solid var(--gray-150)",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {item.label}
                  </span>
                </div>
              ))}

              {/* Address — full width */}
              <div
                className="col-span-2 md:col-span-3 flex items-center gap-2.5 p-3 rounded-xl"
                style={{
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-150)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#fef3c7", color: "#d97706" }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 truncate">
                  {property.location.address}
                </span>
              </div>

              {/* Date */}
              <div
                className="col-span-2 md:col-span-3 flex items-center gap-2.5 p-3 rounded-xl"
                style={{
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-150)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#f1f5f9", color: "#64748b" }}
                >
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {new Date(property.createdAt).toLocaleDateString("uz-UZ", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-150)",
              }}
            >
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tavsif
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Seller card */}
            {seller && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--gray-150)" }}
              >
                <div
                  className="px-4 py-2.5"
                  style={{
                    background: "var(--gray-50)",
                    borderBottom: "1px solid var(--gray-150)",
                  }}
                >
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sotuvchi
                  </h4>
                </div>
                <Link
                  href={`/sellers/${seller.id}`}
                  className="flex items-center gap-3.5 p-4 hover:bg-blue-50/50 transition-colors group"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #185FA5, #378ADD)",
                    }}
                  >
                    {seller.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {seller.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {seller.phone}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3"
                          style={{
                            fill:
                              i < Math.floor(seller.rating)
                                ? "#f59e0b"
                                : "none",
                            color:
                              i < Math.floor(seller.rating)
                                ? "#f59e0b"
                                : "#d1d5db",
                          }}
                        />
                      ))}
                      <span className="text-xs font-semibold text-amber-600 ml-1">
                        {seller.rating}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                </Link>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 pt-1">
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 12px 28px rgba(24,95,165,0.35)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => showToast(seller?.phone || "Raqam topilmadi", 'info')}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #185FA5 0%, #378ADD 100%)",
                  boxShadow: "0 6px 20px rgba(24,95,165,0.28)",
                }}
              >
                <Phone className="w-4 h-4" />
                {seller?.phone || "Qo'ng'iroq qilish"}
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                href={`/messages?property=${property.id}`}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all"
                style={{
                  border: "2px solid #185FA5",
                  color: "#185FA5",
                  background: "rgba(24,95,165,0.04)",
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Xabar yozish
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {showFloorPlan && property.floorPlan && (
        <FloorPlanView
          plan={property.floorPlan}
          onClose={() => setShowFloorPlan(false)}
        />
      )}
    </AnimatePresence>
  );
}
