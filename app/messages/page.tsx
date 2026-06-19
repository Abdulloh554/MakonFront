"use client";

import { Suspense, useState, useEffect, useRef, useMemo, useCallback, startTransition } from "react";
import type { Message, Conversation } from "@/types";
import {
  getCurrentUser,
  getProperty,
  getSeller,
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} from "@/store";
import { useHydrated } from "@/hooks/useHydrated";
import { apiFetchMessages, apiFetchConversations } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Send, ChevronDown } from "lucide-react";
import AuthPrompt from "@/components/features/auth/AuthPrompt";
import PageTransition from "@/components/layout/PageTransition";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import ChatMessage from "@/components/messages/ChatMessage";
import TypingIndicator from "@/components/messages/TypingIndicator";
import { motion } from "framer-motion";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("property");
  const sellerIdParam = searchParams.get("sellerId");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = hydrated ? getCurrentUser() : null;
  const showAuth = hydrated && !getCurrentUser();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageVersion, setMessageVersion] = useState(0);
  const [serverMessages, setServerMessages] = useState<Message[] | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const socket = useSocket();

  const {
    connected,
    typingUsers,
    onlineUsers,
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
  } = socket;

  const resolveUserId = useCallback((id: string): string => {
    const seller = getSeller(id);
    return seller && seller.userId ? seller.userId : id;
  }, []);

  const resolveUserName = useCallback((id: string): string => {
    const seller = getSeller(id);
    return seller?.name || id;
  }, []);

  const autoScroll = useCallback(() => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messageVersion, serverMessages?.length]);

  const property = propertyId ? getProperty(propertyId) : null;
  const myMessages = user ? getMessages(user.id) : [];

  const conversationPartnerId = useMemo(() => {
    if (!user) return null;
    if (propertyId && property) {
      const sellerUserId = resolveUserId(property.sellerId);
      if (sellerUserId !== user.id) return sellerUserId;
      const existing = myMessages.find(
        (m) => m.propertyId === propertyId && m.fromUserId !== user.id,
      );
      return existing ? resolveUserId(existing.fromUserId) : null;
    }
    if (!sellerIdParam) return null;
    const resolvedSeller = resolveUserId(sellerIdParam);
    if (resolvedSeller !== user.id) return resolvedSeller;
    const existing = myMessages.find(
      (m) =>
        m.propertyId === "general" &&
        (m.fromUserId === sellerIdParam || m.toUserId === sellerIdParam),
    );
    if (!existing) return null;
    const otherId = existing.fromUserId === user.id
      ? existing.toUserId
      : existing.fromUserId;
    return resolveUserId(otherId);
  }, [user, propertyId, property, sellerIdParam, myMessages, resolveUserId]);

  const displaySeller = useMemo(() => {
    if (property) return getSeller(property.sellerId);
    if (sellerIdParam && sellerIdParam !== user?.id) return getSeller(sellerIdParam);
    if (conversationPartnerId) return getSeller(conversationPartnerId);
    return null;
  }, [property, sellerIdParam, user, conversationPartnerId]);

  const partnerName = useMemo(() => {
    if (displaySeller?.name) return displaySeller.name;
    if (conversationPartnerId) return resolveUserName(conversationPartnerId);
    return "Sotuvchi bilan suhbat";
  }, [displaySeller, conversationPartnerId, resolveUserName]);

  const [loadingRemoteMessages, setLoadingRemoteMessages] = useState(false);

  useEffect(() => {
    if (!hydrated || !user || !conversationPartnerId) {
      startTransition(() => setServerMessages(null));
      return;
    }

    startTransition(() => setLoadingRemoteMessages(true));

    apiFetchMessages(conversationPartnerId)
      .then((messages) => {
        setServerMessages(messages.length > 0 ? messages : []);
      })
      .catch(() => {
        setServerMessages(null);
      })
      .finally(() => {
        setLoadingRemoteMessages(false);
      });
  }, [hydrated, user?.id, conversationPartnerId]);

  const [loadingConversations, setLoadingConversations] = useState(true);

  useEffect(() => {
    if (!hydrated || !user) {
      startTransition(() => setLoadingConversations(false));
      return;
    }
    apiFetchConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoadingConversations(false));
  }, [hydrated, user?.id, messageVersion]);

  useEffect(() => {
    if (!conversationPartnerId) return;
    joinConversation(conversationPartnerId);
    return () => leaveConversation(conversationPartnerId);
  }, [conversationPartnerId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!conversationPartnerId) return;
    const unsub = socket.onNewMessage((message: Message) => {
      if (
        (message.fromUserId === conversationPartnerId && message.toUserId === user?.id) ||
        (message.fromUserId === user?.id && message.toUserId === conversationPartnerId)
      ) {
        setServerMessages((prev) => {
          if (!prev) return [message];
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        setMessageVersion((v) => v + 1);
      }
    });
    return () => unsub();
  }, [conversationPartnerId, user?.id, socket]);

  useEffect(() => {
    if (!conversationPartnerId) return;
    const unsub = socket.onMessageUpdated((message: Message) => {
      if (
        (message.fromUserId === conversationPartnerId && message.toUserId === user?.id) ||
        (message.fromUserId === user?.id && message.toUserId === conversationPartnerId)
      ) {
        setServerMessages((prev) => {
          if (!prev) return prev;
          return prev.map((m) => (m.id === message.id ? message : m));
        });
        setMessageVersion((v) => v + 1);
      }
    });
    return () => unsub();
  }, [conversationPartnerId, user?.id, socket]);

  useEffect(() => {
    if (!conversationPartnerId) return;
    const unsub = socket.onMessageDeleted((data: { messageId: string }) => {
      setServerMessages((prev) => {
        if (!prev) return prev;
        return prev.filter((m) => m.id !== data.messageId);
      });
      setMessageVersion((v) => v + 1);
    });
    return () => unsub();
  }, [conversationPartnerId, user?.id, socket]);

  const partnerTyping = useMemo(() => {
    if (!conversationPartnerId) return false;
    return typingUsers.get(conversationPartnerId) ?? false;
  }, [typingUsers, conversationPartnerId]);

  useEffect(() => {
    if (!conversationPartnerId) return;
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      autoScroll();
    }
  }, [serverMessages, partnerTyping, autoScroll, conversationPartnerId]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    setShowScrollBtn(!isNearBottom);
  }, [setShowScrollBtn]);

  const chatMessages = useMemo(() => {
    if (!conversationPartnerId) return [];

    if (serverMessages !== null) {
      return serverMessages.filter(
        (m) =>
          (m.fromUserId === conversationPartnerId && m.toUserId === user?.id) ||
          (m.fromUserId === user?.id && m.toUserId === conversationPartnerId),
      );
    }

    return myMessages.filter(
      (m) => m.toUserId === conversationPartnerId || m.fromUserId === conversationPartnerId,
    );
  }, [serverMessages, conversationPartnerId, user?.id, myMessages]);

  async function handleSend() {
    if (!user || !newMessage.trim()) return;
    const targetId = conversationPartnerId;
    if (!targetId) return;

    if (editingMessageId) {
      const updatedMessage = updateMessage(editingMessageId, newMessage.trim());
      setNewMessage("");
      setEditingMessageId(null);
      setMessageVersion((v) => v + 1);
      setServerMessages((prev) =>
        prev
          ? prev.map((m) =>
              m.id === editingMessageId && updatedMessage ? updatedMessage : m,
            )
          : prev,
      );
      return;
    }

    const sentMessage = sendMessage(
      user.id,
      targetId,
      propertyId || "general",
      newMessage.trim(),
    );
    setNewMessage("");
    setMessageVersion((v) => v + 1);
    setServerMessages((prev) =>
      prev ? [...prev, sentMessage] : [sentMessage],
    );
    autoScroll();
  }

  function handleEditMessage(message: Message) {
    setEditingMessageId(message.id);
    setNewMessage(message.text);
  }

  function handleDeleteMessage(messageId: string) {
    deleteMessage(messageId);
    setMessageVersion((v) => v + 1);
    setServerMessages((prev) =>
      prev ? prev.filter((m) => m.id !== messageId) : prev,
    );
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setNewMessage("");
  }

  function handleInputChange(value: string) {
    setNewMessage(value);
    if (!conversationPartnerId) return;
    emitTypingStart(conversationPartnerId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitTypingStop(conversationPartnerId!);
    }, 2000);
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function selectConversation(partnerId: string) {
    router.push("/messages?sellerId=" + partnerId);
  }

  if (showAuth) {
    return <AuthPrompt onClose={() => router.back()} />;
  }

  const showChat = !!conversationPartnerId || !!propertyId || !!sellerIdParam;

  return (
    <PageTransition>
      <PageHeader title="Xabarlar" />

      <div className="flex-1 flex min-h-0 overflow-hidden px-4 md:px-6 lg:px-8 pb-4 lg:pb-6">
        <div className="flex w-full max-w-5xl mx-auto gap-4 flex-1 min-h-0">
          {showChat && (
            <motion.button
              whileHover={{ x: -2 }}
              onClick={() => router.replace("/messages")}
              className="md:hidden fixed top-4 left-4 z-20 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white/95 rounded-full px-3.5 py-2 shadow-md border border-gray-200 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </motion.button>
          )}

          <div className={`flex-col min-h-0 pb-16 md:pb-0 ${showChat ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 shrink-0 border-r border-gray-200 pr-0 md:pr-4 overflow-y-auto`}>
            <div className="pb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-2">
                Barcha xabarlar
              </h2>
              {loadingConversations ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-16 rounded-2xl" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare className="w-6 h-6 text-gray-300" />}
                  title="Xabarlar yo'q"
                  description="Biror elonga xabar yozing"
                />
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => {
                    const isActive = conv.participantId === conversationPartnerId;
                    const seller = getSeller(conv.participantId);
                    const sellerName = seller?.name || conv.participantName;
                    return (
                      <motion.div
                        key={conv.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => selectConversation(conv.participantId)}
                        className={`flex items-center gap-3 rounded-2xl p-3 cursor-pointer transition-all ${
                          isActive
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-white border border-gray-100 hover:shadow-md hover:border-gray-200"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {sellerName.charAt(0) || "?"}
                          </div>
                          {onlineUsers.has(conv.participantId) && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm truncate ${conv.unread > 0 ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                              {sellerName}
                            </p>
                            {conv.unread > 0 && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${conv.unread > 0 ? "text-gray-600 font-medium" : "text-gray-400"}`}>
                            {conv.lastMessage || "Xabar yo'q"}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleDateString("uz-UZ")
                            : ""}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={`flex-col flex-1 min-h-0 pb-16 md:pb-0 ${!showChat ? "hidden md:flex" : "flex"}`}>
            {showChat ? (
              <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
                <div className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-slate-200">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                      {partnerName.charAt(0) || "?"}
                    </div>
                    {onlineUsers.has(conversationPartnerId || "") && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {property
                        ? property.title
                        : partnerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {onlineUsers.has(conversationPartnerId || "")
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                  {!connected && (
                    <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                      Ulanmoqda...
                    </span>
                  )}
                </div>

                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-5 space-y-3 relative"
                >
                  {loadingRemoteMessages ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-start">
                          <div className="skeleton h-12 w-3/4 rounded-[22px]" />
                        </div>
                      ))}
                    </div>
                  ) : chatMessages.length === 0 && !partnerTyping ? (
                    <EmptyState
                      icon={<MessageSquare className="w-6 h-6 text-gray-300" />}
                      title="Hozircha xabar yo'q"
                      description="Birinchi xabarni yozing"
                    />
                  ) : (
                    <>
                      {chatMessages.map((m) => (
                        <ChatMessage
                          key={m.id}
                          message={m}
                          isOwn={m.fromUserId === user?.id}
                          onEdit={handleEditMessage}
                          onDelete={handleDeleteMessage}
                        />
                      ))}
                      {partnerTyping && (
                        <TypingIndicator name={partnerName} />
                      )}
                    </>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {showScrollBtn && (
                  <button
                    type="button"
                    onClick={autoScroll}
                    className="absolute bottom-20 right-8 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:shadow-lg transition-all"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}

                <div className="shrink-0 border-t border-slate-200 p-4">
                  {editingMessageId && (
                    <div className="flex items-center justify-between gap-4 px-2 pb-2 text-xs text-gray-500">
                      <span>Xabarni tahrirlash rejimida</span>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-end">
                    <textarea
                      value={newMessage}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder={editingMessageId ? "Xabarni tahrirlash..." : "Xabar yozish..."}
                      rows={1}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none min-h-[42px] max-h-[120px] leading-relaxed"
                      style={{ height: "auto" }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = "auto";
                        el.style.height = Math.min(el.scrollHeight, 120) + "px";
                      }}
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={<MessageSquare className="w-10 h-10 text-gray-300" />}
                  title="Xabarlar"
                  description="Chapdagi ro'yxatdan suhbatni tanlang"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MessagesContent />
    </Suspense>
  );
}
