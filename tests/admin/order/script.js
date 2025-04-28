// Make viewOrderDetails globally accessible
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const order = await response.json();
        const modalBody = document.getElementById('orderDetails');

        // Ensure total_price is a number
        const totalPrice = parseFloat(order.total_price);

        // Generate items table
        const itemsTable = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.details.name}</td>
                            <td>${item.quantity}</td>
                            <td>€${item.price.toFixed(2)}</td>
                            <td>€${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Generate address section if method is delivery
        const addressSection = order.method === "pickup" ? "" : `
            <p><strong>Address:</strong> ${order.address.street}, ${order.address.postalCode}, ${order.address.city}</p>
        `;

        // Add color badges for status
        const statusBadge = {
            'processing': '<span class="badge bg-warning text-dark">Processing</span>',
            'preparing': '<span class="badge bg-primary">Preparing</span>',
            'ready': '<span class="badge bg-info text-dark">Ready</span>',
            'completed': '<span class="badge bg-success">Completed</span>'
        }[order.status] || `<span class="badge bg-secondary">${order.status}</span>`;

        modalBody.innerHTML = `
            <p><strong>Order ID:</strong> ${order.order_id}</p>
            <p><strong>Customer Name:</strong> ${order.customer_name}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            ${itemsTable}
            <p><strong>Method:</strong> ${order.method}</p>
            ${addressSection}
            <p><strong>Scheduled Time:</strong> ${order.scheduled_time}</p>
            <p><strong>Notes:</strong> ${order.notes}</p>
            <p><strong>Total Price:</strong> €${totalPrice.toFixed(2)}</p>
            <p><strong>Status:</strong> ${statusBadge}</p>
        `;
    } catch (error) {
        console.error('Error fetching order details:', error);
    }
}

// Function to populate items in the Edit Order modal
function populateEditItems(items) {
    const itemsContainer = document.getElementById('editItems');
    itemsContainer.innerHTML = ''; // Clear existing items
    items.forEach(item => addItemRow(item));
}

// Function to calculate and populate the total price
function calculateAndPopulateTotalPrice() {
    const items = Array.from(document.querySelectorAll('#editItems .item-row'));
    let totalPrice = 0;

    items.forEach(row => {
        const quantity = parseInt(row.querySelector('.item-quantity').value, 10);
        const price = parseFloat(row.querySelector('.item-price').value);
        totalPrice += quantity * price;
    });

    document.getElementById('editTotalPrice').value = totalPrice.toFixed(2);
}

// Add event listeners to recalculate total price when items are updated
document.getElementById('editItems').addEventListener('input', calculateAndPopulateTotalPrice);

