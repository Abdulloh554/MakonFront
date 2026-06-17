"use client";

import { motion } from "framer-motion";
import type { Message } from "@/types";

interface ConversationItemProps {
  message: Message;
  propertyTitle: string;
  sellerName?: string;
  unread: boolean;
  onClick: () => void;
  index: number;
}

export default function ConversationItem({
  message,
  propertyTitle,
  sellerName,
  unread,
  onClick,
  index,
}: ConversationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
          !unread ? "bg-gray-300" : "bg-blue-500"
        }`}
      >
        {propertyTitle.charAt(0) || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm truncate ${!unread ? "text-gray-500" : "text-gray-900 font-semibold"}`}
          >
            {propertyTitle || "Noma'lum elon"}
          </p>
          {unread && (
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          )}
        </div>
        {sellerName && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            Sotuvchi: {sellerName}
          </p>
        )}
        <p
          className={`text-xs truncate mt-0.5 ${!unread ? "text-gray-400" : "text-gray-600"}`}
        >
          {message.text}
        </p>
      </div>
      <span className="text-[10px] text-gray-400 shrink-0">
        {new Date(message.createdAt).toLocaleDateString("uz-UZ")}
      </span>
    </motion.div>
  );
}
