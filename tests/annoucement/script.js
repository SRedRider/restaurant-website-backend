// Function to fetch and display all announcements
async function fetchAnnouncements() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/announcements', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcements');
        }

        const announcements = await response.json();
        const tbody = document.getElementById('AnnouncementsBody');
        tbody.innerHTML = '';

        announcements.forEach(announcement => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${announcement.id}</td>
                <td>${announcement.title}</td>
                <td>${announcement.content}</td>
                <td>${announcement.image_url ? `<img src="https://10.120.32.59/app${announcement.image_url}" alt="Image" style="width: 50px; height: 50px;">` : 'No Image'}</td>
                <td>${new Date(announcement.created_at).toLocaleString('fi-FI')}</td>
                <td>${new Date(announcement.updated_at).toLocaleString('fi-FI')}</td>
                <td>
                    <button class="btn btn-primary view-announcement" onclick="viewAnnouncementDetails(${announcement.id})" data-bs-toggle="modal" data-bs-target="#announcementModal">View</button>
                    <button class="btn btn-secondary edit-announcement" onclick="populateEditAnnouncementModal(${announcement.id})" data-bs-toggle="modal" data-bs-target="#editAnnouncementModal">Edit</button>
                    <button class="btn btn-danger delete-announcement" onclick="deleteAnnouncement(${announcement.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        initializeTable('#AnnouncementsTable', 5);
    } catch (error) {
        console.error('Error fetching announcements:', error);
    }
}

// Function to view announcement details
async function viewAnnouncementDetails(announcementId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcement details');
        }

        const announcement = await response.json();
        const modalBody = document.getElementById('announcementDetails');

        modalBody.innerHTML = `
            <p><strong>ID:</strong> ${announcement.id}</p>
            <div class="row mb-4">
                <!-- Image in the center -->
                <div class="col-md-12 text-center mb-3">
                    <img src="https://10.120.32.59/app${announcement.image_url}" alt="${announcement.name}" class="img-fluid rounded" style="max-height: 300px;">
                </div>
            </div>
            <p><strong>Title:</strong> ${announcement.title}</p>
            <p><strong>Content:</strong> ${announcement.content}</p>
            <p><strong>Created At:</strong> ${new Date(announcement.created_at).toLocaleString('fi-FI')}</p>
            <p><strong>Updated At:</strong> ${new Date(announcement.updated_at).toLocaleString('fi-FI')}</p>
        `;
    } catch (error) {
        console.error('Error fetching announcement details:', error);
    }
}

// Function to delete an announcement
async function deleteAnnouncement(announcementId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete announcement');
        }

        alert('Announcement deleted successfully');
        fetchAnnouncements();
    } catch (error) {
        console.error('Error deleting announcement:', error);
    }
}

// Function to populate the edit announcement modal
async function populateEditAnnouncementModal(announcementId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcement details');
        }

        const announcement = await response.json();

        document.getElementById('editAnnouncementTitle').value = announcement.title;
        tinymce.get('editAnnouncementContent').setContent(announcement.content);
        document.getElementById('editAnnouncementForm').dataset.announcementId = announcementId;

         // Image Handling
     const imagePreviewContainer = document.getElementById('editAnnouncementImagePreviewContainer');
     const imagePreview = document.getElementById('editAnnouncementImagePreview');
     const imageHeading = document.getElementById('editAnnouncementImageHeading');
     const removeImageButton = document.getElementById('removeAnnouncementImageButton');

     if (announcement.image_url) {
         imagePreview.src = `https://10.120.32.59/app${announcement.image_url}`;
         imagePreviewContainer.style.display = 'block';
         imageHeading.innerText = 'Original Image';
         removeImageButton.style.display = 'none';
     } else {
         imagePreviewContainer.style.display = 'none';
         removeImageButton.style.display = 'none';
     }

     const imageInput = document.getElementById('editAnnouncementImage');
     imageInput.addEventListener('change', function () {
         const file = imageInput.files[0];
         if (file) {
             const reader = new FileReader();
             reader.onload = function (e) {
                 imagePreview.src = e.target.result;
                 imagePreviewContainer.style.display = 'block';
                 imageHeading.innerText = 'New Image';
                 removeImageButton.style.display = 'inline-block';
             };
             reader.readAsDataURL(file);
         } else {
             imagePreview.src = `https://10.120.32.59/app${announcement.image_url}`;
             imagePreviewContainer.style.display = 'block';
             imageHeading.innerText = 'Original Image';
             removeImageButton.style.display = 'none';
         }
     });

     removeImageButton.addEventListener('click', function () {
         imagePreview.src = `https://10.120.32.59/app${announcement.image_url}`;
         imagePreviewContainer.style.display = 'block';
         imageHeading.innerText = 'Original Image';
         removeImageButton.style.display = 'none';
         imageInput.value = '';
     });

    } catch (error) {
        console.error('Error populating edit announcement modal:', error);
    }
}

// Function to handle the edit announcement form submission
const editAnnouncementForm = document.getElementById('editAnnouncementForm');
editAnnouncementForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const announcementId = this.dataset.announcementId;
    const formData = new FormData();
    formData.append('title', document.getElementById('editAnnouncementTitle').value);
    formData.append('content', tinymce.get('editAnnouncementContent').getContent());

    const newImage = document.getElementById('editAnnouncementImage').files[0];
    if (newImage) {
        formData.append('image', newImage);
    } else {
        formData.append('image', originalImageUrl);
    }

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to update announcement');
        }

        alert('Announcement updated successfully');
        fetchAnnouncements();

        const editAnnouncementModal = bootstrap.Modal.getInstance(document.getElementById('editAnnouncementModal'));
        editAnnouncementModal.hide();
    } catch (error) {
        console.error('Error updating announcement:', error);
    }
});

// Function to handle the add announcement form submission
const addAnnouncementForm = document.getElementById('addAnnouncementForm');
addAnnouncementForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('addAnnouncementTitle').value);
    formData.append('content', tinymce.get('addAnnouncementContent').getContent());
    const imageFile = document.getElementById('imageAnnouncement').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/announcements', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to add announcement');
        }

        alert('Announcement added successfully');
        fetchAnnouncements();

        const addAnnouncementModal = bootstrap.Modal.getInstance(document.getElementById('addAnnouncementModal'));
        addAnnouncementModal.hide();
    } catch (error) {
        console.error('Error adding announcement:', error);
        alert(`Error adding announcement: ${error.message}`);
    }
});

// Initialize the announcements table on page load
document.addEventListener('DOMContentLoaded', fetchAnnouncements);