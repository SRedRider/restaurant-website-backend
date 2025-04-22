document.addEventListener('DOMContentLoaded', () => {
    fetchItemsForMeals();  // Populate meal dropdowns

// Add Item Form Submit
document.getElementById('itemForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const itemData = new FormData(this);
    const submitButton = document.getElementById('itemSubmitButton');
    const loadingSpinner = document.getElementById('itemLoading');
    const itemAlert = document.getElementById('itemAlert');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');

    // Collect selected allergens from checkboxes
    const selectedAllergens = [];
    document.querySelectorAll('input[name="allergens"]:checked').forEach((checkbox) => {
        selectedAllergens.push(checkbox.value);
    });

    // Get manually added allergen (if any)
    const otherAllergen = document.getElementById('otherAllergen').value.trim();
    if (otherAllergen && !selectedAllergens.includes(otherAllergen)) {
        // Only add the manually entered allergen if it's not already in the selected allergens
        selectedAllergens.push(otherAllergen);
    }

    // Convert allergens array to a comma-separated string
    const allergensString = selectedAllergens.join(',');

    // Add allergens to FormData
    itemData.append('allergens', allergensString);

    // Disable the button and show the loading spinner
    submitButton.disabled = true;
    loadingSpinner.style.display = 'inline-block';

    // Send the request to the server
    const response = await fetch('http://localhost:3000/api/v1/items', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Include token for authorization
        },
        body: itemData
    });

    if (response.ok) {
        itemAlert.className = "alert alert-success mt-3";
        itemAlert.textContent = 'Item added successfully!';
        itemAlert.style.display = 'block';

        // Reset the form
        this.reset();

        // Reset the image preview
        imagePreviewContainer.style.display = 'none'; // Hide the preview container
        imagePreview.src = ''; // Clear the image preview

    } else {
        itemAlert.className = "alert alert-danger mt-3";
        itemAlert.textContent = 'Error adding item.';
        itemAlert.style.display = 'block';
    }

    // Re-enable the button and hide the loading spinner
    submitButton.disabled = false;
    loadingSpinner.style.display = 'none';

    // Fetch items to repopulate the dropdowns
    fetchItemsForMeals();
});


    

    // Create Meal Form Submit
    document.getElementById('mealForm').addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const mealForm = document.getElementById('mealForm');
        const mealData = new FormData(mealForm); // Use FormData to capture form data including the file
        mealData.set('name', document.getElementById('mealName').value);
        mealData.set('description', document.getElementById('mealDescription').value);
        mealData.set('price', parseFloat(document.getElementById('mealPrice').value));
        mealData.set('hamburgerId', document.getElementById('hamburgerSelect').value || null);
        mealData.set('wrapId', document.getElementById('wrapSelect').value || null);
        mealData.set('chicken_burgerId', document.getElementById('chicken_burgerSelect').value || null);
        mealData.set('veganId', document.getElementById('veganSelect').value || null);
        mealData.set('sideId', document.getElementById('sideSelect').value || null);
        mealData.set('breakfastId', document.getElementById('breakfastSelect').value || null);
        mealData.set('dessertId', document.getElementById('dessertSelect').value || null);
        mealData.set('drinkId', document.getElementById('drinkSelect').value || null);
    


        // Get image file input
        const imageFile = document.getElementById('imageMeal').files[0];
        if (imageFile) {
            mealData.set('image', imageFile);  // Ensure the image is added to the FormData
        }
    
        const submitButton = document.getElementById('mealSubmitButton');
        const loadingSpinner = document.getElementById('mealLoading');
        const mealAlert = document.getElementById('mealAlert');
        const imagePreviewContainerMeal = document.getElementById('imagePreviewContainerMeal');
        const imagePreviewMeal = document.getElementById('imagePreviewMeal');
    
        // Disable the button and show the loading spinner
        submitButton.disabled = true;
        loadingSpinner.style.display = 'inline-block';
    
        const response = await fetch('http://localhost:3000/api/v1/meals', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Include token for authorization
            },
            body: mealData // Use FormData as the body
        });
    
        if (response.ok) {
            mealAlert.className = "alert alert-success mt-3";
            mealAlert.textContent = 'Meal created successfully!';
            mealAlert.style.display = 'block';
    
            // Reset the form
            mealForm.reset();
    
            imagePreviewContainerMeal.style.display = 'none'; // Hide the preview container
            imagePreviewMeal.src = ''; // Clear the image preview
        } else {
            mealAlert.className = "alert alert-danger mt-3";
            mealAlert.textContent = 'Error creating meal.';
            mealAlert.style.display = 'block';
        }
    
        // Re-enable the button and hide the loading spinner
        submitButton.disabled = false;
        loadingSpinner.style.display = 'none';
    });
    
});




