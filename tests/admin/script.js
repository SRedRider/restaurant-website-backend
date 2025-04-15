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
    const response = await fetch('http://localhost:3000/api/v1/items');
    const items = await response.json();

    const hamburgerSelect = document.getElementById('hamburgerSelect');
    const wrapSelect = document.getElementById('wrapSelect');
    const chicken_burgerSelect = document.getElementById('chicken_burgerSelect');
    const veganSelect = document.getElementById('veganSelect');
    const sideSelect = document.getElementById('sideSelect');
    const breakfastSelect = document.getElementById('breakfastSelect');
    const dessertSelect = document.getElementById('dessertSelect');
    const drinkSelect = document.getElementById('drinkSelect');

    hamburgerSelect.innerHTML = '<option value="">None</option>';
    wrapSelect.innerHTML = '<option value="">None</option>';
    chicken_burgerSelect.innerHTML = '<option value="">None</option>';
    veganSelect.innerHTML = '<option value="">None</option>';
    sideSelect.innerHTML = '<option value="">None</option>';
    breakfastSelect.innerHTML = '<option value="">None</option>';
    dessertSelect.innerHTML = '<option value="">None</option>';
    drinkSelect.innerHTML = '<option value="">None</option>';


    items.forEach(item => {
        const option = `<option value="${item.id}">${item.name}</option>`;
        if (item.category === 'hamburgers') hamburgerSelect.innerHTML += option;
        if (item.category === 'wraps') wrapSelect.innerHTML += option;
        if (item.category === 'chicken_burgers') chicken_burgerSelect.innerHTML += option;
        if (item.category === 'vegan') veganSelect.innerHTML += option;
        if (item.category === 'sides') sideSelect.innerHTML += option;
        if (item.category === 'breakfast') breakfastSelect.innerHTML += option;
        if (item.category === 'dessert') dessertSelect.innerHTML += option;
        if (item.category === 'drinks') drinkSelect.innerHTML += option;
    });
}
