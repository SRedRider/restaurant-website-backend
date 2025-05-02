async function fetchReservations() {
        try {
            const response = await fetch('https://10.120.32.59/app/api/v1/reservations/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reservations');
            }

            const reservations = await response.json();
            const tbody = document.getElementById('ReservationsBody');
            tbody.innerHTML = '';

            reservations.forEach(reservation => {
                // Format the date to DD.MM.YYYY for display
                const formattedDate = new Date(reservation.date).toLocaleDateString('fi-FI');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reservation.reservation_id}</td>
                    <td>${reservation.name}</td>
                    <td>${reservation.phone}</td>
                    <td>${reservation.email}</td>
                    <td>${reservation.guest_count}</td>
                    <td>${formattedDate}</td>
                    <td>${reservation.time}</td>
                    <td>${reservation.notes || ''}</td>
                    <td>${reservation.allocated_tables}</td>
                    <td>
                        <button class="btn btn-primary view-reservation" onclick="viewReservationDetails(${reservation.reservation_id})" data-bs-toggle="modal" data-bs-target="#reservationModal">View</button>
                        <button class="btn btn-secondary edit-reservation" onclick="populateEditReservationModal(${reservation.reservation_id})" data-bs-toggle="modal" data-bs-target="#editReservationModal">Edit</button>
                        <button class="btn btn-danger edit-reservation" onclick="showDeleteConfirmationModal(${reservation.reservation_id})" data-bs-toggle="modal" data-bs-target="#deleteReservationModal">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            initializeTable('#ReservationsTable', 5);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
};



async function fetchTables() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/reservations/tables', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tables');
        }

        const tables = await response.json();
        const tbody = document.getElementById('TablesBody');
        tbody.innerHTML = '';

        tables.forEach(table => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${table.table_number}</td>
                <td>${table.chairs}</td>
                <td>
                    <button class="btn btn-secondary" onclick="populateEditTableModal(${table.id})" data-bs-toggle="modal" data-bs-target="#editTableModal">Edit</button>
                    <button class="btn btn-danger" onclick="showDeleteConfirmationModalTable(${table.id})" data-bs-toggle="modal" data-bs-target="#deleteTableModal">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        initializeTable('#TablesTable', 5);
    } catch (error) {
        console.error('Error fetching tables:', error);
    }
}

async function viewReservationDetails(reservationId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/reservations/${reservationId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reservation details');
        }

        const reservation = await response.json();
        const modalBody = document.getElementById('reservationDetails');

        // Use the already formatted date (DD.MM.YYYY)
        const formattedDate = new Date(reservation.date).toLocaleDateString('fi-FI');

        modalBody.innerHTML = `
            <p><strong>Reservation ID:</strong> ${reservation.reservation_id}</p>
            <p><strong>Name:</strong> ${reservation.name}</p>
            <p><strong>Phone:</strong> ${reservation.phone}</p>
            <p><strong>Email:</strong> ${reservation.email}</p>
            <p><strong>Guest Count:</strong> ${reservation.guest_count}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${reservation.time}</p>
            <p><strong>Notes:</strong> ${reservation.notes || ''}</p>
        `;
    } catch (error) {
        console.error('Error fetching reservation details:', error);
    }
}

async function populateEditReservationModal(reservationId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/reservations/${reservationId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reservation details');
        }

        const reservation = await response.json();

        document.getElementById('editName').value = reservation.name;
        document.getElementById('editPhone').value = reservation.phone;
        document.getElementById('editEmail').value = reservation.email;
        document.getElementById('editGuestCount').value = reservation.guest_count;

        // Use the ISO 8601 date format directly for input field
        document.getElementById('editDate').value = reservation.date;

        document.getElementById('editTime').value = reservation.time;
        document.getElementById('editNotes').value = reservation.notes || '';

        document.getElementById('editReservationForm').dataset.reservationId = reservationId;
    } catch (error) {
        console.error('Error populating edit reservation modal:', error);
    }
}

document.getElementById('editReservationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const reservationId = this.dataset.reservationId;

    const updatedReservation = {
        name: document.getElementById('editName').value,
        phone: document.getElementById('editPhone').value,
        email: document.getElementById('editEmail').value,
        guest_count: parseInt(document.getElementById('editGuestCount').value, 10),
        date: document.getElementById('editDate').value,
        time: document.getElementById('editTime').value,
        notes: document.getElementById('editNotes').value
    };

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/reservations/${reservationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedReservation)
        });

        if (!response.ok) {
            throw new Error('Failed to update reservation');
        }
        console.log('Updated Reservation:', JSON.stringify(updatedReservation, null, 2));


        console.log('Reservation successfully updated!');

        fetchReservations(); // Refresh the reservations list
        

        const editReservationModal = bootstrap.Modal.getInstance(document.getElementById('editReservationModal'));
        editReservationModal.hide();
    } catch (error) {
        console.error('Error updating reservation:', error.message);
    }
});