async function fetchItemsForMeals() {
    const response = await fetch('http://localhost:3000/api/v1/items', {
        method: 'GET', // You can specify the method if needed
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Replace with your actual token
        }
    });
    const items = await response.json();

    const selects = {
        hamburgers: document.getElementById('hamburgerSelect'),
        wraps: document.getElementById('wrapSelect'),
        chicken_burgers: document.getElementById('chicken_burgerSelect'),
        vegan: document.getElementById('veganSelect'),
        sides: document.getElementById('sideSelect'),
        breakfast: document.getElementById('breakfastSelect'),
        desserts: document.getElementById('dessertSelect'),
        drinks: document.getElementById('drinkSelect')
    };

    // Reset select options
    Object.values(selects).forEach(select => select.innerHTML = '<option value="">None</option>');

    items.forEach(item => {
        const isDisabled = item.stock === 'no' ? 'disabled' : '';
        const badge = item.stock === 'no' ? ' (No Stock)' : '';
        const option = `<option value="${item.id}" ${isDisabled}>${item.name}${badge}</option>`;
        
        if (selects[item.category]) {
            selects[item.category].innerHTML += option;
        }
    });
}

    // Fetch and populate table data
    window.onload = function() {

        // Fetch request with the Authorization header
            fetch('http://localhost:3000/api/v1/items', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Replace with real JWT
                }
            })
            .then(response => response.json())
            .then(data => {
                let tableBody = document.getElementById('ItemsBody');
                data.forEach(item => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.category}</td>
                        <td>${item.description}</td>
                        <td>${item.ingredients}</td>
                        <td>${item.allergens}</td>
                        <td>${item.size}</td>
                        <td><img src="http://localhost:3000${item.image_url}" alt="${item.name}" style="width: 50px; height: 50px;"></td>
                        <td>${item.price}€</td>
                        <td><span class="badge ${item.stock.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">${item.stock.toLowerCase() === 'yes' ? 'In Stock' : 'Out of Stock'}</span></td>
                        <td><span class="badge ${item.visible.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">${item.visible.toLowerCase() === 'yes' ? 'Visible' : 'Not Visible'}</span></td>
                        <td>${item.created_at}</td>
                        <td>
                            <button class="btn btn-info btn-sm" onclick="viewItemDetails(${item.id})">View</button>
                            <button class="btn btn-warning btn-sm" onclick="editItem(${item.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                initializeTable('#ItemsTable', 5);
            })
            
            .catch(error => console.error('Error fetching data:', error));
        
        
        
        
                    fetch('http://localhost:3000/api/v1/meals', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Replace with real JWT
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        let tableBody = document.getElementById('MealsBody');
                        data.forEach(meal => {
                            let row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${meal.id}</td>
                                <td>${meal.name}</td>
                                <td>${meal.description}</td>
                                <td>${meal.hamburger_id}</td>
                                <td>${meal.wrap_id}</td>
                                <td>${meal.chicken_burger_id}</td>
                                <td>${meal.vegan_id}</td>
                                <td>${meal.side_id}</td>
                                <td>${meal.breakfast_id}</td>
                                <td>${meal.dessert_id}</td>
                                <td>${meal.drink_id}</td>
                                
                                <td><img src="http://localhost:3000${meal.image_url}" alt="${meal.name}" style="width: 50px; height: 50px;"></td>
                                <td>${meal.price}€</td>
                                <td><span class="badge ${meal.stock.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">${meal.stock.toLowerCase() === 'yes' ? 'In Stock' : 'Out of Stock'}</span></td>
                                <td><span class="badge ${meal.visible.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">${meal.visible.toLowerCase() === 'yes' ? 'Visible' : 'Not Visible'}</span></td>
                                <td>${meal.created_at}</td>
                                <td>
                                    <button class="btn btn-info btn-sm" onclick="viewMealDetails(${meal.id})">View</button>
                                    <button class="btn btn-warning btn-sm" onclick="editMeal(${meal.id})">Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteMeal(${meal.id})">Delete</button>
                                </td>
                            `;
                            tableBody.appendChild(row);
                        });
        
                        initializeTable('#MealsTable', 5);
                    })
                    .catch(error => console.error('Error fetching data:', error));
            };
        
            // Function to show item details in a modal
            function viewItemDetails(id) {
            fetch(`http://localhost:3000/api/v1/items/${id}`)
                .then(response => response.json())
                .then(item => {
                    const viewItemDetailsDiv = document.getElementById('viewItemDetails');
        
                    viewItemDetailsDiv.innerHTML = `
                    <div class="text-center mb-3">
                        <h3>${item.name}</h3>
                    </div>
                    <div class="row">
                        <!-- ID on the top left -->
                        <div class="col-6">
                            <p><strong>ID:</strong> ${item.id}</p>
                        </div>
                        <!-- Price on the top right -->
                        <div class="col-6 text-end">
                            <p><strong>Price:</strong> ${item.price}€</p>
                        </div>
                            <div class="text-end">
                            <!-- Stock Badge -->
                            <span class="badge ${item.stock.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">
                                ${item.stock.toLowerCase() === 'yes' ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        <div class="text-end">
                            <!-- Visible Badge -->
                            <span class="badge ${item.visible.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">
                                ${item.visible.toLowerCase() === 'yes' ? 'Visible' : 'Not Visible'}
                            </span>
                        </div>
                    </div>
                    

                    
                    <!-- Image in the center at the top -->
                    <div class="text-center mb-3">
                        <img src="http://localhost:3000${item.image_url}" alt="${item.name}" class="img-fluid" style="max-height: 300px;">
                    </div>

                    <!-- Category and Description in the center -->
                    <p><strong>Category:</strong> ${item.category}</p>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Ingredients:</strong> ${item.ingredients}</p>
                    <p><strong>Allergens:</strong> ${item.allergens || 'None'}</p>
                    
                    <!-- Date on the bottom right -->
                    <div class="text-end mt-3">
                        <p><strong>Created At:</strong> ${new Date(item.created_at).toLocaleString()}</p>
                    </div>
                `;

                    // Open the modal
                    const viewItemModal = new bootstrap.Modal(document.getElementById('viewItemModal'));
                    viewItemModal.show();
                })
                .catch(error => console.error('Error fetching item details:', error));
        }
        
        
        
        // Function to fetch and update the name of an item based on its ID
        function fetchItemName(itemId) {
            return fetch(`http://localhost:3000/api/v1/items/${itemId}`)
                .then(response => {
                    if (!response.ok) {
                        // If the response is not OK (e.g., 404 or other errors), return 'Not available'
                        return 'Not available';
                    }
                    return response.json();
                })
                .then(data => {
                    // If the 'name' field is available, return it, otherwise return 'Not available'
                    return data && data.name ? data.name : 'Not available';
                })
                .catch(error => {
                    console.error(`Error fetching data for ${itemId}:`, error);
                    return 'Not available'; // return 'Not available' if there's an error
                });
        }
        
        function viewMealDetails(id) {
            fetch(`http://localhost:3000/api/v1/meals/${id}`)
                .then(response => response.json())
                .then(meal => {
                    const viewMealDetailsDiv = document.getElementById('viewMealDetails');
        
                    // Fetch names for each item
                    Promise.all([
                        fetchItemName(meal.hamburger_id),
                        fetchItemName(meal.wrap_id),
                        fetchItemName(meal.chicken_burger_id),
                        fetchItemName(meal.vegan_id),
                        fetchItemName(meal.side_id),
                        fetchItemName(meal.breakfast_id),
                        fetchItemName(meal.dessert_id),
                        fetchItemName(meal.drink_id)
                    ]).then(names => {
                        viewMealDetailsDiv.innerHTML = `
                            <div class="text-center mb-3">
                                <h3>${meal.name}</h3>
                            </div>
                            <div class="row">
                                <!-- ID on the top left -->
                                <div class="col-6">
                                    <p><strong>ID:</strong> ${meal.id}</p>
                                </div>
                                <!-- Price on the top right -->
                                <div class="col-6 text-end">
                                    <p><strong>Price:</strong> ${meal.price}€</p>
                                </div>
                                 <div class="text-end">
                                <!-- Stock Badge -->
                                <span class="badge ${meal.stock.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">
                                    ${meal.stock.toLowerCase() === 'yes' ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <div class="text-end">
                                <!-- Visible Badge -->
                                <span class="badge ${meal.visible.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">
                                    ${meal.visible.toLowerCase() === 'yes' ? 'Visible' : 'Not Visible'}
                                </span>
                            </div>
                            </div>
                            
                            <!-- Image in the center at the top -->
                            <div class="text-center mb-3">
                                <img src="http://localhost:3000${meal.image_url}" alt="${meal.name}" class="img-fluid" style="max-height: 300px;">
                            </div>
        
                            <!-- Category and Description in the center -->
                            <p><strong>Description:</strong> ${meal.description}</p>
                           
                            <p><strong>Hamburger Name:</strong> ${names[0]} (ID: ${meal.hamburger_id})</p>
                            <p><strong>Wrap Name:</strong> ${names[1]} (ID: ${meal.wrap_id})</p>
                            <p><strong>Chicken Burger Name:</strong> ${names[2]} (ID: ${meal.chicken_burger_id})</p>
                            <p><strong>Vegan Name:</strong> ${names[3]} (ID: ${meal.vegan_id})</p>
                            <p><strong>Side Name:</strong> ${names[4]} (ID: ${meal.side_id})</p>
                            <p><strong>Breakfast Name:</strong> ${names[5]} (ID: ${meal.breakfast_id})</p>
                            <p><strong>Dessert Name:</strong> ${names[6]} (ID: ${meal.dessert_id})</p>
                            <p><strong>Drink Name:</strong> ${names[7]} (ID: ${meal.drink_id})</p>
        
                            <p><strong>Stock:</strong> ${meal.stock}</p>
                            <p><strong>Visible:</strong> ${meal.visible}</p>
        
                            <!-- Date on the bottom right -->
                            <div class="text-end mt-3">
                                <p><strong>Created At:</strong> ${new Date(meal.created_at).toLocaleString()}</p>
                            </div>
                        `;
        
                        // Open the modal
                        const viewMealModal = new bootstrap.Modal(document.getElementById('viewMealModal'));
                        viewMealModal.show();
                    });
                })
                .catch(error => console.error('Error fetching meal details:', error));
        }
        
        
        
        
        
        
        // Open the Edit Modal with Item Data
        function editItem(id) {
            fetch(`http://localhost:3000/api/v1/items/${id}`)
                .then(response => response.json())
                .then(item => {
                    const editForm = document.getElementById('editItemForm');
                    const allergens = item.allergens ? item.allergens.split(',') : [];
                    const originalImageUrl = item.image_url;
        
                    // Populate the form fields
                    document.getElementById('editName').value = item.name;
                    document.getElementById('editCategory').value = item.category;
                    document.getElementById('editDescription').value = item.description;
                    document.getElementById('editIngredients').value = item.ingredients;
                    document.getElementById('editSize').value = item.size;
                    document.getElementById('editPrice').value = item.price;
                    document.getElementById('editStock').value = item.stock;
                    document.getElementById('editVisible').value = item.visible;
        
                    // Set the allergens checkboxes based on the data
                    ['Gluten', 'Dairy', 'Peanuts', 'Soy', 'Egg'].forEach(allergen => {
                        if (allergens.includes(allergen)) {
                            document.getElementById('edit' + allergen).checked = true;
                        }
                    });
        
                    // Populate the 'Other Allergens' input
                    const otherAllergens = allergens.filter(allergen => !['Gluten', 'Dairy', 'Peanuts', 'Soy', 'Egg'].includes(allergen)).join(', ');
                    document.getElementById('editOtherAllergens').value = otherAllergens;
        
                    const imagePreviewContainerEdit = document.getElementById('editImagePreviewContainer');
                    const imagePreviewEdit = document.getElementById('editImagePreview');
                    const imageHeadingEdit = document.getElementById('editImageHeading');
                    const removeImageButton = document.getElementById('removeImageButton');
                    
                    if (item.image_url) {
                        imagePreviewEdit.src = `http://localhost:3000${item.image_url}`;
                        imagePreviewContainerEdit.style.display = 'block';
                        imageHeadingEdit.innerText = 'Original Image'; 
                        removeImageButton.style.display = 'none';  // Do not show remove button initially
                    } else {
                        // If no image exists, hide the preview container
                        imagePreviewContainerEdit.style.display = 'none';
                        removeImageButton.style.display = 'none';
                    }
        
                    const imageInput = document.getElementById('editImage');
                    imageInput.addEventListener('change', function() {
                        const file = imageInput.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                imagePreviewEdit.src = e.target.result;
                                imagePreviewContainerEdit.style.display = 'block';
                                imageHeadingEdit.innerText = 'New Image'; 
                                removeImageButton.style.display = 'inline-block';  // Show remove button
                            };
                            reader.readAsDataURL(file);
                        } else {
                            // If no image is selected, show the original image
                            imagePreviewEdit.src = `http://localhost:3000${item.image_url}`;
                            imagePreviewContainerEdit.style.display = 'block';
                            imageHeadingEdit.innerText = 'Original Image';
                            removeImageButton.style.display = 'none';  // Hide remove button
                        }
                    });
        
                    // Remove Image Button Logic
                    removeImageButton.addEventListener('click', function() {
                        // When the user clicks "Remove Image", reset to the original image
                        imagePreviewEdit.src = `http://localhost:3000${item.image_url}`;
                        imagePreviewContainerEdit.style.display = 'block';
                        imageHeadingEdit.innerText = 'Original Image';
                        removeImageButton.style.display = 'none';  // Hide the remove button
                        imageInput.value = '';  // Clear the file input
                    });
        
                    // Open the modal
                    const editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
                    editModal.show();
        
                    // Handle form submission for updating the item
                    editForm.onsubmit = function(e) {
                        e.preventDefault();
        
                        const formData = new FormData();
                        const selectedAllergens = [];
        
                        // Collect allergens from checkboxes
                        ['Gluten', 'Dairy', 'Peanuts', 'Soy', 'Egg'].forEach(allergen => {
                            if (document.getElementById('edit' + allergen).checked) {
                                selectedAllergens.push(allergen);
                            }
                        });
        
                        // Add allergens from the 'Other Allergens' input field (if any)
                        const otherAllergens = document.getElementById('editOtherAllergens').value.trim();
                        if (otherAllergens) {
                            selectedAllergens.push(...otherAllergens.split(',').map(item => item.trim()));
                        }
        
                        formData.append('category', document.getElementById('editCategory').value);
                        formData.append('name', document.getElementById('editName').value);
                        formData.append('description', document.getElementById('editDescription').value);
                        formData.append('ingredients', document.getElementById('editIngredients').value);
                        formData.append('allergens', selectedAllergens.join(',')); // Store selected allergens as a comma-separated string
                        formData.append('size', document.getElementById('editSize').value);
                        formData.append('price', document.getElementById('editPrice').value);
                        formData.append('stock', document.getElementById('editStock').value);
                        formData.append('visible', document.getElementById('editVisible').value);
        
                        // If new image is selected, append it to formData
                        const newImage = document.getElementById('editImage').files[0];
                        if (newImage) {
                            formData.append('image', newImage);
                        } else if (editForm.removeImage) {
                            // If the user clicked "Remove Image", send null to the server
                            formData.append('image', null);
                        } else {
                            // If no new image and no removal, send the original image
                            formData.append('image', originalImageUrl);
                        }
        
                        // Send the PUT request to update the item
                        fetch(`http://localhost:3000/api/v1/items/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Include token for authorization
                            },
                            body: formData,
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message === 'Item updated successfully') {
                                editItemAlert.className = "alert alert-success mt-3";
                                editItemAlert.textContent = 'Item updated successfully';
                                editItemAlert.style.display = 'block';
                                editForm.reset();  // Reset the form after successful update
                                $('#ItemsTable').bootstrapTable('refresh');
                                window.location.reload(); // Reload the page to see updated data
                            } else {
                                editItemAlert.className = "alert alert-danger mt-3";
                                editItemAlert.textContent = 'Error updating item.';
                                editItemAlert.style.display = 'block';
                            }
                        })
                        .catch(error => {
                            console.error('Error updating item:', error);
                        });
                    };
                })
                .catch(error => {
                    console.error('Error fetching item details for edit:', error);
                });
        }
        
        
        async function editMeal(id) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/meals/${id}`);
                const meal = await response.json();
        
                const editForm = document.getElementById('editMealForm');
                const originalImageUrl = meal.image_url;
        
                // Populate form fields
                document.getElementById('editMealName').value = meal.name;
                document.getElementById('editMealDescription').value = meal.description;
                document.getElementById('editMealPrice').value = meal.price;
                document.getElementById('editMealVisible').value = meal.visible;
        
                // Fetch and populate meal items
                await fetchItemsForEditMeal(meal);
        
                // Image Handling
                const imagePreviewContainer = document.getElementById('editMealImagePreviewContainer');
                const imagePreview = document.getElementById('editMealImagePreview');
                const imageHeading = document.getElementById('editMealImageHeading');
                const removeImageButton = document.getElementById('removeMealImageButton');
        
                if (meal.image_url) {
                    imagePreview.src = `http://localhost:3000${meal.image_url}`;
                    imagePreviewContainer.style.display = 'block';
                    imageHeading.innerText = 'Original Image';
                    removeImageButton.style.display = 'none';
                } else {
                    imagePreviewContainer.style.display = 'none';
                    removeImageButton.style.display = 'none';
                }
        
                const imageInput = document.getElementById('editMealImage');
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
                        imagePreview.src = `http://localhost:3000${meal.image_url}`;
                        imagePreviewContainer.style.display = 'block';
                        imageHeading.innerText = 'Original Image';
                        removeImageButton.style.display = 'none';
                    }
                });
        
                removeImageButton.addEventListener('click', function () {
                    imagePreview.src = `http://localhost:3000${meal.image_url}`;
                    imagePreviewContainer.style.display = 'block';
                    imageHeading.innerText = 'Original Image';
                    removeImageButton.style.display = 'none';
                    imageInput.value = '';
                });
        
                // Show Modal
                const editModal = new bootstrap.Modal(document.getElementById('editMealModal'));
                editModal.show();
        
                // Handle Form Submission
                editForm.onsubmit = async function (e) {
                    e.preventDefault();
        
                    const formData = new FormData();
                    formData.append('name', document.getElementById('editMealName').value);
                    formData.append('description', document.getElementById('editMealDescription').value);
                    formData.append('price', document.getElementById('editMealPrice').value);
                    formData.append('hamburger_id', document.getElementById('editHamburgerSelect').value);
                    formData.append('wrap_id', document.getElementById('editWrapSelect').value);
                    formData.append('chicken_burger_id', document.getElementById('editChicken_burgerSelect').value);
                    formData.append('vegan_id', document.getElementById('editVeganSelect').value);
                    formData.append('side_id', document.getElementById('editSideSelect').value);
                    formData.append('breakfast_id', document.getElementById('editBreakfastSelect').value);
                    formData.append('dessert_id', document.getElementById('editDessertSelect').value);
                    formData.append('drink_id', document.getElementById('editDrinkSelect').value);
                    formData.append('visible', document.getElementById('editMealVisible').value);
                    
        
                    const newImage = document.getElementById('editMealImage').files[0];
                    if (newImage) {
                        formData.append('image', newImage);
                    } else {
                        formData.append('image', originalImageUrl);
                    }
        
                    try {
                        const updateResponse = await fetch(`http://localhost:3000/api/v1/meals/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Include token for authorization
                            },
                            body: formData,
                        });
        
                        const editMealAlert = document.getElementById('editMealAlert');
        
                        const result = await updateResponse.json();
                        if (result.message === 'Meal updated successfully') {
                            editMealAlert.className = "alert alert-success mt-3";
                            editMealAlert.textContent = 'Meal updated successfully';
                            editMealAlert.style.display = 'block';
                            window.location.reload(); // Reload the page to see updated data
                            editForm.reset();
                        } else {
                            editMealAlert.className = "alert alert-danger mt-3";
                            editMealAlert.textContent = 'Error updating meal.';
                            editMealAlert.style.display = 'block';
                        }
                    } catch (error) {
                        editMealAlert.className = "alert alert-danger mt-3";
                        editMealAlert.textContent = 'Error updating meal.';
                        editMealAlert.style.display = 'block';
                    }
                };
            } catch (error) {
                console.error('Error fetching meal details:', error);
            }
        }
        
        async function fetchItemsForEditMeal(meal) {
            const response = await fetch('http://localhost:3000/api/v1/items', {
                method: 'GET', // You can specify the method if needed
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Replace with your actual token
                }
            });
            const items = await response.json();
        
            const hamburgerSelect = document.getElementById('editHamburgerSelect');
            const wrapSelect = document.getElementById('editWrapSelect');
            const chickenBurgerSelect = document.getElementById('editChicken_burgerSelect');
            const veganSelect = document.getElementById('editVeganSelect');
            const sideSelect = document.getElementById('editSideSelect');
            const dessertSelect = document.getElementById('editDessertSelect');
            const breakfastSelect = document.getElementById('editBreakfastSelect');
            const drinkSelect = document.getElementById('editDrinkSelect');
        
            const categories = {
                hamburgers: { select: hamburgerSelect, key: 'hamburger_id' },
                wraps: { select: wrapSelect, key: 'wrap_id' },
                chicken_burgers: { select: chickenBurgerSelect, key: 'chicken_burger_id' },
                vegan: { select: veganSelect, key: 'vegan_id' },
                sides: { select: sideSelect, key: 'side_id' },
                breakfast: { select: breakfastSelect, key: 'breakfast_id' },
                desserts: { select: dessertSelect, key: 'dessert_id' },
                drinks: { select: drinkSelect, key: 'drink_id' },
            };
        
            Object.values(categories).forEach(({ select }) => {
                select.innerHTML = '<option value="">None</option>';
            });
        
            items.forEach(item => {
                const categoryData = categories[item.category];
                if (categoryData) {
                    const isSelected = meal[categoryData.key] === item.id ? 'selected' : '';
                    const isDisabled = item.stock === 'no' ? 'disabled' : '';
                    const badge = item.stock === 'no' ? ' (No Stock)' : '';
                    const option = `<option value="${item.id}" ${isSelected} ${isDisabled}>${item.name}${badge}</option>`;
                    categoryData.select.innerHTML += option;
                }
            });
        }
        
        
        
        
        // Function to handle delete button click
        function deleteItem(id) {
            // Show the initial confirmation modal
            showModal("Are you sure you want to delete this item?", "Confirm Deletion", "delete", id);
        }
        
        // Function to show the modal with dynamic content
        function showModal(message, title, actionType, id) {
            // Update modal title and body
            const modalTitle = document.getElementById('genericModalTitle');
            const modalBody = document.getElementById('genericModalBody');
            const actionButton = document.getElementById('genericModalActionButton');
            const modalFooter = document.getElementById('genericModalFooter');
            
            if (modalTitle && modalBody && actionButton && modalFooter) {
                modalTitle.textContent = title;
                modalBody.textContent = message;
        
                // Update the action button behavior based on the action type
                if (actionType === "delete") {
                    actionButton.classList.remove('btn-secondary', 'btn-danger');
                    actionButton.classList.add('btn-danger');
                    actionButton.textContent = "Delete";
        
                    // Show both Cancel and Delete buttons
                    modalFooter.querySelector('.btn-secondary').style.display = "inline-block";
                    actionButton.style.display = "inline-block";
        
                    actionButton.onclick = function() {
                        fetch(`http://localhost:3000/api/v1/items/${id}/checkMeal`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.isAssociatedWithMeal) {
                                    showModal("This item is part of a meal. Deleting it will also delete the meal. Are you sure?", "Confirm Meal Deletion", "deleteMeal", id);
                                } else {
                                    confirmDelete(id);
                                }
                            })
                            .catch(error => {
                                console.error('Error checking item association with meal:', error);
                                showErrorModal("Error checking item association.");
                            });
                    };
                } else if (actionType === "deleteMeal") {
                    actionButton.classList.remove('btn-secondary', 'btn-danger');
                    actionButton.classList.add('btn-danger');
                    actionButton.textContent = "Delete Meal and Item";
        
                    // Show both Cancel and Delete buttons
                    modalFooter.querySelector('.btn-secondary').style.display = "inline-block";
                    actionButton.style.display = "inline-block";
        
                    actionButton.onclick = function() {
                        confirmDelete(id, true);
                    };
                } else if (actionType === "success") {
                    // Hide Cancel button for success scenario
                    modalFooter.querySelector('.btn-secondary').style.display = "none";
                    actionButton.classList.remove('btn-secondary', 'btn-danger');
                    actionButton.classList.add('btn-primary');
                    actionButton.textContent = "OK";
        
                    actionButton.onclick = function() {
                        document.location.reload(); // Reload the page to see updated data
                    };
                } else if (actionType === "error") {
                    // Show both Cancel and Retry buttons
                    modalFooter.querySelector('.btn-secondary').style.display = "inline-block";
                    actionButton.classList.remove('btn-secondary', 'btn-danger');
                    actionButton.classList.add('btn-danger');
                    actionButton.textContent = "Close";
        
                    actionButton.onclick = function() {
                        $('#genericModal').modal('hide');
                    };
                }
        
                // Show the modal
                $('#genericModal').modal('show');
            } else {
                console.error("Modal elements not found in the DOM.");
            }
        }
        
        // Function to perform deletion
        function confirmDelete(id, deleteMeal = false) {
            fetch(`http://localhost:3000/api/v1/items/${id}`, {
                method: 'DELETE',  // Specify the HTTP method as DELETE
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Include token for authorization
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Item deleted') {
                    showModal("Item deleted successfully!", "Success", "success", id);
                } else {
                    showErrorModal("Error deleting item.");
                }
            })
            .catch(error => {
                console.error('Error deleting item:', error);
                showErrorModal("Error deleting item.");
            });
        }
        
        // Function to show error message in the modal
        function showErrorModal(message) {
            showModal(message, "Error", "error");
        } 