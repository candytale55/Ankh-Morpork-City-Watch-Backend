const API_BASE = '/api/v1';

const enums = {
    species: ['human', 'dwarf', 'troll', 'vampire', 'werewolf', 'zombie', 'golem', 'gnome', 'goblin', 'elf', 'gargoyle', 'pictsie', 'igor', 'orangutan', 'other'],
    gender: ['male', 'female', 'non-binary', 'unknown'],
    roles: ['user', 'admin'],
    caseTypes: ['case', 'patrol', 'report', 'incident'],
    caseStatuses: ['open', 'under investigation', 'closed'],
    casePriorities: ['low', 'medium', 'high']
};

const state = {
    token: localStorage.getItem('cityWatchToken') || '',
    currentUser: null,
    activeView: 'agents',
    search: '',
    agents: [],
    cases: [],
    users: []
};

const elements = {
    sessionStatus: document.querySelector('#sessionStatus'),
    logoutButton: document.querySelector('#logoutButton'),
    messageBox: document.querySelector('#messageBox'),
    loginForm: document.querySelector('#loginForm'),
    registerForm: document.querySelector('#registerForm'),
    agentForm: document.querySelector('#agentForm'),
    caseForm: document.querySelector('#caseForm'),
    caseFormTitle: document.querySelector('#caseFormTitle'),
    clearCaseFormButton: document.querySelector('#clearCaseFormButton'),
    assignForm: document.querySelector('#assignForm'),
    globalSearch: document.querySelector('#globalSearch'),
    refreshButton: document.querySelector('#refreshButton'),
    tabButtons: document.querySelectorAll('.tab-button'),
    viewSections: document.querySelectorAll('.view-section'),
    agentsList: document.querySelector('#agentsList'),
    casesList: document.querySelector('#casesList'),
    usersList: document.querySelector('#usersList')
};

function setMessage(message, type = 'info') {
    elements.messageBox.textContent = message;
    elements.messageBox.className = `message-box ${type}`;
}

function getErrorMessage(error) {
    if (typeof error === 'string') {
        return error;
    }

    if (error && error.message) {
        return error.message;
    }

    return 'Unexpected error';
}

async function apiRequest(path, options = {}) {
    const headers = {};

    if (state.token && options.auth !== false) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
        throw new Error(getErrorMessage(data));
    }

    return data;
}

function fillSelect(select, values, placeholder = '') {
    select.innerHTML = '';

    if (placeholder) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = placeholder;
        select.appendChild(option);
    }

    values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function setupEnumSelects() {
    fillSelect(elements.agentForm.elements.gender, enums.gender, 'Select gender');
    fillSelect(elements.agentForm.elements.species, enums.species, 'Select species');
    fillSelect(elements.caseForm.elements.type, enums.caseTypes);
    fillSelect(elements.caseForm.elements.status, enums.caseStatuses);
    fillSelect(elements.caseForm.elements.priority, enums.casePriorities);
    fillSelect(elements.caseForm.elements.suspectSpecies, enums.species, 'Unknown');
}

function updateSessionUi() {
    if (state.currentUser) {
        elements.sessionStatus.textContent = `${state.currentUser.name || state.currentUser.email} - ${state.currentUser.role}`;
    } else if (state.token) {
        elements.sessionStatus.textContent = 'Token saved. Refreshing session...';
    } else {
        elements.sessionStatus.textContent = 'Not logged in';
    }
}

function setActiveView(viewName) {
    state.activeView = viewName;

    elements.tabButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.view === viewName);
    });

    elements.viewSections.forEach((section) => {
        section.classList.toggle('active-view', section.id === `${viewName}View`);
    });

    renderActiveView();
}

function textMatches(item, query) {
    return JSON.stringify(item).toLowerCase().includes(query.toLowerCase());
}

