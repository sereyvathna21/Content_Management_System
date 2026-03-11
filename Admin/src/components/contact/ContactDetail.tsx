"use client";
import React from "react";
import type { Contact } from "../../hooks/useContacts";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";

type Props = {
  contact: Contact;
  onClose: () => void;
  onMarkRead: () => void;
};

export default function ContactDetail({ contact, onClose, onMarkRead }: Props) {
  const t = useTranslations("ContactPage");

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl p-4" backdropClassName="fixed inset-0 h-full w-full bg-black/40 backdrop-blur-sm">
      <div className="w-full px-0">
       
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{contact.subject}</h2>
              <p className="text-sm text-gray-500">{t("from")} {contact.name} — {contact.email}</p>
            </div>
            <div className="text-sm text-gray-500">{new Date(contact.createdAt).toLocaleString()}</div>
          </div>

          <div className="whitespace-pre-wrap mb-4 text-gray-800 dark:text-white/90">{contact.message}</div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 w-full">
            <a className="text-sm text-blue-light-500 hover:underline w-full sm:w-auto text-center" href={`mailto:${contact.email}`}>
              {t("replyViaEmail")}
            </a>
            <button
              className="h-9 px-4 rounded-lg font-medium text-primary bg-primary/10 hover:bg-primary/20 text-sm w-full sm:w-auto"
              onClick={onMarkRead}
            >
              {contact.read ? t("markUnread") : t("markRead")}
            </button>
            <button className="h-9 px-4 rounded-lg font-medium text-shadow-black bg-white border border-primary hover:bg-primary hover:text-white text-sm w-full sm:w-auto" onClick={onClose}>
              {t("close")}
            </button>
          </div>
        </div>
      
    </Modal>
  );
}
