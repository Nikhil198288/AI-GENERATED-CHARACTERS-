// Application Logic for Character Upload and Gallery Management

// Variables
let selectedFile = null;
let uploadedCharacters = [];

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const charNameInput = document.getElementById('charName');
const charCategoryInput = document.getElementById('charCategory');
const charDescriptionInput = document.getElementById('charDescription');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const previewImage = document.getElementById('previewImage');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const previewInfo = document.getElementById('previewInfo');
const galleryGrid = document.getElementById('galleryGrid');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalInfo = document.getElementById('modalInfo');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Drag & Drop Event Listeners
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect({ target: { files } });
    }
});

// Handle File Selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }

    selectedFile = file;
    uploadBtn.disabled = false;

    // Read and display preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            displayPreview(e.target.result, file, img.width, img.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Display Preview
function displayPreview(src, file, width, height) {
    previewImage.src = src;
    previewImage.style.display = 'block';
    previewPlaceholder.style.display = 'none';

    document.getElementById('infoFileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';
    document.getElementById('infoDimensions').textContent = width + ' × ' + height + ' px';
    document.getElementById('infoType').textContent = file.type;

    previewInfo.style.display = 'block';
}

// Upload Image
function uploadImage() {
    if (!selectedFile) {
        showError('Please select an image');
        return;
    }

    const name = charNameInput.value.trim();
    const category = charCategoryInput.value;
    const description = charDescriptionInput.value.trim();

    if (!name) {
        showError('Please enter character name');
        return;
    }

    // Show progress bar
    progressBar.classList.add('show');
    progressFill.style.width = '0%';

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
    }, 200);

    // Read file and create character object
    const reader = new FileReader();
    reader.onload = (e) => {
        clearInterval(interval);
        progressFill.style.width = '100%';

        const character = {
            id: Date.now(),
            name: name,
            category: category,
            description: description,
            image: e.target.result,
            uploadedAt: new Date().toISOString()
        };

        // Save to localStorage
        uploadedCharacters.push(character);
        localStorage.setItem('uploadedCharacters', JSON.stringify(uploadedCharacters));

        // Complete upload with delay
        setTimeout(() => {
            progressBar.classList.remove('show');
            progressFill.style.width = '0%';
            showSuccess('Character uploaded successfully!');
            resetUploadForm();
            renderGallery();
        }, 500);
    };
    reader.readAsDataURL(selectedFile);
}

// Reset Form
function resetUploadForm() {
    fileInput.value = '';
    charNameInput.value = '';
    charDescriptionInput.value = '';
    charCategoryInput.value = 'fantasy';
    uploadBtn.disabled = true;

    previewImage.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    previewInfo.style.display = 'none';

    selectedFile = null;
}

// Render Gallery
function renderGallery() {
    if (uploadedCharacters.length === 0) {
        galleryGrid.innerHTML = '<div class="empty-message">No characters uploaded yet. Start by uploading your first character image!</div>';
        return;
    }

    galleryGrid.innerHTML = uploadedCharacters.map((char, index) => `
        <div class="gallery-item">
            <img src="${char.image}" class="gallery-image" alt="${char.name}">
            <div class="gallery-info">
                <div class="gallery-name">${escapeHtml(char.name)}</div>
                <div class="gallery-category">${char.category.toUpperCase()}</div>
                <div class="gallery-actions">
                    <button class="gallery-btn" onclick="viewImage(${index})">👁️ View</button>
                    <button class="gallery-btn" onclick="deleteCharacter(${index})">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// View Image in Modal
function viewImage(index) {
    const char = uploadedCharacters[index];
    modalImage.src = char.image;
    modalInfo.innerHTML = `
        <h3 style="color: #00e5ff; margin-bottom: 10px;">${escapeHtml(char.name)}</h3>
        <p style="color: #cfd8dc; margin-bottom: 10px;">${escapeHtml(char.description)}</p>
        <p style="color: #999; font-size: 12px;">Category: ${char.category.toUpperCase()}</p>
        <p style="color: #999; font-size: 12px;">Uploaded: ${new Date(char.uploadedAt).toLocaleString()}</p>
    `;
    imageModal.classList.add('show');
}

// Close Modal
function closeModal() {
    imageModal.classList.remove('show');
}

// Delete Character
function deleteCharacter(index) {
    if (confirm('Are you sure you want to delete this character?')) {
        uploadedCharacters.splice(index, 1);
        localStorage.setItem('uploadedCharacters', JSON.stringify(uploadedCharacters));
        showSuccess('Character deleted!');
        renderGallery();
    }
}

// Show Success Message
function showSuccess(message) {
    successMessage.textContent = '✓ ' + message;
    successMessage.classList.add('show');
    setTimeout(() => successMessage.classList.remove('show'), 3000);
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = '✗ ' + message;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 3000);
}

// Load Characters from localStorage
function loadCharacters() {
    const saved = localStorage.getItem('uploadedCharacters');
    if (saved) {
        try {
            uploadedCharacters = JSON.parse(saved);
            renderGallery();
        } catch (e) {
            console.error('Error loading characters:', e);
            uploadedCharacters = [];
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === imageModal) {
        closeModal();
    }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCharacters);
} else {
    loadCharacters();
}