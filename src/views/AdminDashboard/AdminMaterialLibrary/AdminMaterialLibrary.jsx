import { useEffect, useMemo, useState } from "react";

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

import {
	getAllSpeakingSectionsSummaries,
	getDraftSpeakingSectionsSummaries,
} from "@/api/material/materialAPI";
import { AdminList } from "@/components/AdminList";
import { buildRoute } from "@/routes/routeConfig";

import styles from "./AdminMaterialLibrary.module.css";

const normalizeSummary = (summary, idx) => {
	const sectionId =
		summary?.sectionId || summary?.section?.id || summary?.section_id || null;
	const materialId =
		summary?.materialId ||
		summary?.material_id ||
		summary?.material?.materialId ||
		summary?.material?.id ||
		(summary?.id && !sectionId ? summary.id : null) ||
		null;

	if (!materialId) {
		return {
			id: `summary-${idx}`,
			materialId: null,
			sectionId: sectionId ? String(sectionId) : null,
			title: "Untitled section",
			sectionName: "Untitled section",
			part1Title: "",
			part2Title: "",
			description: "No metadata available",
			status: null,
			createdAt: null,
			updatedAt: null,
		};
	}

	const title =
		summary?.materialTitle ||
		summary?.title ||
		summary?.name ||
		summary?.description ||
		`Material ${materialId}`;
	const sectionName =
		summary?.sectionName ||
		summary?.sectionTitle ||
		summary?.name ||
		summary?.materialTitle ||
		title;

	return {
		id: String(materialId),
		materialId: String(materialId),
		sectionId: sectionId ? String(sectionId) : null,
		title,
		sectionName,
		part1Title: summary?.partTitle || summary?.part1Title || "",
		part2Title: summary?.part2Title || summary?.partTwoTitle || "",
		description: summary?.materialDescription || summary?.description || "",
		status: summary?.status ? String(summary.status).toLowerCase() : null,
		createdAt: summary?.createdAt || summary?.created_at || null,
		updatedAt: summary?.updatedAt || summary?.updated_at || null,
	};
};

const toSummaryList = (response) =>
	Array.isArray(response)
		? response
		: Array.isArray(response?.items)
			? response.items
			: Array.isArray(response?.content)
				? response.content
				: [];

const AdminMaterialLibrary = () => {
	const [publishedSections, setPublishedSections] = useState([]);
	const [draftSections, setDraftSections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentSort, setCurrentSort] = useState("updated-desc");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		let cancelled = false;

		const loadSections = async () => {
			setLoading(true);
			try {
				const [publishedResponse, draftsResponse] = await Promise.all([
					getAllSpeakingSectionsSummaries(),
					getDraftSpeakingSectionsSummaries(),
				]);
				if (cancelled) return;

				const publishedList = toSummaryList(publishedResponse)
					.map(normalizeSummary)
					.filter(Boolean);
				const draftsList = toSummaryList(draftsResponse)
					.map((item, idx) =>
						normalizeSummary(
							{
								...item,
								status: item?.status || "draft",
							},
							idx,
						),
					)
					.filter(Boolean);

				setPublishedSections(publishedList);
				setDraftSections(draftsList);
			} catch (error) {
				console.error("Failed to load speaking section summaries:", error);
				if (!cancelled) {
					setPublishedSections([]);
					setDraftSections([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		loadSections();

		return () => {
			cancelled = true;
		};
	}, []);

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
			item?.title,
			item?.sectionName,
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
					return b.title.localeCompare(a.title);
				case "title-asc":
				default:
					return a.title.localeCompare(b.title);
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
		const canEdit = !!item.materialId;
		const editLabel = item.status === "draft" ? "Continue" : "Edit";

		return (
			<div className={styles.row}>
				<div className={styles.meta}>
					<div className={styles.titleRow}>
						<p className={styles.title}>{item.title}</p>
						{item.status && (
							<span
								className={`${styles.statusBadge} ${
									item.status === "published"
										? styles.statusPublished
										: styles.statusDraft
								}`}
							>
								{item.status}
							</span>
						)}
					</div>
					<div className={styles.metaChips}>
						<span className={styles.metaChip}>
							Material #{item.materialId || "N/A"}
						</span>
						{item.sectionId && (
							<span className={styles.metaChip}>Section #{item.sectionId}</span>
						)}
						<span className={styles.metaChip}>Name: {item.sectionName}</span>
					</div>
					<p className={styles.partsLine}>
						Part 1: {item.part1Title || "N/A"} | Part 2:{" "}
						{item.part2Title || "N/A"}
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
					{item.description && (
						<p className={styles.description}>{item.description}</p>
					)}
				</div>

				{canEdit ? (
					<Link
						className={`action_button ${styles.editButton}`}
						to={buildRoute.editSpeakingMaterial(item.materialId)}
					>
						{editLabel}
					</Link>
				) : (
					<span className={styles.disabledEdit}>Unavailable</span>
				)}
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
