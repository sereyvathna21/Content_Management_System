"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import Tooltip from "@/components/ui/Tooltip";

import { TreeSection } from "../../types/social.types";

type Props = {
    sections: TreeSection[];
    activeSectionId: string | null;
    onSelect: (id: string | null) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    onDelete: (id: string) => void;
    onAddSubSection: (parentId: string | null) => void;
};

export default function SectionTree({
    sections,
    activeSectionId,
    onSelect,
    onMoveUp,
    onMoveDown,
    onDelete,
    onAddSubSection
}: Props) {
    const locale = useLocale();
    const t = useTranslations("SocialEditor");
    
    // Get title based on current locale
    const getTitle = (section: TreeSection) => {
        if (locale === "en" && section.titleEn) {
            return section.titleEn;
        }
        return section.titleKm || (t("sectionTree.untitled") || "Untitled Section");
    };
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full flex flex-col overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 overflow-visible relative z-0 pointer-events-auto">
                <div>
                    <h3 className="font-semibold text-gray-800">{t("sectionTree.title") || "Content Sections"}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{t("sectionTree.helper") || "Select a section to edit"}</p>
                </div>
                <button 
                  onClick={() => onAddSubSection(null)}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition"
                >
                    {t("sectionTree.addRoot") || "+ Add Root Section"}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 relative z-50">
                {sections.map((s) => {
                    const isActive = s.id === activeSectionId;
                    // Check first/last among siblings (same parentSectionId) for correct disable state
                    const siblings = sections
                        .filter(sib => (sib.parentSectionId ?? null) === (s.parentSectionId ?? null))
                        .sort((a, b) => a.sortOrder - b.sortOrder);
                    const siblingIndex = siblings.findIndex(sib => sib.id === s.id);
                    const isFirst = siblingIndex === 0;
                    const isLast = siblingIndex === siblings.length - 1;

                    return (
                                <div 
                                        key={s.id} 
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-pointer overflow-visible ${
                                         isActive 
                                            ? "bg-primary/5 border-primary shadow-sm" 
                                            : "bg-gray-50 border-gray-200 hover:bg-gray-100/60"
                                    }`}
                           style={{ marginLeft: `${s.depth * 1.5}rem` }}
                           onClick={() => onSelect(s.id)}
                        >
                            <div className="flex flex-col min-w-0 pr-4">
                                <span className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-gray-800"}`}>
                                    {getTitle(s)}
                                </span>
                                <span className="text-xs text-gray-400 truncate font-mono">
                                    {s.sectionKey}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-100 sm:opacity-80 sm:hover:opacity-100 transition-opacity relative z-50" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => onMoveUp(s.id)}
                                    disabled={isFirst}
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-white/70 text-gray-500 shadow-sm ring-1 ring-gray-200 hover:bg-white hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-40 disabled:hover:text-gray-500"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                                </button>
                                <button
                                    onClick={() => onMoveDown(s.id)}
                                    disabled={isLast}
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-white/70 text-gray-500 shadow-sm ring-1 ring-gray-200 hover:bg-white hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-40 disabled:hover:text-gray-500"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                </button>
                                
                                <div className="w-px h-4 bg-gray-200 mx-2"></div>

                                <Tooltip label={t("sectionTree.addSub") || "Add Sub-section"}>
                                    <button 
                                        onClick={() => onAddSubSection(s.id)} 
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/15 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                                    </button>
                                </Tooltip>
                                
                                <Tooltip label={t("sectionTree.delete") || "Delete"}>
                                    <button 
                                        onClick={() => onDelete(s.id)} 
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-50 text-red-500 ring-1 ring-red-200 hover:bg-red-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 ml-2"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m4 0V4a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
