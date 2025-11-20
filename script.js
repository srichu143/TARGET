const list = document.getElementById('wish-list');
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('delete-modal');
const overlay = document.getElementById('overlay');
const form = document.getElementById('wish-form');

let deleteId = null;

// Get wishes from localStorage
function getWishes() {
    const data = localStorage.getItem('teamWishes');
    return data ? JSON.parse(data) : [];
}

// Save wishes to localStorage
function saveWishes(wishes) {
    localStorage.setItem('teamWishes', JSON.stringify(wishes));
}

// Create a new wish
function createWish(name, wish) {
    const wishes = getWishes();
    const newId = wishes.length > 0 ? Math.max(...wishes.map(w => w.id)) + 1 : 1;
    wishes.push({ id: newId, name, wish });
    saveWishes(wishes);
    load();
}

// Update an existing wish
function updateWish(id, name, wish) {
    let wishes = getWishes();
    wishes = wishes.map(w => w.id === id ? { id, name, wish } : w);
    saveWishes(wishes);
    load();
}

// Delete a wish
function deleteWish(id) {
    let wishes = getWishes();
    wishes = wishes.filter(w => w.id !== id);
    saveWishes(wishes);
    load();
}

// Load and render wishes
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

// Form submission
form.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('wish-id').value;
    const name = document.getElementById('name').value;
    const wish = document.getElementById('wish').value;
    
    if (id) {
        updateWish(parseInt(id), name, wish);
    } else {
        createWish(name, wish);
    }
    
    closeModals();
};

// Delete confirmation
document.getElementById('confirm-delete').onclick = () => {
    if (deleteId) {
        deleteWish(deleteId);
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
    return str ? str.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
}

function unesc(str) {
    return str ? str.replace(/\\'/g, "'").replace(/\\\"/g, '"') : '';
}

// Initial load
load();
