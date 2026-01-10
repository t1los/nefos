//global variables
let token = localStorage.getItem('token');
let currentTeamId = null;
let currentTaskId = null; // Για το Modal
let userRole = localStorage.getItem('role');
let userId = localStorage.getItem('userId');

//init
if (token) {
    showDashboard();
}

// helper func-lookup User ID by username
async function lookupUser(usernameInput) {
    if(!usernameInput) return null;
    
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        const foundUser = users.find(u => u.username === usernameInput.trim());
        
        if (foundUser) {
            return foundUser.id;
        } else {
            alert(`User "${usernameInput}" not found!`);
            return null;
        }
    } catch (err) {
        console.error(err);
        alert("Error looking up user.");
        return null;
    }
}

//auth func

function toggleAuthMode() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const loginError = document.getElementById('login-error');
    const regMsg = document.getElementById('reg-message');
    
    if(loginError) loginError.innerText = '';
    if(regMsg) regMsg.innerText = '';

    if (loginCard.style.display === 'none') {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    } else {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    }
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const msgBox = document.getElementById('reg-message');

    if (!username || !password || !email) {
        msgBox.className = 'text-danger text-center mt-3 small fw-bold';
        msgBox.innerText = 'Please fill in all required fields.';
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, firstName, lastName })
        });
        const data = await res.json();

        if (res.ok) {
            msgBox.className = 'text-success text-center mt-3 small fw-bold';
            msgBox.innerText = 'Account created! Wait for admin approval.';
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-password').value = '';
            document.getElementById('reg-email').value = '';
        } else {
            msgBox.className = 'text-danger text-center mt-3 small fw-bold';
            msgBox.innerText = data.message || 'Registration failed';
        }
    } catch (err) {
        msgBox.className = 'text-danger text-center mt-3 small fw-bold';
        msgBox.innerText = 'Server error.';
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    
    if(errorMsg) errorMsg.innerText = '';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('username', data.username); 
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.id);
            
            token = data.accessToken;
            userRole = data.role;
            userId = data.id;

            showDashboard();
        } else {
            if(errorMsg) errorMsg.innerText = data.message || 'Login failed';
        }
    } catch (err) {
        if(errorMsg) errorMsg.innerText = 'Server error. Is Backend running?';
        console.error(err);
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

//dashboard

function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('navbar').style.display = 'flex';
    
    document.getElementById('user-display').innerText = localStorage.getItem('username') || 'User';
    
    const adminBtn = document.getElementById('admin-btn');
    if (userRole === 'ADMIN') {
        adminBtn.style.display = 'block';
    } else {
        adminBtn.style.display = 'none';
    }
    
    loadTeams();
}

//my tasks

