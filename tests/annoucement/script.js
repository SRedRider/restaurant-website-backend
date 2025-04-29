// Function to fetch and display all announcements
async function fetchAnnouncements() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/announcements', {
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
        const response = await fetch(`http://localhost:3000/api/v1/announcements/${announcementId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcement details');
        }

        const announcement = await response.json();
        const modalBody = document.getElementById('announcementDetails');

        modalBody.innerHTML = `
            <p><strong>ID:</strong> ${announcement.id}</p>
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
        const response = await fetch(`http://localhost:3000/api/v1/announcements/${announcementId}`, {
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
        const response = await fetch(`http://localhost:3000/api/v1/announcements/${announcementId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcement details');
        }

        const announcement = await response.json();

        document.getElementById('editAnnouncementTitle').value = announcement.title;
        document.getElementById('editAnnouncementContent').value = announcement.content;
        document.getElementById('editAnnouncementForm').dataset.announcementId = announcementId;
    } catch (error) {
        console.error('Error populating edit announcement modal:', error);
    }
}

// Function to handle the edit announcement form submission
document.getElementById('editAnnouncementForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const announcementId = this.dataset.announcementId;
    const updatedAnnouncement = {
        title: document.getElementById('editAnnouncementTitle').value,
        content: document.getElementById('editAnnouncementContent').value,
    };

    try {
        const response = await fetch(`http://localhost:3000/api/v1/announcements/${announcementId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedAnnouncement),
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
document.getElementById('addAnnouncementForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const newAnnouncement = {
        title: document.getElementById('addAnnouncementTitle').value,
        content: document.getElementById('addAnnouncementContent').value,
    };

    try {
        const response = await fetch('http://localhost:3000/api/v1/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newAnnouncement),
        });

        console.log('Response:', response); // Log the response for debugging
        console.log('New Announcement:', newAnnouncement); // Log the new announcement for debugging
        if (!response.ok) {
            throw new Error('Failed to add announcement');
        }

        alert('Announcement added successfully');
        fetchAnnouncements();

        const addAnnouncementModal = bootstrap.Modal.getInstance(document.getElementById('addAnnouncementModal'));
        addAnnouncementModal.hide();
    } catch (error) {
        console.error('Error adding announcement:', error);
    }
});

// Initialize the announcements table on page load
document.addEventListener('DOMContentLoaded', fetchAnnouncements);