import ClassroomSelector from "@/components/ClassroomSelector/ClassroomSelector";

//TODO - maybe it would be nice to show the whole current route.
//Possible implmentatios:
//      A: get ids from params and fetch names from backend (costly)
//      B: Lift state from navBar into Classroom and pass it down to Breadcrumb (fewer API calls)

const Breadcrumb = ({ classrooms = [], onClassroomChange }) => {
	return (
		<ClassroomSelector
			classrooms={classrooms}
			onClassroomChange={onClassroomChange}
		/>
	);
};

export default Breadcrumb;