// Function to fetch items or meals based on the type and populate the select dropdown
async function fetchOptions(type) {
    const url = type === 'item' ? 'http://localhost:3000/api/v1/items/' : 'http://localhost:3000/api/v1/meals/';
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${type}s`);
        }

        const data = await response.json();
        return data.map(item => ({ id: item.id, name: item.name, price: item.price  }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Function to add a new item row in the items section
async function addItemRow(item = { id: '', quantity: 1, price: 0.00, type: 'item' }) {
    const itemsContainer = document.getElementById('editItems');
    const itemRow = document.createElement('div');
    itemRow.classList.add('item-row', 'mb-2');

    // Create the select options dynamically based on the type
    const itemOptions = await fetchOptions(item.type);

    const itemSelectOptions = itemOptions.map(option => 
        `<option value="${option.id}" data-price="${option.price}" ${option.id === item.id ? 'selected' : ''}>${option.name}</option>`
    ).join('');

    itemRow.innerHTML = `
        <div class="row">
            <div class="col-md-2">
                <select class="form-select item-type" required>
                    <option value="item" ${item.type === 'item' ? 'selected' : ''}>Item</option>
                    <option value="meal" ${item.type === 'meal' ? 'selected' : ''}>Meal</option>
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select item-id" required>
                    <option value="">Select Item/Meal</option>
                    ${itemSelectOptions}
                </select>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control item-quantity" placeholder="Quantity" value="${item.quantity}" min="1" required>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control item-price" placeholder="Price" value="${item.price.toFixed(2)}" step="0.01" disabled  required>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger remove-item-button">Remove</button>
            </div>
        </div>
    `;
    itemsContainer.appendChild(itemRow);

    // Add event listener to remove button
    itemRow.querySelector('.remove-item-button').addEventListener('click', () => {
        itemRow.remove();
        calculateAndPopulateTotalPrice();
    });

    // Add event listener to handle type change and update the item/meal select
    itemRow.querySelector('.item-type').addEventListener('change', async function () {
        const selectedType = this.value;
        const newItemOptions = await fetchOptions(selectedType);
        const itemSelect = itemRow.querySelector('.item-id');
        itemSelect.innerHTML = `<option value="">Select ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</option>`;
        newItemOptions.forEach(option => {
            itemSelect.innerHTML += `<option value="${option.id}" data-price="${option.price}">${option.name}</option>`;
        });
    });

    // Add event listener to the item ID selection dropdown to update the price when an item/meal is selected
    const itemSelect = itemRow.querySelector('.item-id');
    itemSelect.addEventListener('change', function () {
        const selectedOption = itemSelect.options[itemSelect.selectedIndex];
        const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
        itemRow.querySelector('.item-price').value = price.toFixed(2);
        calculateAndPopulateTotalPrice(); // Recalculate total price whenever the price is updated
    });
}



async function populateEditOrderModal(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const order = await response.json();

        document.getElementById('editCustomerName').value = order.customer_name;
        document.getElementById('editCustomerPhone').value = order.customer_phone;
        document.getElementById('editCustomerEmail').value = order.customer_email;
        document.getElementById('editMethod').value = order.method;
        document.getElementById('editAddress').value = order.address ? `${order.address.street}, ${order.address.postalCode}, ${order.address.city}` : '';
        document.getElementById('editScheduledTime').value = order.scheduled_time;
        document.getElementById('editNotes').value = order.notes;
        document.getElementById('editStatus').value = order.status;
        document.getElementById('editTotalPrice').value = parseFloat(order.total_price).toFixed(2); // Ensure total price is a number

        // Populate items
        populateEditItems(order.items);

        // Show or hide address field based on method
        const addressSection = document.getElementById('editAddressSection');
        addressSection.style.display = order.method === 'delivery' ? 'block' : 'none';

        // Store order ID for submission
        document.getElementById('editOrderForm').dataset.orderId = orderId;
    } catch (error) {
        console.error('Error populating edit order modal:', error);
    }
}

document.getElementById('editOrderForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const orderId = this.dataset.orderId;
    const updatedOrder = {
        order_id: orderId,  // Add orderId to the updated order
        customer_name: document.getElementById('editCustomerName').value,
        customer_phone: document.getElementById('editCustomerPhone').value,
        customer_email: document.getElementById('editCustomerEmail').value,
        method: document.getElementById('editMethod').value,
        address: document.getElementById('editMethod').value === 'delivery' ? document.getElementById('editAddress').value : null,
        scheduled_time: document.getElementById('editScheduledTime').value,
        notes: document.getElementById('editNotes').value,
        status: document.getElementById('editStatus').value,
        total_price: parseFloat(document.getElementById('editTotalPrice').value).toFixed(2), // Round to 2 decimal places
        items: Array.from(document.querySelectorAll('#editItems .item-row')).map(row => ({
            id: parseInt(row.querySelector('.item-id').value, 10),
            quantity: parseInt(row.querySelector('.item-quantity').value, 10),
            price: parseFloat(row.querySelector('.item-price').value),
            type: row.querySelector('.item-type').value
        }))
    };

    // Log the entire updated order including order_id in a pretty-printed JSON format
    console.log('Updated Order:', JSON.stringify(updatedOrder, null, 2));

    try {
        const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedOrder)
        });

        if (!response.ok) {
            const errorData = await response.json();  // Get the error message from the response
            throw new Error(errorData.message || 'Failed to update order.');  // Default to generic error if message is not found
        }

        // Log the updated order in the console for debugging
        console.log('Order successfully updated!');

        // Close modal
        const editOrderModal = bootstrap.Modal.getInstance(document.getElementById('editOrderModal'));
        editOrderModal.hide();
    } catch (error) {
        // Log the error message from the API or the generic error message
        console.error('Error updating order:', error.message);
        
        // Optionally, you can display the error message to the user
        alert(`Error: ${error.message}`);
    }
});




document.addEventListener('DOMContentLoaded', async () => {
    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/orders/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }


            const orders = await response.json();
            const tbody = document.getElementById('OrdersBody');
            tbody.innerHTML = '';


            orders.forEach(order => {
                const itemsList = order.items.map(item => `${item.quantity} x Item (${item.id}) (€${item.price.toFixed(2)})`).join(', ');
                const address = order.method === "pickup" ? "N/A" : `${order.address.street}, ${order.address.postalCode}, ${order.address.city}`;

                // Add color badges for status
                const statusBadge = {
                    'processing': '<span class="badge bg-warning text-dark">Processing</span>',
                    'preparing': '<span class="badge bg-primary">Preparing</span>',
                    'ready': '<span class="badge bg-info text-dark">Ready</span>',
                    'completed': '<span class="badge bg-success">Completed</span>'
                }[order.status] || `<span class="badge bg-secondary">${order.status}</span>`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.order_id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.customer_phone}</td>
                    <td>${order.customer_email}</td>
                    <td>${itemsList}</td>
                    <td>${order.method}</td>
                    <td>${address}</td>
                    <td>${order.scheduled_time}</td>
                    <td>${order.notes}</td>
                    <td>${order.total_price}€</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-primary view-order" onclick="viewOrderDetails(${order.order_id})" data-bs-toggle="modal" data-bs-target="#orderModal">View</button>
                        <button class="btn btn-secondary edit-order" onclick="populateEditOrderModal(${order.order_id})" data-bs-toggle="modal" data-bs-target="#editOrderModal">Edit</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            initializeTable('#OrdersTable', 5);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    fetchOrders();
});
