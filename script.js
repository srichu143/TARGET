const list = document.getElementById('wish-list');
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('delete-modal');
const overlay = document.getElementById('overlay');
const form = document.getElementById('wish-form');

let deleteId = null;
const STORAGE_KEY = 'teamWishes';

// Get wishes from localStorage
function getWishes() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save wishes to localStorage
function saveWishes(wishes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
}

// Fetch & Render
function load() {
    const data = getWishes();
    list.innerHTML = data.map(w => `
        <div class="card">
            <h3>${esc(w.name)}</h3>
            <p>${esc(w.wish)}</p>
            <div class="card-actions">
                <button class="btn" onclick="edit(${w.id}, '${esc(w.name)}', '${esc(w.wish)}')">Edit</button>
                <button class="btn danger" onclick="askDelete(${w.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Add/Edit
form.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('wish-id').value;
    const name = document.getElementById('name').value;
    const wish = document.getElementById('wish').value;
    
    let wishes = getWishes();
    
    if (id) {
        // Edit existing
        wishes = wishes.map(w => w.id === parseInt(id) ? { id: parseInt(id), name, wish } : w);
    } else {
        // Add new
        const newId = wishes.length > 0 ? Math.max(...wishes.map(w => w.id)) + 1 : 1;
        wishes.push({ id: newId, name, wish });
    }
    
    saveWishes(wishes);
    closeModals();
    load();
};

// Delete
document.getElementById('confirm-delete').onclick = () => {
    if (deleteId) {
        let wishes = getWishes();
        wishes = wishes.filter(w => w.id !== deleteId);
        saveWishes(wishes);
        closeModals();
        load();
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
    return str ? str.replace(/'/g, "&#39;").replace(/"/g, "&quot;") : '';
}

function unesc(str) {
    return str ? str.replace(/&#39;/g, "'").replace(/&quot;/g, '"') : '';
}

load();
