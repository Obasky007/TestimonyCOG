let testimonies = [];
let visibleTestimonies = [];

function loadJSON(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(new Error(`Unable to load ${url}`));
            }
        };
        xhr.onerror = () => reject(new Error(`Unable to load ${url}`));
        xhr.send();
    });
}

async function loadTestimonies() {
    const grid = document.querySelector('#storyGrid');

    if (!grid) return;

    try {
        let data = null;
        const inlineData = document.querySelector('#storyData');

        if (inlineData) {
            data = JSON.parse(inlineData.textContent);
        } else {
            const response = await fetch('./data/testimonies.json', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Unable to load testimonies.json (${response.status})`);
            }
            data = await response.json();
        }

        if (!data || !Array.isArray(data.testimonies)) {
            throw new Error('Invalid testimonies.json structure');
        }

        testimonies = data.testimonies;
        visibleTestimonies = testimonies;

        renderStories();
    } catch (error) {
        console.error('Failed to load testimonies:', error);

        grid.innerHTML = `
            <p class="empty-story-state">
                Unable to load testimonies.
            </p>
        `;
    }
}

function displayCategory(category) {
    return category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function previewText(text) {
    const words = text.split(/\s+/);
    const previewWords = words.slice(0, 15);
    return `${previewWords.join(' ')}${words.length > 15 ? '…' : ''}`;
}

function renderStories(filter = 'all') {
    const grid = document.querySelector('#storyGrid');
    if (!grid) return;
    const visible = filter === 'all' ? testimonies : testimonies.filter((story) => story.category === filter);
    visibleTestimonies = visible;

    if (!visible.length) {
        grid.innerHTML = '<p class="empty-story-state">There is nothing here at the moment</p>';
        return;
    }

    grid.innerHTML = visible.map((story, index) => `
        <article class="story-card" data-story-index="${index}" role="button" tabindex="0" aria-label="Read testimony">
            <span class="card-category">${displayCategory(story.category)}</span>
            <h3>${story.title}</h3>
            <p>${previewText(story.testimony)}</p>
            <small>${story.name}</small>
            <button class="read-more" type="button">Read more <span aria-hidden="true">&rarr;</span></button>
        </article>
    `).join('');
}

function setupStoryModal() {
    const grid = document.querySelector('#storyGrid');
    const modal = document.querySelector('#storyModal');
    if (!grid || !modal) return;

    const closeButton = modal.querySelector('.modal-close');
    const previousButton = modal.querySelector('.modal-previous');
    const nextButton = modal.querySelector('.modal-next');
    let activeStoryIndex = 0;

    const displayStory = (story) => {
        if (!story) return;
        modal.querySelector('.modal-category').textContent = displayCategory(story.category);
        modal.querySelector('.modal-title').textContent = story.title;
        modal.querySelector('.modal-story').textContent = story.testimony;
        modal.querySelector('.modal-name').textContent = story.name;
        modal.querySelector('.modal-department').textContent = '';
        modal.querySelector('.modal-location').textContent = '';
    };
    const openStory = (card) => {
        const storyIndex = Number(card.dataset.storyIndex);
        if (storyIndex < 0 || storyIndex >= visibleTestimonies.length) return;
        activeStoryIndex = storyIndex;
        displayStory(visibleTestimonies[activeStoryIndex]);
        modal.hidden = false;
        document.body.classList.add('modal-open');
        closeButton.focus();
    };
    const moveStory = (step) => {
        activeStoryIndex = (activeStoryIndex + step + visibleTestimonies.length) % visibleTestimonies.length;
        displayStory(visibleTestimonies[activeStoryIndex]);
    };
    const closeStory = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
    };

    grid.addEventListener('click', (event) => {
        const card = event.target.closest('.story-card');
        if (card) openStory(card);
    });
    grid.addEventListener('keydown', (event) => {
        const card = event.target.closest('.story-card');
        if (card && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openStory(card);
        }
    });
    closeButton.addEventListener('click', closeStory);
    previousButton.addEventListener('click', () => moveStory(-1));
    nextButton.addEventListener('click', () => moveStory(1));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeStory();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) closeStory();
        if (event.key === 'ArrowLeft' && !modal.hidden) moveStory(-1);
        if (event.key === 'ArrowRight' && !modal.hidden) moveStory(1);
    });
}

function setupMenu() {
    const header = document.querySelector('#siteHeader');
    const button = header.querySelector('.menu-toggle');
    const menu = document.querySelector('#mobileNav');
    const closeMenu = () => {
        menu.classList.remove('open');
        header.classList.remove('menu-open');
        button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = header.classList.toggle('menu-open');
        menu.classList.toggle('open', open);
        button.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) {
            closeMenu();
        }
    });
}

function setupHeader() {
    const header = document.querySelector('#siteHeader');
    const hero = document.querySelector('.hero');
    const collapsePoint = hero ? window.innerHeight * .72 : 120;
    const updateHeader = () => header.classList.toggle('past-hero', window.scrollY > collapsePoint);

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
}

function setupFilters() {
    document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        renderStories(button.dataset.filter);
    }));
}

function setupLocations() {
    const tabs = document.querySelectorAll('.location-tab');
    const maps = document.querySelectorAll('.location-map');
    if (!tabs.length || !maps.length) return;

    tabs.forEach((tab) => tab.addEventListener('click', () => {
        const location = tab.dataset.location;
        tabs.forEach((item) => {
            const isActive = item === tab;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
        });
        maps.forEach((map) => map.classList.toggle('active', map.dataset.map === location));
    }));
}

function setupForm() {
    const form = document.querySelector('#testimonyForm');
    if (!form) return;
    const success = document.querySelector('#successMessage');
    const submitButton = form.querySelector('button[type="submit"]');
    const formStatus = document.querySelector('#formStatus');
    const file = form.querySelector('input[type="file"]');
    const uploadField = document.querySelector('#uploadField');
    const uploadPreview = document.querySelector('#uploadPreview');
    const uploadError = document.querySelector('#uploadError');
    let previewUrl = '';

    const clearPreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = '';
        uploadPreview.innerHTML = '';
        uploadPreview.hidden = true;
        uploadField.classList.remove('has-file');
    };
    const showFile = (selectedFile) => {
        uploadError.hidden = true;
        if (!selectedFile) {
            clearPreview();
            return;
        }
        if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
            file.value = '';
            clearPreview();
            uploadError.textContent = 'Please choose an image or video file.';
            uploadError.hidden = false;
            return;
        }
        if (selectedFile.size > 25 * 1024 * 1024) {
            file.value = '';
            clearPreview();
            uploadError.textContent = 'That file is larger than 25MB. Please choose a smaller file.';
            uploadError.hidden = false;
            return;
        }
        clearPreview();
        previewUrl = URL.createObjectURL(selectedFile);
        const preview = selectedFile.type.startsWith('video/') ? document.createElement('video') : document.createElement('img');
        preview.src = previewUrl;
        preview.controls = selectedFile.type.startsWith('video/');
        preview.alt = selectedFile.name;
        uploadPreview.append(preview);
        uploadPreview.hidden = false;
        uploadField.classList.add('has-file');
    };

    file.addEventListener('change', () => showFile(file.files[0]));
    ['dragenter', 'dragover'].forEach((eventName) => uploadField.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadField.classList.add('is-dragging');
    }));
    ['dragleave', 'drop'].forEach((eventName) => uploadField.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadField.classList.remove('is-dragging');
    }));
    uploadField.addEventListener('drop', (event) => {
        const droppedFile = event.dataTransfer.files[0];
        if (!droppedFile) return;
        file.files = event.dataTransfer.files;
        showFile(droppedFile);
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity() || submitButton.disabled) return;

        const originalButtonText = submitButton.innerHTML;
        const formData = new FormData(form);
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting...';
        formStatus.hidden = true;

        fetch(form.action, {
            method: 'POST',
            body: formData
        })
            .then(async (response) => {
                if (!response.ok) {
                    const result = await response.json().catch(() => ({}));
                    throw new Error(result.message || 'Submission failed.');
                }
                form.reset();
                clearPreview();
                uploadError.hidden = true;
                form.hidden = true;
                success.hidden = false;
                document.body.classList.add('submission-open');
            })
            .catch((error) => {
                formStatus.textContent = error.message || 'Something went wrong. Please try again.';
                formStatus.className = 'form-status error';
                formStatus.hidden = false;
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
    });
    document.querySelector('#resetForm').addEventListener('click', () => {
        form.reset();
        clearPreview();
        uploadError.hidden = true;
        form.hidden = false;
        success.hidden = true;
        document.body.classList.remove('submission-open');
    });
}

function setupFooterDate() {
    const year = document.querySelector('#currentYear');
    if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTestimonies();
    setupMenu();
    setupHeader();
    setupFilters();
    setupStoryModal();
    setupLocations();
    setupForm();
    setupFooterDate();
});
