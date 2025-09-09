export const personSortOptions = [
	{ key: "name-asc", label: "First Name A-Z" },
	{ key: "name-desc", label: "First Name Z-A" },
	{ key: "surname-asc", label: "Surname A-Z" },
	{ key: "surname-desc", label: "Surname Z-A" },
	{ key: "email-asc", label: "Email A-Z" },
	{ key: "email-desc", label: "Email Z-A" },
];

export function sortPeople(people, sortKey) {
	return [...people].sort((a, b) => {
		switch (sortKey) {
			case "name-asc":
				return (a.name || "").localeCompare(b.name || "");
			case "name-desc":
				return (b.name || "").localeCompare(a.name || "");
			case "surname-asc": {
				const surnameA = (a.name || "").split(" ").pop() || "";
				const surnameB = (b.name || "").split(" ").pop() || "";
				return surnameA.localeCompare(surnameB);
			}
			case "surname-desc": {
				const surnameA = (a.name || "").split(" ").pop() || "";
				const surnameB = (b.name || "").split(" ").pop() || "";
				return surnameB.localeCompare(surnameA);
			}
			case "email-asc":
				return (a.email || "").localeCompare(b.email || "");
			case "email-desc":
				return (b.email || "").localeCompare(a.email || "");
			default:
				return 0;
		}
	});
}
