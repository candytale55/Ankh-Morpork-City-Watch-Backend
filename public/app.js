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
    assignAgentForm: document.querySelector('#assignAgentForm'),
    globalSearch: document.querySelector('#globalSearch'),
    refreshButton: document.querySelector('#refreshButton'),
    profileModal: document.querySelector('#profileModal'),
    profileModalBody: document.querySelector('#profileModalBody'),
    tabButtons: document.querySelectorAll('.tab-button'),
    viewSections: document.querySelectorAll('.view-section'),
    agentsList: document.querySelector('#agentsList'),
    casesList: document.querySelector('#casesList'),
    usersList: document.querySelector('#usersList'),
    meProfile: document.querySelector('#meProfile')
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
    fillSelect(elements.registerForm.elements.role, enums.roles);
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

function getProfileCases(cases = []) {
    return cases.map((caseItem) => ({
        _id: caseItem._id,
        title: caseItem.title || 'Untitled case',
        status: caseItem.status || 'unknown',
        priority: caseItem.priority || 'low'
    }));
}

function renderProfileCases(cases = []) {
    if (!cases.length) {
        return '<div class="empty-state compact-empty-state">No assigned cases.</div>';
    }

    return `
        <div class="profile-cases-list">
            ${cases.map((caseItem) => `
                <div class="profile-case-item" title="${escapeHtml(caseItem.title)}">
                    <span class="profile-case-title">${escapeHtml(caseItem.title)}</span>
                    <span class="profile-case-meta badge-row">
                        <span class="badge">${escapeHtml(caseItem.status)}</span>
                        <span class="badge ${caseItem.priority === 'high' ? 'priority-high' : caseItem.priority === 'medium' ? 'priority-medium' : ''}">${escapeHtml(caseItem.priority)}</span>
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

function openProfileModal(profileType, profileId, sourceOverride = null) {
    const source = profileType === 'agent'
        ? state.agents.find((item) => item._id === profileId)
        : sourceOverride || state.users.find((item) => item._id === profileId);

    if (!source) {
        return;
    }

    const title = profileType === 'agent' ? source.name || source.title || 'Agent profile' : source.name || 'User profile';
    const subtitle = profileType === 'agent'
        ? source.title || source.organization || 'Agent'
        : source.email || 'User';
    const cases = getProfileCases(source.assignedCases || []);
    const imageAlt = profileType === 'agent'
        ? `${escapeHtml(source.name || 'Agent')} portrait`
        : `${escapeHtml(source.name || 'User')} profile image`;

    elements.profileModalBody.innerHTML = `
        <section class="profile-layout">
            <div class="profile-media">
                <img src="${escapeHtml(source.image || '')}" alt="${imageAlt}">
            </div>
            <div class="profile-details">
                <div>
                    <p class="eyebrow">${profileType === 'agent' ? 'Agent fiche' : 'User fiche'}</p>
                    <h2 id="profileModalTitle">${escapeHtml(title)}</h2>
                    <p class="profile-subtitle">${escapeHtml(subtitle)}</p>
                </div>
                <div class="profile-meta-grid">
                    ${profileType === 'agent' ? `
                        <p class="meta-line"><strong>Name:</strong> ${escapeHtml(source.name || 'Unnamed agent')}</p>
                        <p class="meta-line"><strong>Title:</strong> ${escapeHtml(source.title || 'No title')}</p>
                        <p class="meta-line"><strong>Organization:</strong> ${escapeHtml(source.organization || 'No organization')}</p>
                        <p class="meta-line"><strong>Species:</strong> ${escapeHtml(source.species || 'unknown')}</p>
                        <p class="meta-line"><strong>Gender:</strong> ${escapeHtml(source.gender || 'unknown')}</p>
                    ` : `
                        <p class="meta-line"><strong>Name:</strong> ${escapeHtml(source.name || 'Unnamed user')}</p>
                        <p class="meta-line"><strong>Email:</strong> ${escapeHtml(source.email || 'No email')}</p>
                        <p class="meta-line"><strong>Role:</strong> ${escapeHtml(source.role || 'user')}</p>
                        <p class="meta-line"><strong>User ID:</strong> ${escapeHtml(source._id || 'unknown')}</p>
                    `}
                </div>
                <div class="profile-cases-section">
                    <h3>Assigned cases</h3>
                    ${renderProfileCases(cases)}
                </div>
            </div>
        </section>
    `;

    elements.profileModal.hidden = false;
    document.body.classList.add('modal-open');
}

function closeProfileModal() {
    elements.profileModal.hidden = true;
    elements.profileModalBody.innerHTML = '';
    document.body.classList.remove('modal-open');
}

async function openCurrentUserProfile() {
    if (!state.token) {
        setMessage('Login to view your profile.', 'error');
        return;
    }

    if (!state.currentUser) {
        await loadCurrentUser();
    }

    if (!state.currentUser) {
        setMessage('Profile not available yet. Refresh and try again.', 'error');
        return;
    }

    openProfileModal('user', state.currentUser._id, state.currentUser);
}

function renderAgentThumbs(agents = []) {
    if (!agents.length) {
        return '<span class="muted-note">No assigned agents</span>';
    }

    return `
        <div class="agent-thumb-row">
            ${agents.map((agent) => `
                <div class="agent-thumb" title="${escapeHtml(agent.name || 'Agent')}">
                    ${agent.image ? `<img src="${escapeHtml(agent.image)}" alt="${escapeHtml(agent.name || 'Agent')} portrait">` : '<div class="agent-thumb-placeholder">No image</div>'}
                    <span>${escapeHtml(agent.name || agent.title || 'Agent')}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderUserThumbs(users = []) {
    if (!users.length) {
        return '<span class="muted-note">No assigned users</span>';
    }

    return `
        <div class="agent-thumb-row user-thumb-row">
            ${users.map((user) => `
                <div class="agent-thumb user-thumb" title="${escapeHtml(user.name || 'User')}">
                    ${user.image ? `<img src="${escapeHtml(user.image)}" alt="${escapeHtml(user.name || 'User')} portrait">` : '<div class="agent-thumb-placeholder">No image</div>'}
                    <span>${escapeHtml(user.name || user.email || 'User')}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAgents() {
    const agents = getFilteredItems(state.agents);

    if (!agents.length) {
        elements.agentsList.innerHTML = '<div class="empty-state">No agents found.</div>';
        return;
    }

    elements.agentsList.innerHTML = agents.map((agent) => `
        <article class="agent-card profile-trigger" data-profile-type="agent" data-profile-id="${agent._id}" tabindex="0" role="button" aria-label="Open profile for ${escapeHtml(agent.name)}">
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
                <span class="badge ${caseItem.priority === 'high' ? 'priority-high' : caseItem.priority === 'medium' ? 'priority-medium' : ''}">${escapeHtml(caseItem.priority)}</span>
            </div>
            <p class="case-description">${escapeHtml(caseItem.description)}</p>
            <p class="meta-line"><strong>Location:</strong> ${escapeHtml(caseItem.location)}</p>
            <p class="meta-line"><strong>Reported by:</strong> ${escapeHtml(caseItem.reportedBy || 'Not set')}</p>
            <p class="meta-line"><strong>Suspect:</strong> ${escapeHtml(caseItem.suspectName || 'Unknown')} (${escapeHtml(caseItem.suspectSpecies || 'unknown')})</p>
            <div class="assigned-people-row">
                <div class="assigned-agents-block">
                    <p class="meta-line"><strong>Assigned agents:</strong></p>
                    ${renderAgentThumbs(caseItem.assignedAgents)}
                </div>
                <div class="assigned-users-block">
                    <p class="meta-line"><strong>Assigned users:</strong></p>
                    ${renderUserThumbs(caseItem.assignedTo)}
                </div>
            </div>
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
                    <tr class="profile-row" data-profile-type="user" data-profile-id="${user._id}" tabindex="0" role="button" aria-label="Open profile for ${escapeHtml(user.name || user.email)}">
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

function renderMe() {
    if (!state.token) {
        elements.meProfile.innerHTML = '<div class="empty-state">Login to view your profile.</div>';
        return;
    }

    if (!state.currentUser) {
        elements.meProfile.innerHTML = '<div class="empty-state">Profile not loaded. Click Refresh.</div>';
        return;
    }

    const user = state.currentUser;

    elements.meProfile.innerHTML = `
        <div class="user-profile-cell">
            <img src="${escapeHtml(user.image)}" alt="${escapeHtml(user.name || 'User')} profile image">
            <div>
                <h3>${escapeHtml(user.name || 'Unnamed user')}</h3>
                <p class="meta-line">${escapeHtml(user.email || 'No email')}</p>
            </div>
        </div>
        <p class="meta-line"><strong>Role:</strong> ${escapeHtml(user.role || 'user')}</p>
        <p class="meta-line"><strong>User ID:</strong> ${escapeHtml(user._id || 'unknown')}</p>
        <p class="meta-line"><strong>Assigned cases:</strong> ${escapeHtml(getIdListLabel(user.assignedCases || []))}</p>
    `;
}

function handleProfileOpen(event, profileType) {
    if (event.target.closest('button, select, option, input, textarea, a')) {
        return;
    }

    const trigger = event.target.closest(`[data-profile-type="${profileType}"]`);
    if (!trigger) {
        return;
    }

    openProfileModal(profileType, trigger.dataset.profileId);
}

async function handleTabSelection(viewName) {
    if (viewName === 'me') {
        await openCurrentUserProfile();
        return;
    }

    setActiveView(viewName);
}

function renderAssignOptions() {
    const caseOptions = state.cases.map((caseItem) => `<option value="${caseItem._id}">${escapeHtml(caseItem.title)}</option>`).join('');
    const userOptions = state.users.map((user) => `<option value="${user._id}">${escapeHtml(user.name || user.email)} (${escapeHtml(user.role)})</option>`).join('');
    const agentOptions = state.agents.map((agent) => `<option value="${agent._id}">${escapeHtml(agent.name || agent.title)}</option>`).join('');

    elements.assignForm.elements.caseId.innerHTML = caseOptions || '<option value="">No cases loaded</option>';
    elements.assignForm.elements.userId.innerHTML = userOptions || '<option value="">No users loaded</option>';
    elements.assignAgentForm.elements.caseId.innerHTML = caseOptions || '<option value="">No cases loaded</option>';
    elements.assignAgentForm.elements.agentId.innerHTML = agentOptions || '<option value="">No agents loaded</option>';
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

    if (state.activeView === 'me') {
        renderMe();
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

async function handleAssignAgent(event) {
    event.preventDefault();

    try {
        const data = getFormDataObject(event.currentTarget);
        await apiRequest(`/cases/${data.caseId}/assign-agent/${data.agentId}`, {
            method: 'PUT'
        });

        await refreshData();
        setMessage('Case assigned to agent.', 'success');
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
        handleProfileOpen(event, 'user');
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

function handleProfileKeydown(event, profileType) {
    if (event.key !== 'Enter' && event.key !== ' ') {
        return;
    }

    const trigger = event.target.closest(`[data-profile-type="${profileType}"]`);
    if (!trigger) {
        return;
    }

    event.preventDefault();
    openProfileModal(profileType, trigger.dataset.profileId);
}

function setupEvents() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.agentForm.addEventListener('submit', handleAgentCreate);
    elements.caseForm.addEventListener('submit', handleCaseSave);
    elements.assignForm.addEventListener('submit', handleAssign);
    elements.assignAgentForm.addEventListener('submit', handleAssignAgent);
    elements.clearCaseFormButton.addEventListener('click', clearCaseForm);
    elements.casesList.addEventListener('click', handleCaseListClick);
    elements.usersList.addEventListener('click', handleUsersClick);
    elements.agentsList.addEventListener('click', (event) => handleProfileOpen(event, 'agent'));
    elements.agentsList.addEventListener('keydown', (event) => handleProfileKeydown(event, 'agent'));
    elements.usersList.addEventListener('keydown', (event) => handleProfileKeydown(event, 'user'));
    elements.refreshButton.addEventListener('click', refreshData);
    elements.profileModal.addEventListener('click', (event) => {
        if (event.target.hasAttribute('data-close-profile-modal')) {
            closeProfileModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !elements.profileModal.hidden) {
            closeProfileModal();
        }
    });

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
        button.addEventListener('click', () => handleTabSelection(button.dataset.view));
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
