"use client";
import React, { useState } from "react";
import type { Contact } from "../../hooks/useContacts";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";

type Props = {
  contact: Contact;
  onClose: () => void;
  onMarkRead: () => void;
  onReply: (id: string, subject: string, message: string) => Promise<void>;
};

export default function ContactDetail({ contact, onClose, onMarkRead, onReply }: Props) {
  const t = useTranslations("ContactPage");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const openReply = () => {
    setReplySubject(contact.subject ? `Re: ${contact.subject}` : "Re:");
    setReplyMessage("");
    setReplyError(null);
    setIsReplyOpen(true);
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) {
      setReplyError(t("replyMessageRequired"));
      return;
    }

    setReplying(true);
    setReplyError(null);
    try {
      await onReply(contact.id, replySubject.trim(), replyMessage.trim());
      setIsReplyOpen(false);
    } catch {
      setReplyError(t("replySendError"));
    } finally {
      setReplying(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl p-4" backdropClassName="fixed inset-0 h-full w-full bg-black/40 backdrop-blur-sm">
      <div className="w-full px-0">
       
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{contact.subject}</h2>
                {contact.replied && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">
                    {t("replied")}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{t("from")} {contact.name} — {contact.email}</p>
              {contact.repliedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  {t("repliedOn")} {new Date(contact.repliedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">{new Date(contact.createdAt).toLocaleString()}</div>
          </div>

          <div className="whitespace-pre-wrap mb-4 text-gray-800 dark:text-white/90">{contact.message}</div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 w-full">
            
            <button
              className="text-sm text-blue-light-500 hover:underline w-full sm:w-auto text-center"
              onClick={openReply}
            >
              {t("reply")}
            </button>
            <button
              className="h-9 px-4 rounded-lg font-medium text-primary bg-primary/10 hover:bg-primary/20 text-sm w-full sm:w-auto"
              onClick={onMarkRead}
            >
              {contact.read ? t("markUnread") : t("markRead")}
            </button>
            <button className="h-9 px-4 rounded-lg font-medium text-primary bg-white border border-primary hover:bg-primary hover:text-white text-sm w-full sm:w-auto" onClick={onClose}>
              {t("close")}
            </button>
          </div>
        </div>
      
      <Modal isOpen={isReplyOpen} onClose={() => setIsReplyOpen(false)} className="max-w-3xl p-0 overflow-hidden">
        <div className="bg-white">
          <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t("replyTitle")}</h3>
              <p className="mt-1 text-xs text-gray-500">{t("replyNote")}</p>
            </div>
            <div className="text-xs text-gray-400">{new Date(contact.createdAt).toLocaleString()}</div>
          </div>

          <div className="px-5 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-14 text-gray-400">{t("replyTo")}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                    {contact.name}
                  </span>
                  <span className="text-gray-500">{contact.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-14 text-gray-400">{t("replyFrom")}</span>
                <span className="font-medium text-gray-800">{t("replyFromValue")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-14 text-gray-400">{t("replySubject")}</span>
                <input
                  className="h-9 w-full flex-1 border-b border-gray-200 bg-transparent px-1 text-gray-800 placeholder:text-gray-400 focus:border-primary focus:outline-none"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder={t("replySubjectPlaceholder")}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">{t("replyMessage")}</label>
              <div className="rounded-lg border border-gray-100 bg-gray-50">
                <textarea
                  className="w-full min-h-[200px] resize-y bg-transparent px-3 py-3 text-sm text-gray-800 focus:outline-none"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={t("replyMessagePlaceholder")}
                />
                <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                  <span>{t("replyMessageHelp")}</span>
                  <span>{replyMessage.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-gray-100 bg-white px-3 py-3">
              <div className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{contact.name}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span>{new Date(contact.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{contact.message}</div>
            </div>

            {replyError && (
              <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {replyError}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="text-primary h-9 px-4 rounded-lg font-medium bg-white border border-primary" onClick={() => setIsReplyOpen(false)}>
                {t("cancel")}
              </button>
              <button
                className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60"
                onClick={sendReply}
                disabled={replying || !replyMessage.trim()}
              >
                {replying ? t("replySending") : t("replySend")}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
