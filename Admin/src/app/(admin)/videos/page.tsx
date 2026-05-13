"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";

import VideoForm from "@/components/videos/VideoForm";
import VideoTable, { Video } from "@/components/videos/VideoTable";
import VideoFilters from "@/components/videos/VideoFilters";

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

export default function VideosPage() {
  const locale = useLocale();
  const { data: session, status } = useSession();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [createOpen, setCreateOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (status === "loading" || !session?.accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (query.trim()) params.set("q", query.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      
      const res = await fetch(`${getBackendUrl()}/api/admin/videos?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` },
        signal
      });
      if (!res.ok) return;
      const data = await res.json();
      if (signal?.aborted) return;
      
      setVideos(data.items ?? []);
      setTotalCount(Number(data.total ?? data.items?.length ?? 0));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, pageSize, query, session?.accessToken, status]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function handleCreated() {
    setCreateOpen(false);
    setEditingVideo(null);
    if (page !== 1) {
      setPage(1);
    } else {
      load();
    }
  }

  function handleOpenCreate() {
    setEditingVideo(null);
    setCreateOpen(true);
  }

  async function handleDelete(id: string) {
    if (status === "loading" || !session?.accessToken || deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${getBackendUrl()}/api/admin/videos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }



  const currentLocale = locale || "en";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl sm:text-3xl text-primary font-semibold mb-4">Video Management</h1>
      </div>

      <ComponentCard title="Videos" desc="Manage embedded video content">
        <div className="mt-2">
          <div className="mb-4">
            <VideoFilters
              query={query}
              onSearch={setQuery}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              action={
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="h-10 px-5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md text-sm w-full sm:w-auto whitespace-nowrap"
                >
                  Create Video
                </button>
              }
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <VideoTable
              loading={loading}
              videos={videos}
              query={query}
              locale={currentLocale}
              onOpen={(v) => { setSelectedVideo(v); setViewOpen(true); }}
              onEdit={(v) => { setEditingVideo(v); setCreateOpen(true); }}
              onDelete={handleDelete}
              deletingId={deletingId}
              onCreate={handleOpenCreate}
              createLabel="Create Video"
              showInlineCreate={false}
            />
            {totalPages > 1 && !loading && (
              <div className="mt-4 flex justify-end">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </ComponentCard>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-3">
          {editingVideo ? "Edit Video" : "Create Video"}
        </h3>
        <VideoForm
          initialVideo={editingVideo}
          onSaved={handleCreated}
          onClose={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {selectedVideo && (
          <div>
            <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedVideo.category}
              {selectedVideo.publishAt ? ` • Published: ${new Date(selectedVideo.publishAt).toLocaleDateString()}` : ""}
              {` • Status: ${selectedVideo.status}`}
            </p>
            
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
              <iframe
                src={selectedVideo.embedUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Description</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedVideo.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