async function loadMyTasks() {
    currentTeamId = null; 
    
    document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
    document.getElementById('task-header').innerHTML = `<i class="fas fa-user-check"></i> My Assigned Tasks`;
    document.getElementById('add-task-btn').disabled = true; 
    document.getElementById('team-info-bar').style.display = 'none';

    if(!userId) {
        alert("Please logout and login again to refresh your User ID.");
        return;
    }

    try {
        const res = await fetch(`/api/tasks?assignedTo=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (err) {
        console.error("Error loading my tasks:", err);
    }
}

//teams and tasks

async function loadTeams() {
    try {
        const res = await fetch('/api/teams', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
            logout(); 
            return;
        }

        const teams = await res.json();
        const list = document.getElementById('teams-list');
        list.innerHTML = '';
        
        if(teams.length === 0) {
            list.innerHTML = '<div class="p-3 text-muted text-center small">No teams found.</div>';
            return;
        }

        teams.forEach(team => {
            const a = document.createElement('a');
            a.className = 'list-group-item list-group-item-action py-3';
            a.innerHTML = `
                <h6 class="mb-1 fw-bold">${team.name}</h6>
                <small class="text-muted">${team.description || ''}</small>
            `;
            a.onclick = () => {
                document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
                loadTeamTasks(team);
            };
            list.appendChild(a);
        });
    } catch (err) {
        console.error("Error loading teams:", err);
    }
}

async function loadTeamTasks(team) {
    currentTeamId = team._id;
    
    document.getElementById('task-header').innerHTML = `<i class="fas fa-tasks"></i> Tasks: <span class="text-primary">${team.name}</span>`;
    document.getElementById('add-task-btn').disabled = false;
    
    const infoBar = document.getElementById('team-info-bar');
    if(infoBar) {
        infoBar.style.display = 'block';
        document.getElementById('team-members-display').innerText = team.members ? team.members.join(', ') : 'None';
    }

    try {
        const res = await fetch(`/api/tasks?teamId=${team._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (err) {
        console.error("Error loading team tasks:", err);
    }
}

function renderTasks(tasks) {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';
    
    if(tasks.length === 0) {
        container.innerHTML = '<div class="alert alert-info text-center mt-4">No tasks found.</div>';
        return;
    }

    tasks.forEach(task => {
        const badgeClass = task.status === 'DONE' ? 'bg-success' : (task.status === 'IN_PROGRESS' ? 'bg-warning text-dark' : 'bg-secondary');
        
        let borderClass = 'border-secondary';
        if(task.priority === 'HIGH') borderClass = 'border-danger';
        if(task.priority === 'MEDIUM') borderClass = 'border-warning';
        if(task.priority === 'LOW') borderClass = 'border-success';

        const div = document.createElement('div');
        div.className = `card mb-3 task-card shadow-sm border-start border-5 ${borderClass}`;
        div.style.cursor = 'pointer';
        
        div.onclick = (e) => {
            if(e.target.closest('button')) return;
            openTaskModal(task);
        };

        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div>
                        <h5 class="card-title mb-1">${task.title} <span class="badge ${badgeClass}">${task.status}</span></h5>
                        <p class="text-muted small mb-0"><i class="far fa-calendar-alt"></i> Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <button class="btn btn-sm btn-link text-danger z-2" onclick="deleteTask('${task._id}')" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>`;
        container.appendChild(div);
    });
}

// create new task

function createTaskPrompt() {
    if(!currentTeamId) return alert("Please select a team first!");
    
    document.getElementById('new-task-title').value = '';
    document.getElementById('new-task-desc').value = '';
    document.getElementById('new-task-assignee').value = ''; 
    document.getElementById('new-task-priority').value = 'MEDIUM';
    document.getElementById('new-task-due').value = ''; 

    const modalEl = document.getElementById('createTaskModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function submitNewTask() {
    const title = document.getElementById('new-task-title').value;
    const desc = document.getElementById('new-task-desc').value;
    const assigneeUsername = document.getElementById('new-task-assignee').value;
    const priority = document.getElementById('new-task-priority').value;
    const dueDate = document.getElementById('new-task-due').value; 

    if(!title) {
        alert("Task Title is required!");
        return;
    }

    const body = {
        title, 
        description: desc, 
        teamId: currentTeamId, 
        createdBy: parseInt(userId),
        priority: priority,
        dueDate: dueDate ? dueDate : null 
    };
    
    if(assigneeUsername) {
        const foundId = await lookupUser(assigneeUsername);
        if(!foundId) return; 
        body.assignedTo = foundId;
    }

    try {
        await fetch('/api/tasks', { 
            method: 'POST', 
            headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'}, 
            body: JSON.stringify(body) 
        });
        
        const modalEl = document.getElementById('createTaskModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        
        refreshTasksList();
    } catch(err) {
        console.error(err);
        alert("Failed to create task");
    }
}

//task details using modal

async function openTaskModal(task) {
    currentTaskId = task._id;
    
    document.getElementById('modal-task-title').innerText = task.title;
    document.getElementById('modal-task-desc').innerText = task.description || 'No description provided.';
    document.getElementById('modal-task-status').innerText = task.status;
    document.getElementById('modal-task-priority').innerText = task.priority;
    document.getElementById('modal-task-due').innerText = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-';
    
    document.getElementById('modal-task-assigned').innerHTML = `
        ID: ${task.assignedTo || 'Unassigned'} 
        <a href="#" class="ms-2 small text-decoration-none" onclick="modalReassignPrompt()">[Change User]</a>
    `;

    const commentsList = document.getElementById('modal-comments-list');
    commentsList.innerHTML = '';
    
    if(task.comments && task.comments.length > 0) {
        task.comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'bg-white border rounded p-2 mb-2 small';
            div.innerHTML = `<strong>${c.authorName || 'User'}</strong>: ${c.text}`;
            commentsList.appendChild(div);
        });
    } else {
        commentsList.innerHTML = '<p class="text-muted text-center small mb-0">No comments yet.</p>';
    }

    const modalEl = document.getElementById('taskModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function modalAddComment() {
    const text = document.getElementById('modal-new-comment').value;
    if(!text) return;
    const username = localStorage.getItem('username');

    try {
        await fetch(`/api/tasks/${currentTaskId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ text, authorName: username })
        });
        document.getElementById('modal-new-comment').value = '';
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        modalInstance.hide();
        refreshTasksList();
    } catch (err) {
        alert("Failed to add comment");
    }
}

async function modalUpdateStatus(status) {
    try {
        await fetch(`/api/tasks/${currentTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        modalInstance.hide();
        refreshTasksList();
    } catch (err) {
        alert("Failed to update status");
    }
}

async function modalReassignPrompt() {
    const usernameInput = prompt("Enter new User's Username:");
    if (!usernameInput) return;

    const foundId = await lookupUser(usernameInput);
    if(!foundId) return;

    try {
        await fetch(`/api/tasks/${currentTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ assignedTo: foundId })
        });
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        modalInstance.hide();
        refreshTasksList();
    } catch (err) {
        alert("Failed to re-assign task");
    }
}

