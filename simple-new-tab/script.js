document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const searchInput = document.getElementById('search-input');
    const shortcutsGrid = document.getElementById('shortcuts-grid');
    
    // Shortcut Dialog
    const addDialog = document.getElementById('add-dialog');
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    const cancelBtn = document.getElementById('cancel-add');
    const confirmBtn = document.getElementById('confirm-add');

    // Background Dialog
    const customizeBtn = document.getElementById('customize-btn');
    const bgDialog = document.getElementById('bg-dialog');
    const bgUpload = document.getElementById('bg-upload');
    const resetBgBtn = document.getElementById('reset-bg');
    const closeBgBtn = document.getElementById('close-bg');

    // --- 1. Search Functionality ---
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            let query = searchInput.value.trim();
            if (query) {
                if (!query.match(/^https?:\/\//) && query.includes('.') && !query.includes(' ')) {
                    query = 'http://' + query;
                    window.location.href = query;
                } else {
                    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                }
            }
        }
    });

    // --- 2. IndexedDB for Background Image (Lazy Loading & Large File Support) ---
    const DB_NAME = 'NewTabDB';
    const STORE_NAME = 'settings';

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async function setBackgroundInDB(file) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(file, 'backgroundImage');
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async function getBackgroundFromDB() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('backgroundImage');
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async function deleteBackgroundFromDB() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete('backgroundImage');
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    function applyBackground(blob) {
        if (blob && blob instanceof Blob) {
            const objectURL = URL.createObjectURL(blob);
            document.body.style.backgroundImage = `url('${objectURL}')`;
            document.body.classList.add('has-custom-bg');
        } else {
            document.body.style.backgroundImage = '';
            document.body.classList.remove('has-custom-bg');
        }
    }

    // Initialize Background (Lazy Load)
    // We use requestAnimationFrame to ensure main UI renders first
    requestAnimationFrame(async () => {
        try {
            const bgBlob = await getBackgroundFromDB();
            if (bgBlob) {
                applyBackground(bgBlob);
            }
        } catch (e) {
            console.error('Failed to load background', e);
        }
    });

    // --- 3. Background Settings Logic ---
    customizeBtn.addEventListener('click', () => {
        bgDialog.classList.remove('hidden');
    });

    closeBgBtn.addEventListener('click', () => {
        bgDialog.classList.add('hidden');
    });

    // Close on background click
    bgDialog.addEventListener('click', (e) => {
        if (e.target === bgDialog) bgDialog.classList.add('hidden');
    });

    bgUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await setBackgroundInDB(file);
                applyBackground(file);
            } catch (err) {
                console.error('Error saving background:', err);
                alert('Failed to save background image.');
            }
        }
    });

    resetBgBtn.addEventListener('click', async () => {
        try {
            await deleteBackgroundFromDB();
            applyBackground(null);
            bgUpload.value = ''; // clear input
        } catch (err) {
            console.error('Error resetting background:', err);
        }
    });


    // --- 4. Shortcuts Management (Existing Logic) ---
    const DEFAULT_SHORTCUTS = [
        { name: 'Gmail', url: 'https://mail.google.com' },
        { name: 'YouTube', url: 'https://www.youtube.com' }
    ];
    let shortcuts = [];

    function getFaviconUrl(u) {
        try {
            const domain = new URL(u).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=48`;
        } catch (e) {
            return 'https://www.google.com/s2/favicons?domain=google.com&sz=48';
        }
    }

    function renderShortcuts() {
        shortcutsGrid.innerHTML = '';
        shortcuts.forEach(shortcut => {
            const el = document.createElement('div');
            el.className = 'shortcut-item';
            el.title = shortcut.name;
            el.onclick = () => window.location.href = shortcut.url;
            el.innerHTML = `
                <div class="shortcut-icon-circle">
                    <img src="${getFaviconUrl(shortcut.url)}" alt="${shortcut.name}">
                </div>
                <div class="shortcut-title">${shortcut.name}</div>
            `;
            shortcutsGrid.appendChild(el);
        });

        const addBtn = document.createElement('div');
        addBtn.className = 'shortcut-item add-shortcut-btn';
        addBtn.onclick = openAddDialog;
        addBtn.innerHTML = `
            <div class="shortcut-icon-circle">
                <span class="material-symbols-outlined add-shortcut-icon">add</span>
            </div>
            <div class="shortcut-title">Add shortcut</div>
        `;
        shortcutsGrid.appendChild(addBtn);
    }

    function loadShortcuts() {
        chrome.storage.sync.get(['shortcuts'], (result) => {
            if (result.shortcuts) {
                shortcuts = result.shortcuts;
            } else {
                shortcuts = DEFAULT_SHORTCUTS;
                chrome.storage.sync.set({ shortcuts });
            }
            renderShortcuts();
        });
    }

    function openAddDialog() {
        nameInput.value = '';
        urlInput.value = '';
        confirmBtn.disabled = true;
        addDialog.classList.remove('hidden');
        nameInput.focus();
    }

    function closeAddDialog() {
        addDialog.classList.add('hidden');
    }

    function saveShortcut() {
        const name = nameInput.value.trim();
        let url = urlInput.value.trim();
        if (name && url) {
            if (!url.match(/^https?:\/\//)) url = 'http://' + url;
            shortcuts.push({ name, url });
            chrome.storage.sync.set({ shortcuts }, () => {
                renderShortcuts();
                closeAddDialog();
            });
        }
    }

    function validateInputs() {
        confirmBtn.disabled = !(nameInput.value.trim() && urlInput.value.trim());
    }

    cancelBtn.addEventListener('click', closeAddDialog);
    confirmBtn.addEventListener('click', saveShortcut);
    addDialog.addEventListener('click', (e) => {
        if (e.target === addDialog) closeAddDialog();
    });
    nameInput.addEventListener('input', validateInputs);
    urlInput.addEventListener('input', validateInputs);

    loadShortcuts();
});
