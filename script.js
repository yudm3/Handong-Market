document.addEventListener('readystatechange', () => {
    console.log('[DEBUG] readystatechange:', document.readyState);
});

document.addEventListener('DOMContentLoaded', function () {
    console.log('[DEBUG] DOMContentLoaded event fired!');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('[DEBUG] Current page detected:', currentPage);

    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    console.log('[DEBUG] loggedInUser from localStorage:', loggedInUser);

    let users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('[DEBUG] users from localStorage:', users);

    let postedItems = JSON.parse(localStorage.getItem('postedItems')) || {};
    console.log('[DEBUG] postedItems from localStorage:', postedItems);

    let allLoadedItems = [];

    function ensureCategoryAndID(data) {
        for (let catKey in data) {
            data[catKey].forEach(it => {
                // Assign category if not present
                if (!it.category) it.category = catKey;
                // Assign an itemID if not present
                if (!it.itemID) {
                    it.itemID = Math.floor(Math.random() * 1000000);
                    console.log('[DEBUG] Assigned itemID:', it.itemID, it.title);
                }
            });
        }
    }

    function fetchAndLoadItems() {
        console.log('[DEBUG] Starting fetchAndLoadItems...');
        let defaultItems = JSON.parse(localStorage.getItem('defaultItems'));

        if (defaultItems) {
            console.log('[DEBUG] defaultItems found in localStorage, using them directly');
            console.log('[DEBUG] defaultItems content:', defaultItems);
            let keys = Object.keys(defaultItems);
            console.log('[DEBUG] defaultItems category keys:', keys);
            let itemCountCheck = 0;
            keys.forEach(k => {
                itemCountCheck += defaultItems[k].length;
            });
            console.log('[DEBUG] total items in defaultItems from localStorage:', itemCountCheck);

            allLoadedItems = [];
            for (let catKey in defaultItems) {
                allLoadedItems = allLoadedItems.concat(defaultItems[catKey]);
            }
            for (let catKey in postedItems) {
                let postedCatItems = postedItems[catKey];
                if (!Array.isArray(postedCatItems)) postedCatItems = [postedCatItems];
                allLoadedItems = allLoadedItems.concat(postedCatItems);
            }

            window.allLoadedItems = allLoadedItems; // Added line here
            console.log('[DEBUG] allLoadedItems after merging postedItems on second run:', allLoadedItems.length);
            return Promise.resolve(allLoadedItems);
        } else {
            // First run: fetch from items.json
            console.log('[DEBUG] Fetching items.json...');
            return fetch('items.json')
                .then(response => {
                    console.log('[DEBUG] items.json fetch response status:', response.status);
                    if (!response.ok) {
                        throw new Error('Network response not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('[DEBUG] items.json data fetched');
                    ensureCategoryAndID(data);

                    let initialCount = 0;
                    for (let catKey in data) {
                        initialCount += data[catKey].length;
                    }
                    console.log('[DEBUG] total items after assigning ID/category:', initialCount);

                    localStorage.setItem('defaultItems', JSON.stringify(data));
                    console.log('[DEBUG] defaultItems stored in localStorage:', data);

                    let combined = [];
                    for (let catKey in data) {
                        combined = combined.concat(data[catKey]);
                    }

                    for (let catKey in postedItems) {
                        let postedCatItems = postedItems[catKey];
                        if (!Array.isArray(postedCatItems)) postedCatItems = [postedCatItems];
                        combined = combined.concat(postedCatItems);
                    }

                    allLoadedItems = combined;
                    window.allLoadedItems = allLoadedItems;
                    console.log('[DEBUG] Items fetched and loaded. Running page handlers now.');
                    return allLoadedItems;
                })
                .catch(error => {
                    console.error('[DEBUG] Error fetching items:', error);
                });
        }
    }

    function maskUserIdentifier(identifier) {
        if (!identifier) return '';
        if (identifier.length > 4) {
            return identifier.substring(0, 2) + '**' + identifier.substring(identifier.length - 2);
        } else {
            return identifier;
        }
    }

    function updateHeaderLoginLink() {
        console.log('[DEBUG] Updating header login link...');
        const container = document.getElementById('login-link-container');
        if (container) {
            if (loggedInUser) {
                const user = users.find(u => u.email === loggedInUser);
                let identifierToMask = user ? user.username : loggedInUser;
                const masked = maskUserIdentifier(identifierToMask);
                container.innerHTML = '<a href="profile.html">' + masked + '</a>';
            } else {
                container.innerHTML = '<a href="login.html" id="loginLink">login</a>';
            }
        }
    }

    function getUserFavorites() {
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        return favs[loggedInUser] || [];
    }

    function isItemFavorited(itemID) {
        const userFavs = getUserFavorites();
        return userFavs.some(it => it.itemID === itemID);
    }

    function getItemByID(itemID) {
        console.log('[DEBUG] getItemByID called with:', itemID);
        if (!window.allLoadedItems) {
            console.log('[DEBUG] window.allLoadedItems is not ready');
            return null;
        }
        itemID = parseInt(itemID, 10);
        console.log('[DEBUG] Searching itemID in allLoadedItems:', itemID);
        const found = window.allLoadedItems.find(i => i.itemID === itemID);
        console.log('[DEBUG] Found item:', found);
        return found;
    }

    function toggleFavorite(itemID) {
        console.log('[DEBUG] toggleFavorite called with itemID:', itemID);
        if (!loggedInUser) {
            console.log('[DEBUG] not logged in, abort toggleFavorite');
            return;
        }
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        const item = getItemByID(itemID);
        if (!item) {
            console.log('[DEBUG] item not found in toggleFavorite');
            return;
        }

        const index = userFavs.findIndex(it => it.itemID === itemID);
        if (index >= 0) {
            userFavs.splice(index, 1);
            console.log('[DEBUG] removed item from favorites:', itemID);
        } else {
            userFavs.push({ itemID: itemID, item: item });
            console.log('[DEBUG] added item to favorites:', itemID);
        }

        favs[loggedInUser] = userFavs;
        localStorage.setItem('favorites', JSON.stringify(favs));
    }

    function displayItemNotFound() {
        console.log('[DEBUG] displayItemNotFound called');
        const container = document.querySelector('.item-details-container');
        if (container) {
            container.innerHTML = '<p style="text-align:center;">Item not found.</p>';
        }
    }

    function populateItemDetails(item) {
        console.log('[DEBUG] populateItemDetails with item:', item);
        const mainImage = document.getElementById('mainImage');
        const titleEl = document.querySelector('.item-title');
        const categoryEl = document.querySelector('.item-category span');
        const locationEl = document.querySelector('.item-location span');
        const priceEl = document.querySelector('.item-price span');
        const descEl = document.querySelector('.item-description');
        const sellerEl = document.querySelector('.item-seller');

        if (mainImage) mainImage.src = item.image;
        if (titleEl) titleEl.textContent = item.title || 'No Title';
        if (categoryEl) categoryEl.textContent = item.category || 'All';
        if (locationEl) locationEl.textContent = item.location || 'No Location';
        if (descEl) descEl.innerHTML = '<b>Description:</b> ' + (item.description || 'No description');
        if (sellerEl) sellerEl.innerHTML = '<b>Seller:</b> ' + (item.seller || 'Unknown');

        if (priceEl) {
            if (item.listingType === 'forSale') {
                priceEl.textContent = (item.price || 0) + ' KRW';
            } else if (item.listingType === 'free' || item.listingType === 'lostAndFound') {
                priceEl.textContent = '0 KRW';
            } else {
                priceEl.textContent = '';
            }
        }

        const contactSellerButton = document.getElementById('contactSellerBtn');
        if (contactSellerButton) {
            contactSellerButton.addEventListener('click', function () {
                console.log('[DEBUG] contactSellerBtn clicked');
                alert('This feature will be implemented soon. Stay tuned!');
            });
        }
    }

    function handleRegisterPage() {
        console.log('[DEBUG] handleRegisterPage called');
        if (!currentPage.startsWith('register')) return;
        console.log('[DEBUG] On register page');
        const form = document.getElementById('registerForm');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value.trim();
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value.trim();

            if (!(email.endsWith('@handong.ac.kr') || email.endsWith('@handong.edu'))) {
                alert('Email must end with @handong.ac.kr or @handong.edu');
                return;
            }

            if (username.length < 6) {
                alert('Username must be at least 6 characters.');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters.');
                return;
            }

            if (users.find(u => u.username === username || u.email === email)) {
                alert('Username or Email already exists.');
                return;
            }

            users.push({
                email: email,
                username: username,
                password: password,
                registerDate: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });
    }

    function handleLoginPage() {
        console.log('[DEBUG] handleLoginPage called');
        if (!currentPage.startsWith('login')) return;
        console.log('[DEBUG] On login page');
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const loginVal = document.getElementById('loginInput').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            const user = users.find(u =>
                ((u.username === loginVal || u.email === loginVal) && u.password === password)
            );

            if (user) {
                localStorage.setItem('loggedInUser', user.email);
                loggedInUser = user.email;
                window.location.href = 'index.html';
            } else {
                alert('Invalid username/password or user does not exist.');
            }
        });

        const goToRegister = document.getElementById('goToRegister');
        if (goToRegister) {
            goToRegister.addEventListener('click', function () {
                window.location.href = 'register.html';
            });
        }
    }

    function handleProfilePage() {
        console.log('[DEBUG] handleProfilePage called');
        if (!currentPage.startsWith('profile')) {
            console.log('[DEBUG] Not profile page, return');
            return;
        }
        console.log('[DEBUG] On profile page');
        if (!loggedInUser) {
            console.log('[DEBUG] not logged in, redirect to login');
            window.location.href = 'login.html';
            return;
        }

        const user = users.find(u => u.email === loggedInUser);
        if (!user) {
            console.log('[DEBUG] user not found in local users, remove loggedInUser and redirect');
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
            return;
        }

        const profileUsername = document.getElementById('profileUsername');
        const profileEmail = document.getElementById('profileEmail');
        const profileRegisterDate = document.getElementById('profileRegisterDate');

        if (profileUsername) profileUsername.textContent = user.username;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileRegisterDate) profileRegisterDate.textContent = new Date(user.registerDate).toLocaleString();

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                console.log('[DEBUG] logoutBtn clicked');
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            });
        }

        const changePassForm = document.getElementById('changePasswordForm');
        if (changePassForm) {
            changePassForm.addEventListener('submit', function (e) {
                e.preventDefault();
                console.log('[DEBUG] changePassForm submitted');
                const curPass = document.getElementById('currentPassword').value;
                const newPass = document.getElementById('newPassword').value.trim();
                const confirmPass = document.getElementById('confirmPassword').value.trim();

                if (curPass !== user.password) {
                    alert('Current password is wrong!');
                    return;
                }
                if (newPass !== confirmPass) {
                    alert('Passwords do not match.');
                    return;
                }

                user.password = newPass;
                localStorage.setItem('users', JSON.stringify(users));
                alert('Password changed successfully!');
                window.location.href = 'index.html';
            });
        }

        // Displaying user's own posts
        const profileContainer = document.querySelector('.profile-section.profile-posts .profile-container');
        if (!profileContainer) {
            console.log('[DEBUG] profileContainer not found for posts');
            return;
        }

        function getUserPostedItems() {
            console.log('[DEBUG] getUserPostedItems called');
            let userItems = [];
            for (let catKey in postedItems) {
                let catArr = postedItems[catKey];
                if (!Array.isArray(catArr)) catArr = [catArr];
                catArr.forEach(it => {
                    if (it.seller === user.username) {
                        userItems.push(it);
                    }
                });
            }
            console.log('[DEBUG] userItems found:', userItems);
            return userItems;
        }

        function deleteUserPost(itemID) {
            console.log('[DEBUG] deleteUserPost called with itemID:', itemID);
            for (let catKey in postedItems) {
                let catArr = postedItems[catKey];
                if (!Array.isArray(catArr)) catArr = [catArr];
                let index = catArr.findIndex(it => it.itemID === itemID && it.seller === user.username);
                if (index >= 0) {
                    catArr.splice(index, 1);
                    postedItems[catKey] = catArr; 
                    localStorage.setItem('postedItems', JSON.stringify(postedItems));
                    displayUserPosts();
                    return;
                }
            }
        }

        function displayUserPosts() {
            console.log('[DEBUG] displayUserPosts called');
            let userItems = getUserPostedItems();

            if (userItems.length === 0) {
                profileContainer.innerHTML = "<p>No posts here yet.</p>";
                return;
            }

            let htmlStr = '';
            userItems.forEach(item => {
                console.log('[DEBUG] displaying user post itemID:', item.itemID, 'title:', item.title);
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                
                htmlStr += `
                    <div class="favorite-item" data-itemid="${item.itemID}" style="width:200px; height:auto;">
                        <img src="${item.image}" alt="${item.title}" style="max-width:100%; height:auto;">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                        <div class="item-actions">
                            <button class="delete-post-btn" data-itemid="${item.itemID}">Delete</button>
                        </div>
                    </div>
                `;
            });

            profileContainer.innerHTML = htmlStr;

            const deleteButtons = profileContainer.querySelectorAll('.delete-post-btn');
            deleteButtons.forEach(btn => {
                console.log('[DEBUG] attaching delete listener to post itemID:', btn.getAttribute('data-itemid'));
                btn.addEventListener('click', e => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    console.log('[DEBUG] delete button clicked, itemID:', itemID);
                    deleteUserPost(itemID);
                });
            });
        }

        displayUserPosts();
    }

    function handlePostItemPage() {
        console.log('[DEBUG] handlePostItemPage called');
        if (!currentPage.startsWith('post_item')) {
            console.log('[DEBUG] Not post_item page, return');
            return;
        }
        console.log('[DEBUG] On post_item page');
        if (!loggedInUser) {
            console.log('[DEBUG] not logged in, redirect to login');
            window.location.href = 'login.html';
            return;
        }

        const user = users.find(u => u.email === loggedInUser);
        const sellerUsername = user ? user.username : 'Unknown';

        const form = document.getElementById('postItemForm');
        if (!form) return;

        const priceInput = document.getElementById('postPrice');
        const openToOffersCheckbox = document.getElementById('openToOffers');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('[DEBUG] postItemForm submitted');
            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            let listingType;
            if (category === "Free") {
                listingType = "free";
            } else if (category === "LostnFound") {
                listingType = "lostAndFound";
            } else {
                listingType = "forSale";
            }

            const description = document.getElementById('postDescription').value.trim();
            const location = document.getElementById('postLocation').value.trim();
            const images = document.getElementById('postImages').files;

            let imagePath = 'item-images/default.png';
            if (images.length > 0) {
                const imageName = images[0].name.trim();
                if (imageName) {
                    imagePath = 'item-images/' + imageName;
                }
            }

            let priceVal = 0;
            let offers = false;
            if (listingType === 'forSale') {
                priceVal = parseInt(priceInput.value) || 0;
                offers = openToOffersCheckbox.checked;
            }

            if (!postedItems[category]) {
                postedItems[category] = [];
            }

            let nextID = Math.floor(Math.random() * 1000000);
            console.log('[DEBUG] Creating new item with itemID:', nextID);
            const newItem = {
                itemID: nextID,
                title: title,
                description: description,
                image: imagePath,
                location: location,
                seller: sellerUsername,
                listingType: listingType,
                openToOffers: offers,
                price: priceVal,
                postedDate: new Date().toISOString(),
                category: category
            };

            postedItems[category].push(newItem);
            localStorage.setItem('postedItems', JSON.stringify(postedItems));
            alert('Item posted successfully!');
            window.location.href = 'index.html';
        });
    }

    function handleCategoryPage() {
        console.log('[DEBUG] handleCategoryPage called');
        if (!currentPage.startsWith('category')) {
            console.log('[DEBUG] Not category page, returning');
            return;
        }
        console.log('[DEBUG] On category page');
        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '';
        console.log('[DEBUG] category from URL:', category);

        const itemsContainer = document.getElementById('categoryItems');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        if (categorySelect) categorySelect.value = category;

        function getAllItems() {
            console.log('[DEBUG] getAllItems called');
            let items = window.allLoadedItems || [];
            console.log('[DEBUG] total items loaded:', items.length);
            if (category) {
                items = items.filter(it => it.category === category);
                console.log('[DEBUG] filtered by category:', category, 'items.length:', items.length);
            }
            return items;
        }

        function attachCategoryItemEventListeners() {
            console.log('[DEBUG] attachCategoryItemEventListeners called');
            const heartButtons = document.querySelectorAll('.heart-btn');
            const buyButtons = document.querySelectorAll('.buy-btn');
            console.log('[DEBUG] heartButtons count:', heartButtons.length);
            console.log('[DEBUG] buyButtons count:', buyButtons.length);

            heartButtons.forEach(btn => {
                const dataItemID = btn.getAttribute('data-itemid');
                console.log('[DEBUG] heart button data-itemid:', dataItemID);
                btn.addEventListener('click', (e) => {
                    const itemIDStr = e.currentTarget.getAttribute('data-itemid');
                    console.log('[DEBUG] heart button clicked, itemIDStr:', itemIDStr);
                    const itemID = parseInt(itemIDStr, 10);
                    console.log('[DEBUG] parsed heart itemID:', itemID);
                    if (!loggedInUser) {
                        console.log('[DEBUG] not logged in, redirecting to login');
                        window.location.href = 'login.html';
                        return;
                    }
                    toggleFavorite(itemID);
                    const isFav = isItemFavorited(itemID);
                    e.currentTarget.querySelector('img').src = `images/${isFav ? 'heartLiked.svg' : 'heartUnliked.svg'}`;
                });
            });

            buyButtons.forEach(btn => {
                const dataItemID = btn.getAttribute('data-itemid');
                console.log('[DEBUG] buy button data-itemid:', dataItemID);
                btn.addEventListener('click', (e) => {
                    const itemIDStr = e.currentTarget.getAttribute('data-itemid');
                    console.log('[DEBUG] buy button clicked, itemIDStr:', itemIDStr);
                    const itemID = parseInt(itemIDStr, 10);
                    console.log('[DEBUG] parsed buy itemID:', itemID);
                    if (!loggedInUser) {
                        console.log('[DEBUG] not logged in, redirecting to login');
                        window.location.href = 'login.html';
                        return;
                    }
                    console.log('[DEBUG] redirecting to item_details with itemID:', itemID);
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        }

        function displayItems() {
            console.log('[DEBUG] displayItems called');
            const items = getAllItems();
            if (!itemsContainer) {
                console.log('[DEBUG] itemsContainer not found');
                return;
            }
            if (items.length === 0) {
                console.log('[DEBUG] no items found');
                itemsContainer.innerHTML = '<p style="text-align:center;">No items found.</p>';
                return;
            }

            console.log('[DEBUG] items to display:', items.length);
            const sortValue = sortSelect ? sortSelect.value : 'time_desc';
            console.log('[DEBUG] sortValue:', sortValue);
            if (sortValue === 'time_desc') {
                items.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
            } else if (sortValue === 'time_asc') {
                items.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
            } else if (sortValue === 'price_asc') {
                items.sort((a, b) => a.price - b.price);
            } else if (sortValue === 'price_desc') {
                items.sort((a, b) => b.price - a.price);
            }

            let htmlStr = '';
            items.forEach(item => {
                console.log('[DEBUG] Rendering item:', item.title, 'with itemID:', item.itemID);
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                const isFav = isItemFavorited(item.itemID);
                const heartIcon = isFav ? 'heartLiked.svg' : 'heartUnliked.svg';

                htmlStr += `
                    <div class="item-card" data-itemid="${item.itemID}">
                        <img src="${item.image}" alt="${item.title}">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                        <div class="item-actions">
                            <button class="heart-btn" data-itemid="${item.itemID}">
                                <img src="images/${heartIcon}" alt="heart" width="24">
                            </button>
                            <button class="buy-btn" data-itemid="${item.itemID}">Buy</button>
                        </div>
                    </div>
                `;
            });
            itemsContainer.innerHTML = htmlStr;
            attachCategoryItemEventListeners();
        }

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function () {
                console.log('[DEBUG] applyFiltersBtn clicked');
                const newCategory = categorySelect ? categorySelect.value : '';
                category = newCategory;
                displayItems();
            });
        }

        displayItems();
    }

    function handleFavoritesPage() {
        console.log('[DEBUG] handleFavoritesPage called');
        if (!currentPage.startsWith('favorites')) {
            console.log('[DEBUG] Not favorites page, return');
            return;
        }
        console.log('[DEBUG] On favorites page');
        if (!loggedInUser) {
            console.log('[DEBUG] not logged in, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        const favContainer = document.getElementById('favoritesContainer');
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        if (userFavs.length === 0) {
            favContainer.innerHTML = "<p>You don't have liked items</p>";
            return;
        }

        let htmlStr = '';
        userFavs.forEach(f => {
            const item = f.item;
            const itemID = item.itemID;
            console.log('[DEBUG] rendering favorite item:', item.title, 'itemID:', itemID);
            const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';

            htmlStr += `
                <div class="favorite-item" data-itemid="${itemID}">
                    <img src="${item.image}" alt="${item.title}" style="max-width:100%; height:auto;">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <p><strong>Location:</strong> ${item.location}</p>
                    <p><strong>Seller:</strong> ${item.seller}</p>
                    ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                    <div class="item-actions">
                        <button class="heart-btn" data-itemid="${itemID}">
                            <img src="images/heartLiked.svg" alt="heart" width="24">
                        </button>
                        <button class="buy-btn" data-itemid="${itemID}">Buy</button>
                    </div>
                </div>
            `;
        });

        favContainer.innerHTML = htmlStr;

        const heartButtons = favContainer.querySelectorAll('.heart-btn');
        const buyButtons = favContainer.querySelectorAll('.buy-btn');

        heartButtons.forEach(btn => {
            console.log('[DEBUG] attaching event to fav heart-btn itemID:', btn.getAttribute('data-itemid'));
            btn.addEventListener('click', e => {
                const itemIDStr = e.currentTarget.getAttribute('data-itemid');
                console.log('[DEBUG] fav heart button clicked, itemIDStr:', itemIDStr);
                const itemID = parseInt(itemIDStr, 10);
                console.log('[DEBUG] parsed fav heart itemID:', itemID);
                if (!loggedInUser) {
                    console.log('[DEBUG] not logged in, redirect to login');
                    window.location.href = 'login.html';
                    return;
                }
                toggleFavorite(itemID);
                e.currentTarget.closest('.favorite-item').remove();
                if (favContainer.children.length === 0) {
                    favContainer.innerHTML = "<p>You don't have liked items</p>";
                }
            });
        });

        buyButtons.forEach(btn => {
            console.log('[DEBUG] attaching event to fav buy-btn itemID:', btn.getAttribute('data-itemid'));
            btn.addEventListener('click', e => {
                const itemIDStr = e.currentTarget.getAttribute('data-itemid');
                console.log('[DEBUG] fav buy button clicked, itemIDStr:', itemIDStr);
                const itemID = parseInt(itemIDStr, 10);
                console.log('[DEBUG] parsed fav buy itemID:', itemID);
                if (!loggedInUser) {
                    console.log('[DEBUG] not logged in, redirect to login');
                    window.location.href = 'login.html';
                    return;
                }
                console.log('[DEBUG] redirecting to item_details with itemID:', itemID);
                window.location.href = `item_details.html?itemID=${itemID}`;
            });
        });
    }

    function handleSearchFromIndex() {
        console.log('[DEBUG] handleSearchFromIndex called');
        if (!currentPage.startsWith('index')) {
            console.log('[DEBUG] Not index page, return');
            return;
        }
        console.log('[DEBUG] On index page');
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('searchResults');

        if (!searchForm) return;
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('[DEBUG] searchForm submitted');
            const query = searchInput.value.trim().toLowerCase();
            console.log('[DEBUG] query:', query);
            if (!query) return;

            let allItems = window.allLoadedItems || [];
            console.log('[DEBUG] allItems count:', allItems.length);
            let filtered = allItems.filter(item => item.title.toLowerCase().includes(query));
            console.log('[DEBUG] filtered items count:', filtered.length);
            if (filtered.length === 0) {
                searchResults.innerHTML = '<p>No results found.</p>';
                return;
            }

            let htmlStr = '<div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center;">';
            filtered.forEach(item => {
                console.log('[DEBUG] rendering search result itemID:', item.itemID, 'title:', item.title);
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                htmlStr += `
                <div class="item-card">
                    <img src="${item.image}" alt="${item.title}">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <p><strong>Location:</strong> ${item.location}</p>
                    <p><strong>Seller:</strong> ${item.seller}</p>
                    ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                    <div class="item-actions">
                        <button class="buy-btn" data-itemid="${item.itemID}">View</button>
                    </div>
                </div>
                `;
            });
            htmlStr += '</div>';
            searchResults.innerHTML = htmlStr;

            const viewButtons = searchResults.querySelectorAll('.buy-btn');
            viewButtons.forEach(btn => {
                console.log('[DEBUG] attaching event to search result buy-btn itemID:', btn.getAttribute('data-itemid'));
                btn.addEventListener('click', e => {
                    const itemIDStr = e.currentTarget.getAttribute('data-itemid');
                    console.log('[DEBUG] search result buy button clicked, itemIDStr:', itemIDStr);
                    const itemID = parseInt(itemIDStr, 10);
                    console.log('[DEBUG] parsed search buy itemID:', itemID);
                    if (!loggedInUser) {
                        console.log('[DEBUG] not logged in, redirect to login');
                        window.location.href = 'login.html';
                        return;
                    }
                    console.log('[DEBUG] redirecting to item_details with itemID:', itemID);
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        });
    }

    function handleItemDetailsPage() {
        console.log('[DEBUG] handleItemDetailsPage called');
        if (!currentPage.startsWith('item_details')) {
            console.log('[DEBUG] Not item_details page, return');
            return;
        }
        console.log('[DEBUG] On item_details page');
        if (!loggedInUser) {
            console.log('[DEBUG] not logged in, redirect to login');
            window.location.href = 'login.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const itemID = urlParams.get('itemID');
        console.log('[DEBUG] itemID from URL:', itemID);
        if (!itemID) {
            console.log('[DEBUG] no itemID in URL');
            displayItemNotFound();
            return;
        }

        const item = getItemByID(itemID);
        if (!item) {
            console.log('[DEBUG] item not found for itemID:', itemID);
            displayItemNotFound();
            return;
        }

        console.log('[DEBUG] populating item details with:', item);
        populateItemDetails(item);
    }

    fetchAndLoadItems().then(() => {
        try {
            updateHeaderLoginLink();
            handleRegisterPage();
            handleLoginPage();
            handleProfilePage();
            handlePostItemPage();
            handleCategoryPage();
            handleFavoritesPage();
            handleSearchFromIndex();
            handleItemDetailsPage();
        } catch (err) {
            console.error('[DEBUG] Error in fetchAndLoadItems chain:', err);
        }
    }).catch(err => {
        console.error('[DEBUG] Error in fetchAndLoadItems chain:', err);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    console.log('[DEBUG] Second DOMContentLoaded fired - for price container logic');
    const categorySelect = document.getElementById("postCategory");
    const priceContainer = document.getElementById("priceContainer");
    console.log('[DEBUG] categorySelect:', categorySelect);
    console.log('[DEBUG] priceContainer:', priceContainer);

    function togglePriceVisibility() {
        console.log('[DEBUG] togglePriceVisibility called');
        if (!categorySelect || !priceContainer) {
            console.log('[DEBUG] No categorySelect in DOM for price visibility logic');
            return;
        }
        const selectedCategory = categorySelect.value;
        console.log('[DEBUG] selectedCategory:', selectedCategory);
        if (selectedCategory === "Free" || selectedCategory === "LostnFound") {
            priceContainer.classList.add("hidden");
        } else {
            priceContainer.classList.remove("hidden");
        }
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", togglePriceVisibility);
        togglePriceVisibility();
    }
});