import { useMemo, useState } from "react";

const formatDate = (value) => {
	if (!value) return null;
	try {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(value));
	} catch {
		return String(value);
	}
};
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import { useAllSpeakingSections } from "@/domain/materials/hooks/useAllSpeakingSections";
import { useDraftSpeakingSections } from "@/domain/materials/hooks/useDraftSpeakingSections";
import { useDeleteSpeakingSection } from "@/domain/materials/hooks/useDeleteSpeakingSection";
import { AdminList } from "@/components/AdminList";
import { buildRoute } from "@/app/routes/routeConfig";

import styles from "./AdminMaterialLibrary.module.css";

const AdminMaterialLibrary = () => {
	const { data: allSections = [], isLoading: isLoadingAll } =
		useAllSpeakingSections();
	const { data: draftsFromEndpoint = [], isLoading: isLoadingDrafts } =
		useDraftSpeakingSections();
	const deleteMutation = useDeleteSpeakingSection();

	const loading = isLoadingAll || isLoadingDrafts;

	// Derive published/draft from the "all" endpoint (which returns both statuses),
	// and merge any additional drafts from the dedicated drafts endpoint (deduped).
	const publishedSections = useMemo(
		() => allSections.filter((s) => s.status === "PUBLISHED"),
		[allSections],
	);
	const draftSections = useMemo(() => {
		const fromAll = allSections.filter((s) => s.status === "DRAFT");
		const seen = new Set(fromAll.map((d) => d.materialId));
		const extra = draftsFromEndpoint.filter((d) => !seen.has(d.materialId));
		return [...fromAll, ...extra];
	}, [allSections, draftsFromEndpoint]);

	const [currentSort, setCurrentSort] = useState("updated-desc");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const handleDelete = (item) => {
		if (
			!window.confirm(
				`Delete material ${item.materialId}? This cannot be undone.`,
			)
		)
			return;

		deleteMutation.mutate(item.materialId, {
			onError: (error) => {
				alert(
					"Failed to delete material: " +
						(error?.response?.data?.message || error.message),
				);
			},
		});
	};

	const sortOptions = [
		{ key: "updated-desc", label: "Last Updated (Newest)" },
		{ key: "created-desc", label: "Created (Newest)" },
		{ key: "title-asc", label: "Title A-Z" },
		{ key: "title-desc", label: "Title Z-A" },
	];

	const normalizedSearch = searchQuery.trim().toLowerCase();

	const matchesSearch = (item) => {
		if (!normalizedSearch) return true;
		const haystack = [
			item?.sectionTitle,
			item?.description,
			item?.part1Title,
			item?.part2Title,
			item?.materialId,
			item?.sectionId,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
		return haystack.includes(normalizedSearch);
	};

	const sortSections = (items) => {
		const next = [...items];
		const toTime = (value) => {
			if (!value) return 0;
			const time = new Date(value).getTime();
			return Number.isFinite(time) ? time : 0;
		};

		next.sort((a, b) => {
			switch (currentSort) {
				case "updated-desc":
					return (
						toTime(b.updatedAt || b.createdAt) -
						toTime(a.updatedAt || a.createdAt)
					);
				case "created-desc":
					return toTime(b.createdAt) - toTime(a.createdAt);
				case "title-desc":
					return String(b.sectionTitle || "").localeCompare(
						String(a.sectionTitle || ""),
					);
				case "title-asc":
				default:
					return String(a.sectionTitle || "").localeCompare(
						String(b.sectionTitle || ""),
					);
			}
		});
		return next;
	};

	const sortedPublishedSections = useMemo(
		() => sortSections(publishedSections.filter(matchesSearch)),
		[currentSort, publishedSections, normalizedSearch],
	);

	const sortedDraftSections = useMemo(
		() => sortSections(draftSections.filter(matchesSearch)),
		[currentSort, draftSections, normalizedSearch],
	);

	const latestUpdateDate = useMemo(() => {
		const timestamps = [...publishedSections, ...draftSections]
			.map((item) => item?.updatedAt || item?.createdAt)
			.filter(Boolean)
			.map((value) => new Date(value).getTime())
			.filter((value) => Number.isFinite(value));
		if (timestamps.length === 0) return null;
		return new Date(Math.max(...timestamps));
	}, [publishedSections, draftSections]);

	const totalVisibleCount =
		sortedPublishedSections.length + sortedDraftSections.length;
	const showPublished = statusFilter === "all" || statusFilter === "published";
	const showDrafts = statusFilter === "all" || statusFilter === "draft";

	const renderItem = (item) => {
		const statusKey = item.status.toLowerCase();
		const editLabel = statusKey === "draft" ? "Continue" : "Edit";
		const isDeleting =
			deleteMutation.isPending && deleteMutation.variables === item.materialId;

		return (
			<div className={styles.row}>
				<div className={styles.meta}>
					<div className={styles.titleRow}>
						<p className={styles.title}>{item.sectionTitle}</p>
						{item.status && (
							<span
								className={`${styles.statusBadge} ${
									statusKey === "published"
										? styles.statusPublished
										: styles.statusDraft
								}`}
							>
								{item.status}
							</span>
						)}
					</div>
					<p className={styles.partsLine}>
						Part 1: {item.part1Title} | Part 2: {item.part2Title}
					</p>
					{(item.createdAt || item.updatedAt) && (
						<p className={styles.timestamps}>
							{item.createdAt && (
								<span>Created: {formatDate(item.createdAt)}</span>
							)}
							{item.updatedAt && (
								<span>Updated: {formatDate(item.updatedAt)}</span>
							)}
						</p>
					)}
				</div>

				<div className={styles.actionsCol}>
					<Link
						className={`action_button ${styles.editButton}`}
						to={buildRoute.editSpeakingMaterial(item.materialId)}
					>
						<Pencil size={16} aria-hidden="true" /> {editLabel}
					</Link>
					<button
						type="button"
						className={`action_button ${styles.deleteButton}`}
						onClick={() => handleDelete(item)}
						disabled={isDeleting}
					>
						<Trash2 size={16} aria-hidden="true" />
						{isDeleting ? " Deleting..." : " Delete"}
					</button>
				</div>
			</div>
		);
	};

	return (
		<section className={styles.container}>
			<header className={styles.hero}>
				<div>
					<h3 className={styles.heading}>TOEFL Speaking Materials</h3>
					<p className={styles.subheading}>
						Track drafting progress and continue unfinished sections quickly.
					</p>
				</div>
				<div className={styles.summaryGrid}>
					<div className={styles.summaryCard}>
						<p className={styles.summaryLabel}>Drafts</p>
						<p className={styles.summaryValue}>{draftSections.length}</p>
					</div>
					<div className={styles.summaryCard}>
						<p className={styles.summaryLabel}>Published</p>
						<p className={styles.summaryValue}>{publishedSections.length}</p>
					</div>
					<div className={styles.summaryCard}>
						<p className={styles.summaryLabel}>Last Activity</p>
						<p className={styles.summaryValueSmall}>
							{latestUpdateDate ? formatDate(latestUpdateDate) : "No activity"}
						</p>
					</div>
				</div>
			</header>

			<div className={styles.controlsBar}>
				<input
					type="search"
					className={styles.searchInput}
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					placeholder="Search title, section, description, or ID"
				/>
				<div className={styles.controlGroup}>
					<div className={styles.segmentedControl}>
						<button
							type="button"
							className={`${styles.segmentButton} ${
								statusFilter === "all" ? styles.segmentButtonActive : ""
							}`}
							onClick={() => setStatusFilter("all")}
						>
							All ({totalVisibleCount})
						</button>
						<button
							type="button"
							className={`${styles.segmentButton} ${
								statusFilter === "draft" ? styles.segmentButtonActive : ""
							}`}
							onClick={() => setStatusFilter("draft")}
						>
							Drafts ({sortedDraftSections.length})
						</button>
						<button
							type="button"
							className={`${styles.segmentButton} ${
								statusFilter === "published" ? styles.segmentButtonActive : ""
							}`}
							onClick={() => setStatusFilter("published")}
						>
							Published ({sortedPublishedSections.length})
						</button>
					</div>
					<label className={styles.sortLabel}>
						Sort
						<select
							value={currentSort}
							onChange={(event) => setCurrentSort(event.target.value)}
							className={styles.sortSelect}
						>
							{sortOptions.map((option) => (
								<option key={option.key} value={option.key}>
									{option.label}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>

			{!loading && totalVisibleCount === 0 ? (
				<div className={styles.emptySearchState}>
					No materials matched your current search/filter.
				</div>
			) : (
				<>
					{showDrafts && (
						<div className={styles.sectionBlock}>
							<h4 className={styles.sectionHeading}>
								Drafts In Progress
								<span className={styles.countBadge}>
									{sortedDraftSections.length}
								</span>
							</h4>
							<div className={styles.listCard}>
								<AdminList
									items={sortedDraftSections}
									loading={loading}
									renderItem={renderItem}
									emptyMessage="No draft speaking sections found."
									loadingMessage="Loading speaking sections..."
									isActionable={false}
								/>
							</div>
						</div>
					)}

					{showPublished && (
						<div className={styles.sectionBlock}>
							<h4 className={styles.sectionHeading}>
								Published
								<span className={styles.countBadge}>
									{sortedPublishedSections.length}
								</span>
							</h4>
							<div className={styles.listCard}>
								<AdminList
									items={sortedPublishedSections}
									loading={loading}
									renderItem={renderItem}
									emptyMessage="No published speaking sections found."
									loadingMessage="Loading speaking sections..."
									isActionable={false}
								/>
							</div>
						</div>
					)}
				</>
			)}
		</section>
	);
};

export default AdminMaterialLibrary;
