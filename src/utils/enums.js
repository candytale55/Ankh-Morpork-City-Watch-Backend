// Centralizes the allowed values shared by schemas and the frontend forms.

const speciesEnum = [
    'human',
    'dwarf',
    'troll',
    'vampire',
    'werewolf',
    'zombie',
    'golem',
    'gnome',
    'goblin',
    'elf',
    'gargoyle',
    'pictsie',
    'igor',
    'orangutan',
    'other'
];

const genderEnum = [
    'male',
    'female',
    'non-binary',
    'unknown'
];

const roleEnum = ['user', 'admin'];

const caseTypeEnum = ['case', 'patrol', 'report', 'incident'];

const caseStatusEnum = ['open', 'under investigation', 'closed'];

const casePriorityEnum = ['low', 'medium', 'high'];

module.exports = {
    speciesEnum,
    genderEnum,
    roleEnum,
    caseTypeEnum,
    caseStatusEnum,
    casePriorityEnum
};