async function populateEditTableModal(tableId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/reservations/tables/${tableId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch table details');
        }

        const table = await response.json();

        document.getElementById('editTableName').value = table.table_number;
        document.getElementById('editTableChairs').value = table.chairs;
        document.getElementById('editTableForm').dataset.tableId = tableId;
    } catch (error) {
        console.error('Error populating edit table modal:', error);
    }
}

document.getElementById('editTableForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const tableId = this.dataset.tableId;

    const updatedTable = {
        table_number: document.getElementById('editTableName').value,
        chairs: parseInt(document.getElementById('editTableChairs').value, 10)
    };

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/reservations/tables/${tableId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedTable)
        });

        showToast('Table updated successfully!', 'success');

        if (!response.ok) {
            throw new Error('Failed to update table');
        }

        const editTableModal = bootstrap.Modal.getInstance(document.getElementById('editTableModal'));
        editTableModal.hide();

        fetchTables(); // Refresh the tables list
    } catch (error) {
        console.error('Error updating table:', error);
        alert('An error occurred while updating the table');
    }
});

// Add a new table
async function addTable() {
    const chairs = document.getElementById('addTableChairs').value;

    if (!chairs) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    const newTable = {
        chairs: parseInt(chairs, 10)
    };

    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/reservations/tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(newTable)
        });

        if (!response.ok) {
            throw new Error('Failed to add table');
        }

        showToast('Table added successfully!', 'success');
        fetchTables(); // Refresh the tables list

        const addTableModal = bootstrap.Modal.getInstance(document.getElementById('addTableModal'));
        addTableModal.hide();
    } catch (error) {
        console.error('Error adding table:', error);
        alert('An error occurred while adding the table');
    }
}

document.getElementById('addTableForm').addEventListener('submit', function (event) {
    event.preventDefault();
    addTable();
});

// Show the delete confirmation modal and handle the delete action
function showDeleteConfirmationModal(reservationId) {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteReservationConfirmationModal'));
    const confirmDeleteButton = document.getElementById('confirmReservationDeleteButton');

    confirmDeleteButton.onclick = async function () {
        try {
            const response = await fetch(`https://10.120.32.59/app/api/v1/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete reservation');
            } else {
                showToast('Reservation deleted successfully!');
                fetchReservations(); // Refresh the reservations list
            }
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('An error occurred while deleting the reservation');
        } finally {
            deleteModal.hide();
        }
    };

    deleteModal.show();
}

// Show the delete confirmation modal and handle the delete action for tables
function showDeleteConfirmationModalTable(tableId) {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const deleteTableError = document.getElementById('deleteTableError');
    deleteTableError.innerHTML = ''; // Clear any previous error message
    confirmDeleteButton.onclick = async function () {
        try {
            const response = await fetch(`https://10.120.32.59/app/api/v1/reservations/tables/${tableId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
            });

            const result = await response.json(); // Assuming the response is JSON

            if (!response.ok) {
                if (result.message === 'Table is currently allocated in a reservation and cannot be deleted') {
                    deleteTableError.innerHTML = result.message;
                    return;
                } else {
                    throw new Error('Failed to delete table');
                }
            } else {
                showToast('Table deleted successfully!');
                fetchTables(); // Refresh the tables list
                deleteModal.hide();
            }
        } catch (error) {
            console.error('Error deleting table:', error);
        } finally {
           // deleteModal.hide();
        }
    };

    deleteModal.show();
}




async function initializeTable(tableId, pageSize) {
    $(tableId).bootstrapTable({
        search: true,
        pagination: true,
        pageSize: pageSize,
        sortable: true,
        filterControl: true
    });
}

async function fetchAvailableDays() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/reservations/available-days', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch available days');
        }

        const { data } = await response.json();
        const tbody = document.getElementById('AvailableDaysBody');
        tbody.innerHTML = '';

        data.forEach(day => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${day.date}</td>
                <td>${day.remainingChairs}</td>
                <td>${day.allocatedTables}</td>
                <td>${day.status}</td>
            `;
            tbody.appendChild(row);
        });

        initializeTable('#AvailableDaysTable', 5);
    } catch (error) {
        console.error('Error fetching available days:', error);
    }
}

function showToast(message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

document.addEventListener('DOMContentLoaded', function() {
    fetchReservations();
    fetchTables();
    fetchAvailableDays();
});
