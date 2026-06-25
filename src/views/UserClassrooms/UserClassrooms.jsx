import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { buildRoute } from "@/routes/routeConfig";

import { useClassrooms } from "@/domain/classrooms/hooks/useClassrooms";
import { selectUser } from "@/store/auth/authSlice";
import { House } from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import ClassroomSummaryCard from "@/components/ClassroomSummaryCard/ClassroomSummaryCard";
import JoinClassroomPanel from "./JoinClassroomPanel";

import styles from "./UserClassrooms.module.css";

const UserClassrooms = () => {
	const navigate = useNavigate();
	const atRoot = useMatch("/my/classrooms");
	const inClassroomChildRoute = useMatch("/my/classrooms/:id/*");
	const user = useSelector(selectUser);
	const userId = user?.id || user?.userId || user?.memberId;

	const {
		data: classrooms = [],
		isLoading: loading,
		error,
	} = useClassrooms(userId);

	if (error) return <p className={styles.error}>Unable to load classrooms.</p>;

	if (!inClassroomChildRoute && atRoot) {
		return (
			<>
				{loading && <LoadingSpinner />}
				<div className={styles.classrooms_container}>
					<div className={styles.title_row}>
						<div className={styles.title_container}>
							<House className={styles.title_icon} aria-hidden="true" />
							<h2 className={styles.classrooms_title}>My Classrooms</h2>
						</div>
						<JoinClassroomPanel
							userId={userId}
							onSuccess={(result) =>
								navigate(buildRoute.sectionPart(result.classroomId, 1, 1))
							}
						/>
					</div>

					{classrooms.length === 0 && !loading && (
						<div className={styles.emptyWrap}>
							<p className={styles.emptyState}>
								You’re not enrolled in any classrooms yet.
							</p>
						</div>
					)}
					<div className={styles.classrooms_layout}>
						<ul className={styles.classrooms_grid}>
							{classrooms.map((classroom) => (
								<ClassroomSummaryCard
									key={classroom.id}
									classroom={classroom}
									onOpenClassroom={(classroomId) =>
										navigate(`/my/classrooms/${classroomId}`)
									}
								/>
							))}
						</ul>
					</div>
				</div>
			</>
		);
	}

	return <Outlet context={{ classrooms }} />;
};

export default UserClassrooms;
