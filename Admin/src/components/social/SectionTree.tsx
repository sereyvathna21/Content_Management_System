"use client";

import React from "react";
import { useLocale } from "next-intl";
import Tooltip from "@/components/ui/Tooltip";

export type TreeSection = {
    id: string;
    sectionKey: string;
    titleKm: string;
    titleEn?: string;
    sortOrder: number;
    depth: number;
    parentSectionId?: string;
};

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
    
    // Get title based on current locale
    const getTitle = (section: TreeSection) => {
        if (locale === "en" && section.titleEn) {
            return section.titleEn;
        }
        return section.titleKm || "Untitled Section";
    };
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Content Sections</h3>
                <button 
                  onClick={() => onAddSubSection(null)}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition"
                >
                  + Add Root Section
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {sections.length === 0 && (
                    <div className="text-sm text-gray-400 text-center py-6">
                        No sections yet. Add one to get started!
                    </div>
                )}
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
                           className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                               isActive 
                                 ? "bg-primary/5 border-primary shadow-sm" 
                                 : "bg-gray-50 border-gray-200 hover:bg-gray-100"
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

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => onMoveUp(s.id)}
                                    disabled={isFirst}
                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                                </button>
                                <button
                                    onClick={() => onMoveDown(s.id)}
                                    disabled={isLast}
                                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                </button>
                                
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                                <Tooltip label="Add Sub-section">
                                    <button 
                                        onClick={() => onAddSubSection(s.id)} 
                                        className="p-1 text-primary hover:text-primary/70"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                                    </button>
                                </Tooltip>
                                
                                <Tooltip label="Delete">
                                    <button 
                                        onClick={() => onDelete(s.id)} 
                                        className="p-1 text-red-400 hover:text-red-600 ml-1"
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
