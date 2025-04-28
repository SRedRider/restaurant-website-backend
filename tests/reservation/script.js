document.addEventListener('DOMContentLoaded', async () => {
    const fetchReservations = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/reservations/', {
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
                        <button class="btn btn-danger edit-reservation" onclick="deleteReservation(${reservation.reservation_id})" data-bs-toggle="modal" data-bs-target="#deleteReservationModal">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            initializeTable('#ReservationsTable', 5);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    };

    await fetchReservations();
    await fetchTables();
});

async function fetchTables() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/reservations/tables', {
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
                <td>${table.id}</td>
                <td>${table.table_number}</td>
                <td>${table.chairs}</td>
                <td>
                    <button class="btn btn-secondary" onclick="populateEditTableModal(${table.id})" data-bs-toggle="modal" data-bs-target="#editTableModal">Edit</button>
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
        const response = await fetch(`http://localhost:3000/api/v1/reservations/${reservationId}`, {
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
        const response = await fetch(`http://localhost:3000/api/v1/reservations/${reservationId}`, {
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
        const response = await fetch(`http://localhost:3000/api/v1/reservations/${reservationId}`, {
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
        

        const editReservationModal = bootstrap.Modal.getInstance(document.getElementById('editReservationModal'));
        editReservationModal.hide();
    } catch (error) {
        console.error('Error updating reservation:', error.message);
    }
});

async function populateEditTableModal(tableId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/reservations/tables/${tableId}`, {
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
        const response = await fetch(`http://localhost:3000/api/v1/reservations/tables/${tableId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedTable)
        });

        console.log('Updated Table:', JSON.stringify(updatedTable, null, 2));

        if (!response.ok) {
            throw new Error('Failed to update table');
        }

        alert('Table updated successfully');
        location.reload(); // Refresh the page to update the table list
    } catch (error) {
        console.error('Error updating table:', error);
        alert('An error occurred while updating the table');
    }
});

async function initializeTable(tableId, pageSize) {
    $(tableId).bootstrapTable({
        search: true,
        pagination: true,
        pageSize: pageSize,
        sortable: true,
        filterControl: true
    });
}