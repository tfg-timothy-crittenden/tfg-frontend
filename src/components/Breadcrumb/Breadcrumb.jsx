import ClassroomSelector from "@/components/ClassroomSelector/ClassroomSelector";

const Breadcrumb = ({ classrooms = [], onClassroomChange }) => {
	return (
		<ClassroomSelector
			classrooms={classrooms}
			onClassroomChange={onClassroomChange}
		/>
	);
};

export default Breadcrumb;
