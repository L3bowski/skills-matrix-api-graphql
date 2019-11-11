const {
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} = require('graphql');
const definePagedListType = require('./paged-list');

const skillType = new GraphQLObjectType({
    name: 'Skill',
    fields: () => {
        const { employeeType } = require('./employee');
        return {
            employees: {
                type: definePagedListType(employeeType, 'SkillEmployeesPagedList'),
                args: {
                    filter: { type: skillEmployeeFilterType },
                    first: { type: GraphQLInt },
                    skip: { type: GraphQLInt },
                    orderBy: { type: skillEmployeeOrderByType }
                },
                resolve: (object, args, context) => {
                    context.ensurePermission(context.user, 'skills:read');
                    return context.skills.getSkillEmployees(
                        object.id,
                        args.filter,
                        args.skip,
                        args.first,
                        args.orderBy
                    );
                }
            },
            id: {
                type: GraphQLInt
            },
            name: {
                type: new GraphQLNonNull(GraphQLString)
            }
        };
    }
});

const skillFilterType = new GraphQLInputObjectType({
    name: 'SkillFilter',
    fields: {
        id: {
            type: GraphQLInt
        },
        name: {
            type: GraphQLString
        }
    }
});

const skillEmployeeFilterType = new GraphQLInputObjectType({
    name: 'SkillEmployeeFilter',
    fields: {
        name: {
            type: GraphQLString
        }
    }
});

const skillOrderByType = new GraphQLInputObjectType({
    name: 'SkillOrderBy',
    fields: {
        employees: {
            type: GraphQLInt
        },
        name: {
            type: GraphQLInt
        }
    }
});

const skillEmployeeOrderByType = new GraphQLInputObjectType({
    name: 'SkillEmployeeOrderBy',
    fields: {
        name: {
            type: GraphQLInt
        }
    }
});

const skillQueryField = {
    type: definePagedListType(skillType),
    description: 'Returns the available skills',
    args: {
        filter: { type: skillFilterType },
        first: { type: GraphQLInt },
        skip: { type: GraphQLInt },
        orderBy: { type: skillOrderByType }
    },
    resolve: (object, args, context) => {
        if (args.filter && args.filter.id) {
            context.ensurePermission(context.user, 'skills:read');
            return context.skills.getById(args.filter.id).then(skill => ({
                items: [skill],
                totalCount: 1
            }));
        } else {
            context.ensurePermission(context.user, 'skills:read');
            return context.skills.getAll(args.skip, args.first, args.filter, args.orderBy);
        }
    }
};

const addSkillInputType = new GraphQLInputObjectType({
    name: 'AddSkillInput',
    fields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        employeesId: { type: new GraphQLList(GraphQLInt) }
    }
});

const addSkill = {
    type: skillType,
    description: 'Creates a new skill with the given name and employees',
    args: {
        input: { type: addSkillInputType }
    },
    resolve: function(object, args, context) {
        context.ensurePermission(context.user, 'skills:create');
        return context.skills.create(args.input);
    }
};

const removeSkill = {
    type: skillType,
    description: 'Removes the skill identified by the input id',
    args: {
        input: { type: new GraphQLNonNull(GraphQLInt) }
    },
    resolve: function(object, args, context) {
        context.ensurePermission(context.user, 'skills:delete');
        return context.skills.remove(args.input);
    }
};

const updateSkillInputType = new GraphQLInputObjectType({
    name: 'updateSkillInput',
    fields: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLString },
        employeesId: { type: new GraphQLList(GraphQLInt) }
    }
});

const updateSkill = {
    type: skillType,
    description: 'Updates the name and employees of the skill identified by id',
    args: {
        input: { type: updateSkillInputType }
    },
    resolve: function(object, args, context) {
        context.ensurePermission(context.user, 'skills:update');
        return context.skills.update(args.input);
    }
};

module.exports = {
    skillMutations: {
        add: addSkill,
        remove: removeSkill,
        update: updateSkill
    },
    skillQueryField,
    skillType
};