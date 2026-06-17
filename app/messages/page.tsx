"use client";

import { Suspense, useState, useEffect, useRef, useMemo, useCallback, startTransition } from "react";
import type { Message, Seller } from "@/types";
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
import { apiFetchMessages } from "@/services/api";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import AuthPrompt from "@/components/features/auth/AuthPrompt";
import PageTransition from "@/components/layout/PageTransition";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import ChatMessage from "@/components/messages/ChatMessage";
import ChatInput from "@/components/messages/ChatInput";
import ConversationItem from "@/components/messages/ConversationItem";
import { motion } from "framer-motion";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("property");
  const sellerIdParam = searchParams.get("sellerId");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();

  const user = hydrated ? getCurrentUser() : null;
  const showAuth = hydrated && !getCurrentUser();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageVersion, setMessageVersion] = useState(0);
  const [serverMessages, setServerMessages] = useState<Message[] | null>(null);
  const [serverError, setServerError] = useState(false);
  const [loadingRemoteMessages, setLoadingRemoteMessages] = useState(false);

  const resolveUserId = useCallback((id: string): string => {
    const seller = getSeller(id)
    if (seller && seller.userId) return seller.userId
    return id
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [propertyId, sellerIdParam, user, serverMessages]);

  const property = propertyId ? getProperty(propertyId) : null;
  const myMessages = user ? getMessages(user.id) : [];

  const conversationPartnerId = useMemo(() => {
    if (!user) return null;
    if (propertyId && property) {
      const sellerUserId = resolveUserId(property.sellerId)
      if (sellerUserId !== user.id) return sellerUserId
      const existing = myMessages.find(
        (m) => m.propertyId === propertyId && m.fromUserId !== user.id,
      );
      return existing ? resolveUserId(existing.fromUserId) : null;
    }
    if (!sellerIdParam) return null;
    const resolvedSeller = resolveUserId(sellerIdParam)
    if (resolvedSeller !== user.id) return resolvedSeller
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
    if (property) return getSeller(property.sellerId)
    if (sellerIdParam && sellerIdParam !== user?.id) return getSeller(sellerIdParam)
    if (conversationPartnerId) return getSeller(conversationPartnerId)
    return null
  }, [property, sellerIdParam, user, conversationPartnerId])

  useEffect(() => {
    if (!hydrated || !user || !conversationPartnerId) {
      return;
    }

    startTransition(() => setServerError(false))

    apiFetchMessages(conversationPartnerId)
      .then((messages) => {
        if (messages.length === 0 && myMessages.length > 0) {
          setServerMessages(null);
        } else {
          setServerMessages(messages);
        }
      })
      .catch(() => {
        setServerMessages(null);
        setServerError(true);
      })
      .finally(() => {
        setLoadingRemoteMessages(false);
      });
  }, [hydrated, user?.id, conversationPartnerId, myMessages.length]);

  const chatMessages =
    serverMessages !== null
      ? serverMessages
      : propertyId
        ? myMessages.filter((m) => m.propertyId === propertyId)
        : conversationPartnerId
          ? myMessages.filter(
              (m) => m.toUserId === conversationPartnerId || m.fromUserId === conversationPartnerId,
            )
          : [];

  function handleSend() {
    if (!user || !newMessage.trim()) return;
    const targetId = conversationPartnerId
    if (!targetId) return;

    if (editingMessageId) {
      const updatedMessage = updateMessage(editingMessageId, newMessage.trim());
      setNewMessage("");
      setEditingMessageId(null);
      setMessageVersion((version) => version + 1);
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
    setMessageVersion((version) => version + 1);
    setServerMessages((prev) =>
      prev ? [...prev, sentMessage] : [sentMessage],
    );
  }

  const partnerConversations = useMemo(() => {
    if (!user) return [];

    const map = new Map<
      string,
      {
        message: Message;
        propertyTitle: string | null;
        sellerName: string | null;
        isGeneral: boolean;
      }
    >();

    myMessages.forEach((m) => {
      const partnerId = m.fromUserId === user.id ? m.toUserId : m.fromUserId;
      if (!partnerId) return;
      const existing = map.get(partnerId);
      const isLater =
        !existing ||
        new Date(m.createdAt) > new Date(existing.message.createdAt);
      if (!isLater) return;

      const property =
        m.propertyId !== "general" ? getProperty(m.propertyId) : null;
      let sellerName: string | null = null
      if (property) {
        const s = getSeller(property.sellerId)
        if (s) sellerName = s.name
      } else {
        const s = getSeller(partnerId)
        if (s) sellerName = s.name
        if (!sellerName) {
          const allSellers = [getSeller(partnerId)]
          for (const s of allSellers) {
            if (s?.userId === partnerId) { sellerName = s.name; break }
          }
        }
      }
      map.set(partnerId, {
        message: m,
        propertyTitle: property ? property.title : null,
        sellerName,
        isGeneral: m.propertyId === "general" || !property,
      });
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.message.createdAt).getTime() -
        new Date(a.message.createdAt).getTime(),
    );
  }, [myMessages, user]);

  function handleEditMessage(message: Message) {
    setEditingMessageId(message.id);
    setNewMessage(message.text);
  }

  function handleDeleteMessage(messageId: string) {
    deleteMessage(messageId);
    setMessageVersion((version) => version + 1);
    setServerMessages((prev) =>
      prev ? prev.filter((m) => m.id !== messageId) : prev,
    );
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setNewMessage("");
  }

  if (showAuth) {
    return <AuthPrompt onClose={() => router.back()} />;
  }

  return (
    <PageTransition>
      <PageHeader title="Xabarlar" />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 md:px-6 lg:px-8 pb-6">
         {(propertyId && property) || sellerIdParam || conversationPartnerId ? (
          <div className="flex flex-col flex-1 min-h-0 max-w-2xl mx-auto w-full">
            <div className="flex flex-col h-full min-h-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-3 px-5 py-5 border-b border-slate-200 text-center">
                <motion.button
                  whileHover={{ x: -2 }}
                  onClick={() => router.push("/messages")}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Barcha xabarlar
                </motion.button>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {property
                      ? property.title
                      : displaySeller
                        ? displaySeller.name
                        : "Sotuvchi bilan suhbat"}
                  </p>
                  {displaySeller && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sotuvchi: {displaySeller.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                  {chatMessages.length === 0 && (
                    <EmptyState
                      icon={<MessageSquare className="w-6 h-6 text-gray-300" />}
                      title="Hozircha xabar yo'q"
                      description="Birinchi xabarni yozing"
                    />
                  )}
                  {chatMessages.map((m) => (
                    <ChatMessage
                      key={m.id}
                      message={m}
                      isOwn={m.fromUserId === user?.id}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                    />
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="border-t border-slate-200 p-4">
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

                <ChatInput
                  value={newMessage}
                  onChange={setNewMessage}
                  onSend={handleSend}
                  placeholder={editingMessageId ? "Xabarni tahrirlash..." : undefined}
                />
              </div>
            </div>
          </div>
        ) : conversationPartnerId ? null : (
          <div className="space-y-2 pt-4">
            {myMessages.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-8 h-8 text-gray-300" />}
                title="Xabarlar yo'q"
                description="Biror elonga xabar yozing"
              />
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                  Barcha xabarlar
                </p>
                  {partnerConversations.map((conv, i) => {
                  const rawPartnerId =
                    conv.message.fromUserId === user?.id
                      ? conv.message.toUserId
                      : conv.message.fromUserId;
                  const partnerId = resolveUserId(rawPartnerId);
                  return (
                    <ConversationItem
                      key={partnerId}
                      message={conv.message}
                      propertyTitle={
                        conv.isGeneral
                          ? "Sotuvchi bilan suhbat"
                          : conv.propertyTitle || "Noma'lum elon"
                      }
                      sellerName={conv.sellerName || undefined}
                      unread={!conv.message.read}
                      onClick={() =>
                        router.push("/messages?sellerId=" + partnerId)
                      }
                      index={i}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}
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
