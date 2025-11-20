localStorage.removeItem('teamWishes');
const list = document.getElementById('wish-list');
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('delete-modal');
const overlay = document.getElementById('overlay');
const form = document.getElementById('wish-form');

let deleteId = null;

// GitHub API Configuration
const GITHUB_OWNER = 'srichu143';
const GITHUB_REPO = 'TARGET';
const GITHUB_TOKEN = localStorage.getItem('GITHUB_TOKEN');

// Check and setup GitHub token on first load
if (!GITHUB_TOKEN) {
    const token = prompt('Enter your GitHub Personal Access Token (for read access to issues):\n\nCreate one at: https://github.com/settings/tokens');
    if (token) {
        localStorage.setItem('GITHUB_TOKEN', token);
        location.reload();
    } else {
        alert('GitHub token required for shared wishlists. Wishes will be saved locally only.');
    }
}

// Fetch wishes from GitHub Issues
async function getWishes() {
    if (!GITHUB_TOKEN) return getLocalWishes();
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=wish&state=open`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const issues = await response.json();
        return issues.map((issue, idx) => ({
            id: issue.number,
            name: issue.title,
            wish: issue.body,
            owner: issue.user.login,
            url: issue.html_url
        }));
    } catch (error) {
        console.error('GitHub API error:', error);
        alert('Error fetching from GitHub. Showing local data.');
        return getLocalWishes();
    }
}

// Get wishes from localStorage (fallback)
function getLocalWishes() {
    const data = localStorage.getItem('teamWishes');
    return data ? JSON.parse(data) : [];
}

// Create wish as GitHub Issue
async function createWish(name, wish) {
    if (!GITHUB_TOKEN) {
        return createLocalWish(name, wish);
    }
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    title: name,
                    body: wish,
                    labels: ['wish']
                })
            }
        );
        
        if (!response.ok) throw new Error('Failed to create');
        load();
    } catch (error) {
        console.error('Error creating wish:', error);
        alert('Failed to create wish on GitHub. Trying local save...');
        createLocalWish(name, wish);
    }
}

// Create wish locally
function createLocalWish(name, wish) {
    let wishes = getLocalWishes();
    const newId = wishes.length > 0 ? Math.max(...wishes.map(w => w.id)) + 1 : 1;
    wishes.push({ id: newId, name, wish });
    localStorage.setItem('teamWishes', JSON.stringify(wishes));
}

// Update wish (GitHub Issue)
async function updateWish(id, name, wish) {
    if (!GITHUB_TOKEN) return updateLocalWish(id, name, wish);
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    title: name,
                    body: wish
                })
            }
        );
        
        if (!response.ok) throw new Error('Failed to update');
        load();
    } catch (error) {
        console.error('Error updating wish:', error);
        alert('Failed to update wish on GitHub');
    }
}

// Update wish locally
function updateLocalWish(id, name, wish) {
    let wishes = getLocalWishes();
    wishes = wishes.map(w => w.id === id ? { id, name, wish } : w);
    localStorage.setItem('teamWishes', JSON.stringify(wishes));
}

// Delete wish (GitHub Issue)
async function deleteWish(id) {
    if (!GITHUB_TOKEN) return deleteLocalWish(id);
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({ state: 'closed' })
            }
        );
        
        if (!response.ok) throw new Error('Failed to delete');
        load();
    } catch (error) {
        console.error('Error deleting wish:', error);
        alert('Failed to delete wish on GitHub');
    }
}

// Delete wish locally
function deleteLocalWish(id) {
    let wishes = getLocalWishes();
    wishes = wishes.filter(w => w.id !== id);
    localStorage.setItem('teamWishes', JSON.stringify(wishes));
}

// Load and render wishes
async function load() {
    const data = await getWishes();
    list.innerHTML = data.map(w => `
        <div class="card">
            <h3>${esc(w.name)}</h3>
            <p>${esc(w.wish)}</p>
            <small>by ${w.owner || 'You'}</small>
            <div class="card-actions">
                <button class="btn" onclick="edit(${w.id}, '${esc(w.name)}', '${esc(w.wish)}')">Edit</button>
                <button class="btn danger" onclick="askDelete(${w.id})">Delete</button>
                ${w.url ? `<a href="${w.url}" target="_blank" class="btn">View</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Form submission
form.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('wish-id').value;
    const name = document.getElementById('name').value;
    const wish = document.getElementById('wish').value;
    
    if (id) {
        await updateWish(parseInt(id), name, wish);
    } else {
        await createWish(name, wish);
    }
    
    closeModals();
};

// Delete confirmation
document.getElementById('confirm-delete').onclick = async () => {
    if (deleteId) {
        await deleteWish(deleteId);
        closeModals();
    }
};

// UI Helpers
window.edit = (id, name, wish) => {
    document.getElementById('wish-id').value = id;
    document.getElementById('name').value = unesc(name);
    document.getElementById('wish').value = unesc(wish);
    document.getElementById('modal-title').innerText = 'Edit Wish';
    open(modal);
};

window.askDelete = (id) => {
    deleteId = id;
    open(deleteModal);
};

document.getElementById('add-btn').onclick = () => {
    form.reset();
    document.getElementById('wish-id').value = '';
    document.getElementById('modal-title').innerText = 'Add Wish';
    open(modal);
};

document.getElementById('cancel-btn').onclick = closeModals;
document.getElementById('cancel-delete').onclick = closeModals;
overlay.onclick = closeModals;

function open(el) {
    el.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function closeModals() {
    modal.classList.add('hidden');
    deleteModal.classList.add('hidden');
    overlay.classList.add('hidden');
}

function esc(str) {
    return str ? str.replace(/'/g, "\'").replace(/"/g, '\"') : '';
}

function unesc(str) {
    return str ? str.replace(/\'/g, "'").replace(/\\"/g, '"') : '';
}

// Initial load
load();

// Refresh data every 30 seconds for shared updates
setInterval(load, 30000);
