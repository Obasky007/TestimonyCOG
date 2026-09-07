const testimonies = [
    { category: 'healing', title: 'When everything changed', testimony: 'After months of waiting and praying, God answered my prayer in a way I never expected. What felt like a closed door became a reminder that God was working even in the silence.', name: 'David', department: 'Testimony', location: 'Ibadan', image: 'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=900&q=80' },
    { category: 'provision', title: 'Provision in the wilderness', testimony: 'When the rent was due and the account was empty, God showed up in an unexpected way. His provision arrived exactly when I needed it.', name: 'Grace', department: 'Women\'s Fellowship', location: 'Ado-Ekiti', image: 'https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=900&q=80' },
    { category: 'career-breakthrough', title: 'The door that finally opened', testimony: 'After seven rejections, I almost gave up. The eighth door was the one God had prepared, and it opened at the right time.', name: 'Esther', department: 'Career', location: 'Ibadan', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80' },
    { category: 'family', title: 'A home restored', testimony: 'God brought peace back into my family. Conversations that once ended in conflict became moments of grace, patience, and healing.', name: 'Michael', department: 'Family Life', location: 'Ado-Ekiti', image: 'https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?auto=format&fit=crop&w=900&q=80' },
    { category: 'restoration', title: 'Restored from the ashes', testimony: 'I had lost my work, my hope, and my sense of direction. Then God stepped in and began restoring what I thought was gone forever.', name: 'Sarah', department: 'Testimony', location: 'Ibadan', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80' },
    { category: 'salvation', title: 'Delivered from darkness', testimony: 'For years I was bound by addiction. One night at the altar, everything shifted, and I found new life in Christ.', name: 'Joseph', department: 'Men\'s Fellowship', location: 'Ado-Ekiti', image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=900&q=80' }
];

let visibleTestimonies = testimonies;
const comingSoonStory = {
    category: 'Coming soon',
    title: 'Coming soon',
    testimony: 'New testimonies will be shared here soon.',
    name: 'Coming soon',
    department: 'Coming soon',
    location: 'Coming soon'
};

function renderStories(filter = 'all') {
    const grid = document.querySelector('#storyGrid');
    if (!grid) return;
    const visible = filter === 'all' ? testimonies : testimonies.filter((story) => story.category === filter);
    visibleTestimonies = visible;
    grid.innerHTML = visible.map((story, index) => `
        <article class="story-card" data-story-index="${testimonies.indexOf(story)}" role="button" tabindex="0" aria-label="Read testimony coming soon">
            <img class="card-image" src="${story.image}" alt="" loading="lazy">
            <span class="card-category">${comingSoonStory.category}</span>
            <h3>${comingSoonStory.title}</h3>
            <p>${comingSoonStory.testimony}</p>
            <small>${comingSoonStory.name}</small>
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
        modal.querySelector('.modal-category').textContent = comingSoonStory.category;
        modal.querySelector('.modal-title').textContent = comingSoonStory.title;
        modal.querySelector('.modal-story').textContent = comingSoonStory.testimony;
        modal.querySelector('.modal-name').textContent = comingSoonStory.name;
        modal.querySelector('.modal-department').textContent = comingSoonStory.department;
        modal.querySelector('.modal-location').textContent = comingSoonStory.location;
    };
    const openStory = (card) => {
        const storyIndex = visibleTestimonies.findIndex((story) => story === testimonies[Number(card.dataset.storyIndex)]);
        if (storyIndex < 0) return;
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
    button.addEventListener('click', () => {
        const open = header.classList.toggle('menu-open');
        menu.classList.toggle('open', open);
        button.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        menu.classList.remove('open');
        document.querySelector('#siteHeader').classList.remove('menu-open');
        document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
    }));
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
    renderStories();
    setupMenu();
    setupHeader();
    setupFilters();
    setupStoryModal();
    setupLocations();
    setupForm();
    setupFooterDate();
});