function refreshTasksList() {
    if(currentTeamId) {
         const activeTeam = document.querySelector('.list-group-item.active');
         if(activeTeam) activeTeam.click();
    } else {
        loadMyTasks();
    }
}

// team members

async function addMemberPrompt() {
    const usernameInput = prompt("Enter Username to add:");
    if(!usernameInput) return;

    const memberId = await lookupUser(usernameInput);
    if(!memberId) return;
    
    try {
        const allTeamsRes = await fetch('/api/teams', { headers: { 'Authorization': `Bearer ${token}` } });
        const allTeams = await allTeamsRes.json();
        const myTeam = allTeams.find(t => t._id === currentTeamId);
        
        if(!myTeam) return;

        const newMemberId = parseInt(memberId);
        if(myTeam.members && myTeam.members.includes(newMemberId)) {
            alert(`User ${usernameInput} is already a member!`);
            return;
        }

        const newMembers = myTeam.members ? [...myTeam.members, newMemberId] : [newMemberId];
        
        const res = await fetch(`/api/teams/${currentTeamId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ members: newMembers })
        });
        
        if(res.ok) {
            alert(`User ${usernameInput} added successfully!`);
            loadTeams(); 
        } else {
            alert("Failed to add member.");
        }
    } catch(e) {
        alert("Error adding member");
    }
}

//crud ops

async function createTeamPrompt() { 
    const name = prompt("Enter Team Name:"); 
    if(!name) return;
    const desc = prompt("Enter Description:");
    
    try {
        await fetch('/api/teams', { 
            method: 'POST', 
            headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'}, 
            body: JSON.stringify({
                name, 
                description: desc, 
                leaderId: parseInt(userId), 
                members: [parseInt(userId)]
            }) 
        });
        loadTeams();
    } catch(err) {
        alert("Failed to create team");
    }
}

async function deleteTask(id) { 
    if(!confirm("Are you sure?")) return;
    try {
        await fetch(`/api/tasks/${id}`, { 
            method: 'DELETE', 
            headers: {'Authorization': `Bearer ${token}`} 
        });
        refreshTasksList();
    } catch(err) {
        alert("Failed to delete task");
    }
}

// admin panel

async function showAdminPanel() {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
    
    try {
        const res = await fetch('/api/admin/users', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const users = await res.json();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            
            // status
            const statusBadge = user.isActive 
                ? '<span class="badge bg-success">Active</span>' 
                : '<span class="badge bg-warning text-dark">Pending</span>';
            
            // approve button
            const actionBtn = !user.isActive 
                ? `<button class="btn btn-sm btn-success" onclick="activateUser(${user.id})"><i class="fas fa-check"></i> Approve</button>` 
                : '<span class="text-muted small"><i class="fas fa-check-circle"></i> Active</span>';

            // role select dropdown
            const isSelf = (user.id == userId);
            const roleSelect = `
                <select class="form-select form-select-sm" style="width: 130px;" onchange="updateUserRole(${user.id}, this.value)" ${isSelf ? 'disabled' : ''}>
                    <option value="MEMBER" ${user.role === 'MEMBER' ? 'selected' : ''}>MEMBER</option>
                    <option value="TEAM_LEADER" ${user.role === 'TEAM_LEADER' ? 'selected' : ''}>TEAM_LEADER</option>
                    <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                </select>
            `;

            tr.innerHTML = `
                <td><strong>${user.username}</strong><br><small class="text-muted">${user.firstName || ''} ${user.lastName || ''}</small></td>
                <td>${user.email}</td>
                <td>${roleSelect}</td>
                <td>${statusBadge}</td>
                <td>${actionBtn}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch(err) {
        console.error(err);
        alert("Failed to load users");
    }
}

async function activateUser(id) {
    if(!confirm("Approve this user?")) return;
    try {
        await fetch(`/api/admin/users/${id}`, { 
            method: 'PATCH', 
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, 
            body: JSON.stringify({isActive: true}) 
        });
        showAdminPanel(); 
    } catch(err) {
        alert("Failed to activate user");
    }
}

async function updateUserRole(userId, newRole) {
    if(!confirm(`Change user role to ${newRole}?`)) {
        showAdminPanel(); 
        return;
    }

    try {
        const res = await fetch(`/api/admin/users/${userId}`, { 
            method: 'PATCH', 
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, 
            body: JSON.stringify({ role: newRole }) 
        });

        if(res.ok) {
            alert("User role updated successfully!");
        } else {
            const data = await res.json();
            alert("Failed to update role: " + (data.message || "Unknown error"));
        }
        showAdminPanel(); 
    } catch(err) {
        console.error(err);
        alert("Error updating role");
    }
}