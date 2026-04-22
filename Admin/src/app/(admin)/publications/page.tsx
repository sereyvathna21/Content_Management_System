"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";
import PublicationFilters from "@/components/publications/PublicationFilters";
import PublicationTable, { Publication as PublicationType } from "@/components/publications/PublicationTable";
import PublicationForm from "@/components/publications/PublicationForm";
import { pickTranslation } from "@/lib/pickTranslation";

type ApiPublicationTranslation = {
	id: string;
	language: string;
	title: string;
	content?: string;
	attachmentUrl?: string;
};

type ApiPublication = {
	id: string;
	category?: string;
	publicationDate?: string;
	translations: ApiPublicationTranslation[];
};

function getBackendUrl() {
	return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

function resolveAttachmentUrl(attachmentUrl?: string) {
	if (!attachmentUrl) return null;
	if (/^https?:\/\//i.test(attachmentUrl)) return attachmentUrl;
	const backendUrl = getBackendUrl();
	return `${backendUrl}${attachmentUrl.startsWith("/") ? "" : "/"}${attachmentUrl}`;
}

export default function PublicationsPage() {
	const t = useTranslations();
	const locale = useLocale();
	const { data: session, status } = useSession();

	const [publications, setPublications] = useState<PublicationType[]>([]);
	const [loading, setLoading] = useState(false);
	const [totalCount, setTotalCount] = useState(0);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const [createOpen, setCreateOpen] = useState(false);
	const [editingPublication, setEditingPublication] = useState<PublicationType | null>(null);
	const [viewOpen, setViewOpen] = useState(false);
	const [selectedPublication, setSelectedPublication] = useState<PublicationType | null>(null);

	const load = useCallback(
		async (signal?: AbortSignal) => {
			if (status === "loading" || !session?.accessToken) return;
			setLoading(true);

			try {
				const params = new URLSearchParams({
					page: String(page),
					pageSize: String(pageSize),
				});

				if (query.trim()) params.set("q", query.trim());
				if (categoryFilter !== "all") params.set("category", categoryFilter);

				const res = await fetch(`${getBackendUrl()}/api/publications?${params.toString()}`, {
					headers: { Authorization: `Bearer ${session.accessToken}` },
					signal,
				});

				if (!res.ok) return;
				const data = (await res.json()) as { total?: number; items?: ApiPublication[] };
				if (signal?.aborted) return;

				const items = data.items ?? [];
				setPublications(
					items.map((item) => ({
						id: item.id,
						category: item.category,
						publicationDate: item.publicationDate,
						translations: (item.translations ?? []).map((translation) => ({
							id: translation.id,
							language: translation.language,
							title: translation.title,
							content: translation.content,
								attachmentUrl: translation.attachmentUrl,
								category: (translation as any).category,
						})),
					})),
				);
				setTotalCount(Number(data.total ?? items.length));
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") return;
				console.error(error);
			} finally {
				setLoading(false);
			}
		},
		[categoryFilter, page, pageSize, query, session?.accessToken, status],
	);

	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal);
		return () => controller.abort();
	}, [load]);

	useEffect(() => {
		setPage(1);
	}, [query, categoryFilter]);

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

	useEffect(() => {
		if (page > totalPages) setPage(totalPages);
	}, [page, totalPages]);

	const currentLocale = locale || "en";

	const categoryOptions = useMemo(() => {
		// Only show fixed tabs: All, NSPC, Others.
		// Any category other than 'NSPC' will be grouped under 'Others'.
		return [
			{ value: "all", label: t("PublicationsPage.filters.all") },
			{ value: "NSPC", label: t("PublicationsPage.filters.categories.nspc") },
			{ value: "Others", label: t("PublicationsPage.filters.categories.others") },
		];
	}, [t]);

	function handleOpenCreate() {
		setEditingPublication(null);
		setCreateOpen(true);
	}

	function handleCloseCreate() {
		setCreateOpen(false);
		setEditingPublication(null);
	}

	function handleSaved() {
		setCreateOpen(false);
		setEditingPublication(null);
		if (page !== 1) {
			setPage(1);
			return;
		}
		load();
	}

	async function handleDelete(id: string) {
		if (status === "loading" || !session?.accessToken || deletingId) return;
		setDeletingId(id);

		try {
			const res = await fetch(`${getBackendUrl()}/api/publications/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${session.accessToken}` },
			});

			if (!res.ok) throw new Error("Failed to delete publication");
			await load();
		} catch (error) {
			console.error(error);
		} finally {
			setDeletingId(null);
		}
	}

	const selectedTranslation = selectedPublication
		? pickTranslation(
				selectedPublication.translations.map((translation) => ({
					id: translation.id,
					language: translation.language,
					title: translation.title,
					pdfUrl: translation.attachmentUrl,
					category: (translation as any).category,
				})),
				currentLocale,
				`Publication #${selectedPublication.id}`,
			)
		: null;

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-start justify-between">
				<h1 className="text-3xl text-primary font-semibold mb-4">{t("PublicationsPage.title") || "Publications"}</h1>
			</div>

			<ComponentCard
				title={t("PublicationsPage.card.title") || "Publications"}
				desc={t("PublicationsPage.card.desc") || "Manage publications and translations"}
			>
				<div className="mt-2">
					<div className="mb-4">
						<PublicationFilters
							query={query}
							onSearch={(value) => {
								setQuery(value);
								setPage(1);
							}}
							category={categoryFilter}
							onCategoryChange={(value) => {
								setCategoryFilter(value);
								setPage(1);
							}}
							categories={categoryOptions}
							action={
								<button
									type="button"
									onClick={handleOpenCreate}
									className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm w-full sm:w-auto"
								>
									{t("PublicationsPage.create") || "New Publication"}
								</button>
							}
						/>
					</div>

					{loading ? (
						<div>{t("PublicationTable.loading")}</div>
					) : (
						<div className="grid grid-cols-1 gap-3">
							<PublicationTable
								loading={loading}
								publications={publications}
								query={query}
								locale={currentLocale}
								onOpen={(publication) => {
									setSelectedPublication(publication);
									setViewOpen(true);
								}}
								onEdit={(publication) => {
									setEditingPublication(publication);
									setCreateOpen(true);
								}}
								onDelete={handleDelete}
								deletingId={deletingId}
								onCreate={handleOpenCreate}
								createLabel={t("PublicationsPage.create") || "New Publication"}
								showInlineCreate={false}
							/>

							{totalPages > 1 && (
								<div className="mt-4 flex justify-end">
									<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
								</div>
							)}
						</div>
					)}
				</div>
			</ComponentCard>

			<Modal isOpen={createOpen} onClose={handleCloseCreate} className="max-w-4xl p-4">
				<h3 className="text-lg font-semibold mb-3">
					{editingPublication
						? t("PublicationsPage.edit") || "Edit Publication"
						: t("PublicationsPage.create") || "Create Publication"}
				</h3>

				<PublicationForm
					initialPublication={
						editingPublication
							? {
									id: editingPublication.id,
								category: editingPublication.category,
									publicationDate: editingPublication.publicationDate,
									translations: editingPublication.translations.map((translation) => ({
										language: translation.language,
										title: translation.title,
										content: translation.content,
									attachmentUrl: translation.attachmentUrl,
									category: (translation as any).category,
									})),
								}
							: null
					}
					onSaved={handleSaved}
					onClose={handleCloseCreate}
				/>
			</Modal>

			<Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="max-w-2xl p-6">
				{selectedPublication && selectedTranslation && (
					<div>
						<h3 className="text-lg font-semibold mb-2">{selectedTranslation.title}</h3>
						<p className="text-sm text-gray-600">
							{selectedTranslation?.category ?? selectedPublication.category ?? "-"}
							{selectedPublication.publicationDate ? ` • ${new Date(selectedPublication.publicationDate).toLocaleDateString(currentLocale === "km" ? "km-KH" : "en-US")}` : ""}
						</p>

						<div className="mt-3 space-y-2">
							{selectedPublication.translations.map((translation) => {
								const attachmentHref = resolveAttachmentUrl(translation.attachmentUrl);
								return (
									<div key={translation.language} className="p-3 border rounded-lg">
										<div className="font-medium">
											{translation.language.toUpperCase()} - {translation.title}
										</div>
										{translation.content && <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">{translation.content}</div>}
										{attachmentHref ? (
											<a className="inline-flex mt-2 text-sm text-blue-600 hover:underline" href={attachmentHref} target="_blank" rel="noreferrer">
												{t("PublicationsPage.viewAttachment") || "View Attachment"}
											</a>
										) : (
											<div className="text-sm text-gray-400 mt-2">{t("PublicationTable.noAttachment")}</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
}
