"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import type { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export default function ChatMessage({
  message,
  isOwn,
  onEdit,
  onDelete,
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div className="relative group">
        <div
          className={`relative max-w-[80vw] min-w-[140px] rounded-[22px] text-sm leading-relaxed ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-[4px] px-4 py-3"
              : "bg-gray-100 text-gray-900 rounded-bl-[4px] px-4 py-3"
          }`}
        >
          {isOwn && (
            <span className="block text-[10px] leading-none mb-1 uppercase tracking-[0.14em] text-blue-100">
              Siz
            </span>
          )}
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          <p
            className={`text-[10px] mt-2 flex items-center gap-1 ${isOwn ? "text-blue-200" : "text-gray-400"}`}
          >
            {message.edited && (
              <span className="italic opacity-70">tahrirlangan</span>
            )}
            {new Date(message.createdAt).toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {isOwn && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowActions((prev) => !prev);
              }}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-sm opacity-0 transition-opacity duration-150 hover:bg-blue-50 group-hover:opacity-100"
              aria-label="Xabar amallarini ko‘rsatish"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>

        {isOwn && showActions && (
          <div className="absolute top-0 right-0 z-10 flex items-center gap-2 rounded-2xl bg-white border border-gray-200 p-2 shadow-lg">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit?.(message);
                setShowActions(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50"
              aria-label="Tahrirlash"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.(message.id);
                setShowActions(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
              aria-label="O'chirish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
