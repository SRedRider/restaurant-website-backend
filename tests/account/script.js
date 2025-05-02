// Function to fetch and display all users
async function fetchUsers() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        const tbody = document.getElementById('UsersBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.status}</td>
                <td>${user.verified}</td>
                <td>${new Date(user.created_at).toLocaleString('fi-FI')}</td>
                <td>${new Date(user.updated_at).toLocaleString('fi-FI')}</td>
                <td>
                    <button class="btn btn-primary view-user" onclick="viewUserDetails(${user.id})" data-bs-toggle="modal" data-bs-target="#userModal">View</button>
                    <button class="btn btn-secondary edit-user" onclick="populateEditUserModal(${user.id})" data-bs-toggle="modal" data-bs-target="#editUserModal">Edit</button>
                    <button class="btn btn-danger delete-user" onclick="showDeleteConfirmationModal(${user.id})" data-bs-target="#deleteUserModal">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to view user details
async function viewUserDetails(userId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();
        const modalBody = document.getElementById('userDetails');

        modalBody.innerHTML = `
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Status:</strong> ${user.status}</p>
            <p><strong>Verified:</strong> ${user.verified}</p>
            <p><strong>Created At:</strong> ${new Date(user.created_at).toLocaleString('fi-FI')}</p>
            <p><strong>Updated At:</strong> ${new Date(user.updated_at).toLocaleString('fi-FI')}</p>
        `;
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

// Function to populate the edit user modal
async function populateEditUserModal(userId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();

        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editUserStatus').value = user.status;
        document.getElementById('editUserForm').dataset.userId = userId;
    } catch (error) {
        console.error('Error populating edit user modal:', error);
    }
}

// Function to handle the edit user form submission
const editUserForm = document.getElementById('editUserForm');
editUserForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const userId = this.dataset.userId;
    const updatedUser = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value,
    };

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            },
            body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        alert('User updated successfully!');
        fetchUsers();

        const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        editUserModal.hide();
    } catch (error) {
        console.error('Error updating user:', error);
    }
});

// Function to show delete confirmation modal
function showDeleteConfirmationModal(userId) {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');

    confirmDeleteButton.onclick = function () {
        deleteUser(userId);
    };

    deleteModal.show();
}

// Function to delete a user
async function deleteUser(userId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        alert('User deleted successfully!');
        fetchUsers();

        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
        deleteModal.hide();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Initialize the users table on page load
document.addEventListener('DOMContentLoaded', fetchUsers);