function getFilteredItems(items) {
    if (!state.search) {
        return items;
    }

    return items.filter((item) => textMatches(item, state.search));
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getIdListLabel(ids = []) {
    if (!ids.length) {
        return 'None';
    }

    return ids.map((item) => item.name || item.title || item._id || item).join(', ');
}

function renderAgents() {
    const agents = getFilteredItems(state.agents);

    if (!agents.length) {
        elements.agentsList.innerHTML = '<div class="empty-state">No agents found.</div>';
        return;
    }

    elements.agentsList.innerHTML = agents.map((agent) => `
        <article class="agent-card">
            <img src="${escapeHtml(agent.image)}" alt="${escapeHtml(agent.name)} portrait">
            <div class="card-body">
                <h3>${escapeHtml(agent.name)}</h3>
                <p class="meta-line">${escapeHtml(agent.title)}</p>
                <p class="meta-line">${escapeHtml(agent.organization)}</p>
                <div class="badge-row">
                    <span class="badge">${escapeHtml(agent.species)}</span>
                    <span class="badge">${escapeHtml(agent.gender)}</span>
                </div>
            </div>
        </article>
    `).join('');
}

function renderCases() {
    const cases = getFilteredItems(state.cases);

    if (!state.token) {
        elements.casesList.innerHTML = '<div class="empty-state">Login to load cases.</div>';
        return;
    }

    if (!cases.length) {
        elements.casesList.innerHTML = '<div class="empty-state">No cases found.</div>';
        return;
    }

    elements.casesList.innerHTML = cases.map((caseItem) => `
        <article class="case-card">
            <h3>${escapeHtml(caseItem.title)}</h3>
            <div class="badge-row">
                <span class="badge">${escapeHtml(caseItem.type)}</span>
                <span class="badge">${escapeHtml(caseItem.status)}</span>
                <span class="badge">${escapeHtml(caseItem.priority)}</span>
            </div>
            <p class="case-description">${escapeHtml(caseItem.description)}</p>
            <p class="meta-line"><strong>Location:</strong> ${escapeHtml(caseItem.location)}</p>
            <p class="meta-line"><strong>Reported by:</strong> ${escapeHtml(caseItem.reportedBy || 'Not set')}</p>
            <p class="meta-line"><strong>Suspect:</strong> ${escapeHtml(caseItem.suspectName || 'Unknown')} (${escapeHtml(caseItem.suspectSpecies || 'unknown')})</p>
            <p class="meta-line"><strong>Assigned users:</strong> ${escapeHtml(getIdListLabel(caseItem.assignedTo))}</p>
            <p class="meta-line"><strong>Assigned agents:</strong> ${escapeHtml(getIdListLabel(caseItem.assignedAgents))}</p>
            <div class="case-actions">
                <button type="button" data-action="edit-case" data-id="${caseItem._id}">Edit</button>
                <button class="danger-button" type="button" data-action="delete-case" data-id="${caseItem._id}">Delete</button>
            </div>
        </article>
    `).join('');
}

function renderUsers() {
    if (!state.token) {
        elements.usersList.innerHTML = '<div class="empty-state">Login as admin to load users.</div>';
        return;
    }

    const users = getFilteredItems(state.users);

    if (!users.length) {
        elements.usersList.innerHTML = '<div class="empty-state">No users loaded. Admin token required.</div>';
        return;
    }

    elements.usersList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Assigned cases</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map((user) => `
                    <tr>
                        <td>
                            <div class="user-profile-cell">
                                <img src="${escapeHtml(user.image)}" alt="${escapeHtml(user.name)} profile image">
                                <div>
                                    <strong>${escapeHtml(user.name)}</strong>
                                    <span>${escapeHtml(user.email)}</span>
                                </div>
                            </div>
                        </td>
                        <td><span class="badge">${escapeHtml(user.role)}</span></td>
                        <td>${escapeHtml(getIdListLabel(user.assignedCases))}</td>
                        <td>
                            <div class="inline-controls">
                                <select data-role-select="${user._id}">
                                    ${enums.roles.map((role) => `<option value="${role}" ${role === user.role ? 'selected' : ''}>${role}</option>`).join('')}
                                </select>
                                <button type="button" data-action="update-role" data-id="${user._id}">Save</button>
                                <button class="danger-button" type="button" data-action="delete-user" data-id="${user._id}">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderAssignOptions() {
    const caseOptions = state.cases.map((caseItem) => `<option value="${caseItem._id}">${escapeHtml(caseItem.title)}</option>`).join('');
    const userOptions = state.users.map((user) => `<option value="${user._id}">${escapeHtml(user.name || user.email)} (${escapeHtml(user.role)})</option>`).join('');

    elements.assignForm.elements.caseId.innerHTML = caseOptions || '<option value="">No cases loaded</option>';
    elements.assignForm.elements.userId.innerHTML = userOptions || '<option value="">No users loaded</option>';
}

function renderActiveView() {
    if (state.activeView === 'agents') {
        renderAgents();
    }

    if (state.activeView === 'cases') {
        renderCases();
    }

    if (state.activeView === 'users') {
        renderUsers();
    }

    renderAssignOptions();
}

async function loadCurrentUser() {
    if (!state.token) {
        state.currentUser = null;
        updateSessionUi();
        return;
    }

    try {
        state.currentUser = await apiRequest('/users/me');
    } catch (error) {
        state.currentUser = null;
        state.token = '';
        localStorage.removeItem('cityWatchToken');
        setMessage(`Session expired: ${error.message}`, 'error');
    }

    updateSessionUi();
}

async function loadAgents() {
    state.agents = await apiRequest('/agents', { auth: false });
}

async function loadCases() {
    if (!state.token) {
        state.cases = [];
        return;
    }

    state.cases = await apiRequest('/cases');
}

async function loadUsers() {
    if (!state.token) {
        state.users = [];
        return;
    }

    try {
        state.users = await apiRequest('/users');
    } catch (error) {
        state.users = [];
        if (state.activeView === 'users') {
            setMessage(`Users require admin access: ${error.message}`, 'error');
        }
    }
}

async function refreshData() {
    try {
        await loadCurrentUser();
        await loadAgents();
        await loadCases();
        await loadUsers();
        renderActiveView();
        setMessage('Data refreshed.', 'success');
    } catch (error) {
        renderActiveView();
        setMessage(error.message, 'error');
    }
}

function getFormDataObject(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function fillCaseForm(caseItem) {
    elements.caseFormTitle.textContent = 'Edit Case';
    elements.caseForm.elements.caseId.value = caseItem._id;
    elements.caseForm.elements.title.value = caseItem.title || '';
    elements.caseForm.elements.type.value = caseItem.type || 'case';
    elements.caseForm.elements.status.value = caseItem.status || 'open';
    elements.caseForm.elements.priority.value = caseItem.priority || 'medium';
    elements.caseForm.elements.location.value = caseItem.location || '';
    elements.caseForm.elements.reportedBy.value = caseItem.reportedBy || '';
    elements.caseForm.elements.suspectName.value = caseItem.suspectName || '';
    elements.caseForm.elements.suspectSpecies.value = caseItem.suspectSpecies || '';
    elements.caseForm.elements.description.value = caseItem.description || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearCaseForm() {
    elements.caseFormTitle.textContent = 'Create Case';
    elements.caseForm.reset();
    elements.caseForm.elements.caseId.value = '';
    elements.caseForm.elements.type.value = 'case';
    elements.caseForm.elements.status.value = 'open';
    elements.caseForm.elements.priority.value = 'medium';
}

async function handleLogin(event) {
    event.preventDefault();

    try {
        const credentials = getFormDataObject(event.currentTarget);
        const data = await apiRequest('/users/login', {
            method: 'POST',
            body: credentials,
            auth: false
        });

        state.token = data.token;
        state.currentUser = data.user;
        localStorage.setItem('cityWatchToken', state.token);
        updateSessionUi();
        await refreshData();
        setMessage('Login successful.', 'success');
    } catch (error) {
        setMessage(error.message, 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();

    try {
        const formData = new FormData(event.currentTarget);
        const data = await apiRequest('/users/register', {
            method: 'POST',
            body: formData,
            auth: false
        });

        event.currentTarget.reset();
        setMessage(`User created as role "${data.user.role}".`, 'success');
    } catch (error) {
        setMessage(error.message, 'error');
    }
}

async function handleAgentCreate(event) {
    event.preventDefault();

    try {
        const formData = new FormData(event.currentTarget);
        await apiRequest('/agents', {
            method: 'POST',
            body: formData
        });

        event.currentTarget.reset();
        await refreshData();
        setMessage('Agent created.', 'success');
    } catch (error) {
        setMessage(error.message, 'error');
    }
}

async function handleCaseSave(event) {
    event.preventDefault();

    try {
        const form = event.currentTarget;
        const data = getFormDataObject(form);
        const caseId = data.caseId;
        delete data.caseId;

        if (!data.suspectSpecies) {
            delete data.suspectSpecies;
        }

        await apiRequest(caseId ? `/cases/${caseId}` : '/cases', {
            method: caseId ? 'PATCH' : 'POST',
            body: data
        });

        clearCaseForm();
        await refreshData();
        setMessage(caseId ? 'Case updated.' : 'Case created.', 'success');
    } catch (error) {
        setMessage(error.message, 'error');
    }
}

async function handleAssign(event) {
    event.preventDefault();

    try {
        const data = getFormDataObject(event.currentTarget);
        await apiRequest(`/cases/${data.caseId}/assign/${data.userId}`, {
            method: 'PUT'
        });

        await refreshData();
        setMessage('Case assigned. Duplicate assignments are ignored by the API.', 'success');
    } catch (error) {
        setMessage(error.message, 'error');
    }
}

async function handleCaseListClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'edit-case') {
        const caseItem = state.cases.find((item) => item._id === id);
        if (caseItem) {
            fillCaseForm(caseItem);
        }
    }

    if (action === 'delete-case') {
        const confirmed = confirm('Delete this case?');
        if (!confirmed) {
            return;
        }

        try {
            await apiRequest(`/cases/${id}`, { method: 'DELETE' });
            await refreshData();
            setMessage('Case deleted.', 'success');
        } catch (error) {
            setMessage(error.message, 'error');
        }
    }
}

async function handleUsersClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    try {
        if (action === 'update-role') {
            const role = document.querySelector(`[data-role-select="${id}"]`).value;
            await apiRequest(`/users/${id}/role`, {
                method: 'PATCH',
                body: { role }
            });
            setMessage('Role updated.', 'success');
        }

        if (action === 'delete-user') {
            const confirmed = confirm('Delete this user?');
            if (!confirmed) {
                return;
            }

            await apiRequest(`/users/${id}`, { method: 'DELETE' });
            setMessage('User deleted.', 'success');
        }

        await refreshData();
    } catch (error) {
        setMessage(error.message, 'error');
    }
}

function setupEvents() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.agentForm.addEventListener('submit', handleAgentCreate);
    elements.caseForm.addEventListener('submit', handleCaseSave);
    elements.assignForm.addEventListener('submit', handleAssign);
    elements.clearCaseFormButton.addEventListener('click', clearCaseForm);
    elements.casesList.addEventListener('click', handleCaseListClick);
    elements.usersList.addEventListener('click', handleUsersClick);
    elements.refreshButton.addEventListener('click', refreshData);

    elements.logoutButton.addEventListener('click', () => {
        state.token = '';
        state.currentUser = null;
        state.cases = [];
        state.users = [];
        localStorage.removeItem('cityWatchToken');
        updateSessionUi();
        renderActiveView();
        setMessage('Logged out.', 'success');
    });

    elements.globalSearch.addEventListener('input', (event) => {
        state.search = event.target.value.trim();
        renderActiveView();
    });

    elements.tabButtons.forEach((button) => {
        button.addEventListener('click', () => setActiveView(button.dataset.view));
    });
}

async function init() {
    setupEnumSelects();
    setupEvents();
    clearCaseForm();
    updateSessionUi();
    await refreshData();
}

init();
