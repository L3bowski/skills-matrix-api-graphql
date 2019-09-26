let employees = require('./data/employees.json');
const employeesSkillsRepository = require('./employees-skills-repository');
// let nextEmployeeId = employees.length + 1;

// TODO All operations should return a copy of the object to reflect the database nature

// const add = ({ name }) => {
// 	const employee = { id: nextEmployeeId++, name };
// 	employees.push(employee);
// 	return Promise.resolve(employee);
// };

const countAll = (filter) => {
	return Promise.resolve(employees)
		.then(filterEmployees(filter))
		.then(filteredEmployees => filteredEmployees.length);
};

const filterEmployees = (filter) => (employees) => {
	if (filter && filter.name) {
		const nameFilter = filter.name.toLowerCase();
		employees = employees.filter(e => e.name.toLowerCase().indexOf(nameFilter) > -1);
	}
	return Promise.resolve(employees);
};

const getAll = (filter, skip = 0, first = 10, includeSkills = false, orderBy) => {
	return Promise.resolve([...employees])
	.then(filterEmployees(filter))
	.then(filteredEmployees => {
		if (orderBy) {
			if (orderBy.name) {
				filteredEmployees.sort(sortByName(orderBy.name));
			} else if (orderBy.skills) {
				return Promise.all(filteredEmployees.map(loadEmployeeSkills))
					.then(filteredEmployees => filteredEmployees.sort(sortBySkillsLength(orderBy.name)));
			}
		}

		if (includeSkills) {
			filteredEmployees = filteredEmployees.map(loadEmployeeSkills);
		}

		return filteredEmployees;
	})
	.then(filteredEmployees => {
		filteredEmployees = filteredEmployees.slice(skip, skip + first);
		return Promise.resolve(filteredEmployees);
	});
};

const getById = (id, includeSkills) => Promise.resolve(employees.find(e => e.id === id))
	.then(employee => includeSkills ? loadEmployeeSkills(employee) : employee);

const loadEmployeeSkills = employee => employeesSkillsRepository.getByEmployeeId(employee.id)
	.then(employeeSkills => {
		// TODO Resolve the cyclic dependencies problem
		const skillsRepository = require('./skills-repository');
		return Promise.all(employeeSkills.map(se => skillsRepository.getById(se.skillId)))
	})
	.then(skills => {
		employee.skills = skills;
		return employee;
	});

const sortBySkillsLength = (criteria) => (a, b) => {
	if (a.skills.length < b.skills.length) return -criteria;
	if (a.skills.length > b.skills.length) return criteria;
	return 0;
};

const sortByName = (criteria) => (a, b) => {
	if (a.name < b.name) return -criteria;
	if (a.name > b.name) return criteria;
	return 0;
};
	
// const remove = id => {
// 	employees = employees.filter(e => e.id !== id);
// 	return Promise.resolve();
// };

// const update = employeeData => {
// 	const employee = getById(employeeData.id);
// 	if (employee) {
// 		employee.name = employeeData.name;
// 	}
// 	return Promise.resolve(employee);
// };

module.exports = {
	// add,
	countAll,
	getAll,
	getById,
	// remove,
	// update
};
