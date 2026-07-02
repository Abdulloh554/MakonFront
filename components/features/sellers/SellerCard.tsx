"use client";

import { Phone, ChevronRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Seller } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { getCurrentUser, getProperties } from "@/store";

interface SellerCardProps {
  seller: Seller;
  index: number;
  onClick: () => void;
}

export default function SellerCard({
  seller,
  index,
  onClick,
}: SellerCardProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const avatarColors = [
    "linear-gradient(135deg, #f59e0b, #f97316)",
    "linear-gradient(135deg, #94a3b8, #64748b)",
    "linear-gradient(135deg, #d97706, #b45309)",
    "linear-gradient(135deg, #185FA5, #378ADD)",
  ];
  const bg = avatarColors[index % avatarColors.length];

  function handleContact(e: React.MouseEvent) {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      router.push("/profile");
      return;
    }
    const props = getProperties().filter((p) => p.sellerId === seller.id);
    if (props.length > 0) {
      router.push(`/messages?property=${props[0].id}`);
    } else {
      router.push(`/messages?sellerId=${seller.id}`);
    }
  }

  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow:
          "0 16px 40px rgba(15,23,42,0.10), 0 4px 12px rgba(15,23,42,0.06)",
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-4 transition-colors"
      style={{
        background: "var(--surface)",
        border: "1.5px solid var(--gray-200)",
        boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
      }}
    >
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md"
            style={{ background: bg }}
          >
            {seller.name.charAt(0)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-slate-900 truncate">
            {seller.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              showToast(seller.phone, "info");
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#ecfdf5", color: "#059669" }}
          >
            <Phone className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleContact}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#E6F1FB", color: "#185FA5" }}
          >
            <MessageCircle className="w-4 h-4" />
          </motion.button>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </motion.div>
  );
}
