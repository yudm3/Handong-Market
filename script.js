document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();
    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let postedItems = JSON.parse(localStorage.getItem('postedItems')) || {};

    let defaultItemsData = {
        "Books": [
            {
                "title": "Korean 2A",
                "description": "Selling this textbook for Korean 3 HGU class.",
                "image": "item-images/book1.jpg",
                "location": "Library Entrance",
                "seller": "dariti",
                "listingType": "forSale",
                "openToOffers": true,
                "price": 6000,
                "postedDate": "2024-12-02T10:15:00Z"
            },
            {
                "title": "Bob Cofflin 'The importance of worship'",
                "description": "Selling this book. It is trully great. I would recommend it for everyone.",
                "image": "item-images/book2.jpg",
                "location": "Dorm Lobby",
                "seller": "yudima",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 10000,
                "postedDate": "2024-12-03T14:20:00Z"
            },
            {
                "title": "Les Misérables",
                "description": "Book by Victor Hugo written in Russain. Great condition!",
                "image": "item-images/book3.jpg",
                "location": "Study Room",
                "seller": "vasya06",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 8000,
                "postedDate": "2024-12-05T09:00:00Z"
            }
        ],
        "Electronics": [
            {
                "title": "Logitech Mouse",
                "description": "Great Logiech Mouse. Selling it for a decent price. Please contact me.",
                "image": "item-images/mouse.jpg",
                "location": "Cafeteria",
                "seller": "yudima",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 10000,
                "postedDate": "2024-12-01T11:45:00Z"
            },
            {
                "title": "AirPods 1st generation",
                "description": "Used carefully. Battery ~5 hours.",
                "image": "item-images/airpods.jpg",
                "location": "Dorm Lobby",
                "seller": "leolyab",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 25000,
                "postedDate": "2024-12-07T16:10:00Z"
            },
            {
                "title": "Iphone 15 pro 256gb",
                "description": "iPhone 15 Pro 256GB camera, battery 88%. Inquire about price!",
                "image": "item-images/iphone.jpg",
                "location": "Campus Center",
                "seller": "vasya06",
                "listingType": "forSale",
                "openToOffers": true,
                "price": 1000000,
                "postedDate": "2024-12-08T20:30:00Z"
            }
        ],
        "Clothes": [
            {
                "title": "Asics Gel Grey",
                "description": "Size 280mm. Great shoes for everyday use.",
                "image": "item-images/shoes.jpg",
                "location": "Dorm 2",
                "seller": "lealea",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 65000,
                "postedDate": "2024-12-04T08:00:00Z"
            },
            {
                "title": "Wide Pants",
                "description": "Wide casual male pants. One-Size.",
                "image": "item-images/pants.jpg",
                "location": "Library Entrance",
                "seller": "abcaca",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 30000,
                "postedDate": "2024-12-05T12:10:00Z"
            },
            {
                "title": "Glasses fashion ",
                "description": "They are new. No prescription.",
                "image": "item-images/glasses.jpg",
                "location": "Cafeteria",
                "seller": "miaffa",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 15000,
                "postedDate": "2024-12-06T14:45:00Z"
            }
        ],
        "Services": [
            {
                "title": "Manicure + Design",
                "description": "Certificate available. Complex designs cost extra.",
                "image": "item-images/nails.jpg",
                "location": "Dorm 4",
                "seller": "naily78",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 25000,
                "postedDate": "2024-12-02T13:00:00Z"
            },
            {
                "title": "Cut & Hairstyle services",
                "description": "Pretty hair for special events, also simple cuts.",
                "image": "item-images/hair.jpg",
                "location": "Campus Salon",
                "seller": "olihair",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 20000,
                "postedDate": "2024-12-03T09:30:00Z"
            },
            {
                "title": "Korean Tutoring",
                "description": "For intermediate learners, conversation or TOPIK 2 prep.",
                "image": "item-images/korean.jpg",
                "location": "Study Room 2",
                "seller": "koroek",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 8000,
                "postedDate": "2024-12-06T18:05:00Z"
            }
        ],
        "FoodnCoupons": [
            {
                "title": "Syrniki",
                "description": "Freshly made syrniki! Price for 2 pcs",
                "image": "item-images/syr.jpg",
                "location": "Cafeteria",
                "seller": "eirtwq",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 3000,
                "postedDate": "2024-12-02T17:20:00Z"
            },
            {
                "title": "Starbucks Card",
                "description": "Got this card as a gift, selling cheaper.",
                "image": "item-images/sbcard.jpg",
                "location": "Dorm 1",
                "seller": "hartoe",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 8000,
                "postedDate": "2024-12-07T09:40:00Z"
            },
            {
                "title": "Starbucks Coupon",
                "description": "Please buy and use soon!",
                "image": "item-images/sbcoupon.jpg",
                "location": "Campus Center",
                "seller": "rewtyu",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 28000,
                "postedDate": "2024-12-08T08:55:00Z"
            }
        ],
        "LostnFound": [
            {
                "title": "LOST necklace",
                "description": "Lost Necklace near Cafeteria.",
                "image": "item-images/necklace.jpg",
                "location": "Cafeteria",
                "seller": "kolioai",
                "listingType": "lostAndFound",
                "openToOffers": false,
                "price": 0,
                "postedDate": "2024-12-01T09:00:00Z"
            },
            {
                "title": "FOUND UZSpace Water bottle",
                "description": "Found bottle behind Soccer Field",
                "image": "item-images/waterbottle.jpg",
                "location": "Soccer Field",
                "seller": "lkslils",
                "listingType": "lostAndFound",
                "openToOffers": false,
                "price": 0,
                "postedDate": "2024-12-05T15:30:00Z"
            },
            {
                "title": "FOUND KB Bank Card",
                "description": "Found KB Card (Yugay Dmitriy) on Romantic Field",
                "image": "item-images/bankcard.jpg",
                "location": "Romantic Field",
                "seller": "golity",
                "listingType": "lostAndFound",
                "openToOffers": false,
                "price": 0,
                "postedDate": "2024-12-03T20:10:00Z"
            }
        ],
        "Free": [
            {
                "title": "Stickers 6 pcs",
                "description": "Giving away 6 packs of stickers",
                "image": "item-images/stickers.jpg",
                "location": "Dorm 3",
                "seller": "polina",
                "listingType": "free",
                "openToOffers": false,
                "price": 0,
                "postedDate": "2024-12-04T11:00:00Z"
            },
            {
                "title": "3 notebooks",
                "description": "New notebooks, take if needed :)",
                "image": "item-images/notebooks.jpg",
                "location": "Library Entrance",
                "seller": "gory2a",
                "listingType": "free",
                "openToOffers": false,
                "price": 0,
                "postedDate": "2024-12-06T07:20:00Z"
            },
            {
                "title": "Termo Cup",
                "description": "Moving out, don't need this cup.",
                "image": "item-images/cup.jpg",
                "location": "Dorm Lobby",
                "seller": "lina21",
                "listingType": "free",
                "openToOffers": false,
                "price": 0,
                "postedDate": "2024-12-07T21:00:00Z"
            }
        ],
        "Others": [
            {
                "title": "Markers",
                "description": "Almost new markers, used couple times.",
                "image": "item-images/markers.jpg",
                "location": "Campus Center",
                "seller": "kieoro",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 5000,
                "postedDate": "2024-12-01T10:00:00Z"
            },
            {
                "title": "Coffee Beans",
                "description": "Blue Bottle Coffee beans, bright taste.",
                "image": "item-images/beans.jpg",
                "location": "Dorm 1",
                "seller": "popos1",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 12000,
                "postedDate": "2024-12-02T13:50:00Z"
            },
            {
                "title": "Mineral Stones",
                "description": "Beautiful mineral stones from Japan.",
                "image": "item-images/stones.jpg",
                "location": "Cafeteria",
                "seller": "balytu",
                "listingType": "forSale",
                "openToOffers": false,
                "price": 25000,
                "postedDate": "2024-12-08T12:00:00Z"
            }
        ]
    };

    function maskUserIdentifier(identifier) {
        if (!identifier) return '';
        if (identifier.length > 4) {
            return identifier.substring(0, 2) + '**' + identifier.substring(identifier.length - 2);
        } else {
            return identifier;
        }
    }

    function updateHeaderLoginLink() {
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
        if (!loggedInUser) return false;
        const userFavs = getUserFavorites();
        return userFavs.some(it => it.itemID === itemID);
    }

    function toggleFavorite(itemID) {
        if (!loggedInUser) return;
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        const item = getItemByID(itemID);
        if (!item) return;

        const index = userFavs.findIndex(it => it.itemID === itemID);
        if (index >= 0) {
            userFavs.splice(index, 1);
        } else {
            userFavs.push({ itemID: itemID, item: item });
        }

        favs[loggedInUser] = userFavs;
        localStorage.setItem('favorites', JSON.stringify(favs));
    }

    function getNextItemID() {
        let nextID = parseInt(localStorage.getItem('nextItemID'), 10);
        if (isNaN(nextID)) {
            nextID = 1;
        }
        return nextID;
    }

    function setNextItemID(id) {
        localStorage.setItem('nextItemID', id.toString());
    }

    function assignIDsToDefaultItems(defaultItems) {
        let currentID = 1;
        for (let catKey in defaultItems) {
            defaultItems[catKey].forEach(it => {
                if (!it.itemID) {
                    it.itemID = currentID;
                    currentID++;
                } else {
                    if (it.itemID >= currentID) currentID = it.itemID + 1;
                }
            });
        }
        let storedNext = parseInt(localStorage.getItem('nextItemID'), 10);
        if (isNaN(storedNext) || storedNext < currentID) {
            setNextItemID(currentID);
        }
    }

    function loadItemsFromLocalStorage() {
        let defaultItems = JSON.parse(localStorage.getItem('defaultItems'));
        if (!defaultItems) {
            localStorage.setItem('defaultItems', JSON.stringify(defaultItemsData));
            defaultItems = JSON.parse(localStorage.getItem('defaultItems'));
        }

        assignIDsToDefaultItems(defaultItems);

        let combined = [];
        for (let catKey in defaultItems) {
            let catItems = defaultItems[catKey];
            catItems.forEach(it => {
                if (!it.category) it.category = catKey;
            });
            combined = combined.concat(catItems);
        }

        for (let catKey in postedItems) {
            let postedCatItems = postedItems[catKey];
            if (!Array.isArray(postedCatItems)) postedCatItems = [postedCatItems];
            postedCatItems.forEach(it => {
                if (!it.category) it.category = catKey;
                if (!it.itemID) {
                    let nextID = getNextItemID();
                    it.itemID = nextID;
                    setNextItemID(nextID + 1);
                }
            });
            combined = combined.concat(postedCatItems);
        }

        window.allLoadedItems = combined;
        localStorage.setItem('defaultItems', JSON.stringify(defaultItems));
    }

    function getItemByID(itemID) {
        if (!window.allLoadedItems) return null;
        itemID = parseInt(itemID, 10);
        return window.allLoadedItems.find(i => i.itemID === itemID);
    }

    function displayItemNotFound() {
        const container = document.querySelector('.item-details-container');
        if (container) {
            container.innerHTML = '<p style="text-align:center;">Item not found.</p>';
        }
    }

    function populateItemDetails(item) {
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
        if (descEl) descEl.innerHTML = `<b>Description:</b> ${item.description || 'No description'}`;
        if (sellerEl) sellerEl.innerHTML = `<b>Seller:</b> ${item.seller || 'Unknown'}`;

        if (priceEl) {
            if (item.listingType === 'forSale') {
                priceEl.textContent = (item.price || 0) + ' KRW';
            } else if (item.listingType === 'free' || item.listingType === 'lostAndFound') {
                priceEl.textContent = '0 KRW';
            } else {
                priceEl.textContent = '';
            }
        }
    }

    function handleRegisterPage() {
        if (currentPage !== 'register.html') return;
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
        if (currentPage !== 'login.html') return;
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
        if (currentPage !== 'profile.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const user = users.find(u => u.email === loggedInUser);
        if (!user) {
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
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            });
        }

        const changePassForm = document.getElementById('changePasswordForm');
        if (changePassForm) {
            changePassForm.addEventListener('submit', function (e) {
                e.preventDefault();
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
    }

    function handlePostItemPage() {
        if (currentPage !== 'post_item.html') return;
        if (!loggedInUser) {
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

            let imagePath = 'item-images/default.jpg';
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
            } else {
                // for free or lostAndFound, price = 0, offers = false
                priceVal = 0;
                offers = false;
            }

            if (!postedItems[category]) {
                postedItems[category] = [];
            }

            // let nextID = getNextItemID();
            let nextID = Math.floor(Math.random() * 1000000);
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
            console.log(localStorage.getItem('postedItems'));
            alert('Item posted successfully!');
            // We could call loadItemsFromLocalStorage(), but let's just redirect to see changes on next load:
            // loadItemsFromLocalStorage();
            window.location.href = 'index.html';
        });
    }

    function handleCategoryPage() {
        if (currentPage !== 'category.html') return;

        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '';

        const itemsContainer = document.getElementById('categoryItems');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        if (categorySelect) categorySelect.value = category;

        function getAllItems() {
            let items = window.allLoadedItems || [];
            if (category) {
                items = items.filter(it => it.category === category);
            }
            return items;
        }

        function attachCategoryItemEventListeners() {
            const heartButtons = document.querySelectorAll('.heart-btn');
            const buyButtons = document.querySelectorAll('.buy-btn');

            heartButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        window.location.href = 'login.html';
                        return;
                    }
                    toggleFavorite(itemID);
                    const isFav = isItemFavorited(itemID);
                    e.currentTarget.querySelector('img').src = `images/${isFav ? 'heartLiked.svg' : 'heartUnliked.svg'}`;
                });
            });

            buyButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        window.location.href = 'login.html';
                        return;
                    }
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        }

        function displayItems() {
            const items = getAllItems();

            const sortValue = sortSelect ? sortSelect.value : 'time_desc';
            if (sortValue === 'time_desc') {
                items.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
            } else if (sortValue === 'time_asc') {
                items.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
            } else if (sortValue === 'price_asc') {
                items.sort((a, b) => a.price - b.price);
            } else if (sortValue === 'price_desc') {
                items.sort((a, b) => b.price - a.price);
            }

            if (items.length === 0) {
                itemsContainer.innerHTML = '<p style="text-align:center;">No items found.</p>';
                return;
            }

            let htmlStr = '';
            items.forEach(item => {
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
                category = categorySelect ? categorySelect.value : '';
                displayItems();
            });
        }

        displayItems();
    }

    function handleFavoritesPage() {
        if (currentPage !== 'favorites.html') return;
        if (!loggedInUser) {
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
            btn.addEventListener('click', e => {
                const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                if (!loggedInUser) {
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
            btn.addEventListener('click', e => {
                const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                if (!loggedInUser) {
                    window.location.href = 'login.html';
                    return;
                }
                window.location.href = `item_details.html?itemID=${itemID}`;
            });
        });
    }

    function handleSearchFromIndex() {
        if (currentPage !== 'index.html') return;

        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('searchResults');

        if (!searchForm) return;
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            let allItems = window.allLoadedItems || [];
            let filtered = allItems.filter(item => item.title.toLowerCase().includes(query));
            if (filtered.length === 0) {
                searchResults.innerHTML = '<p>No results found.</p>';
                return;
            }

            let htmlStr = '<div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center;">';
            filtered.forEach(item => {
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
                btn.addEventListener('click', e => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        window.location.href = 'login.html';
                        return;
                    }
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        });
    }

    function handleItemDetailsPage() {
        if (currentPage !== 'item_details.html') return;

        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const itemID = urlParams.get('itemID');
        if (!itemID) {
            displayItemNotFound();
            return;
        }

        const item = getItemByID(parseInt(itemID, 10));
        if (!item) {
            displayItemNotFound();
            return;
        }

        populateItemDetails(item);

        const contactSellerButton = document.getElementById('contactSellerBtn');
        if (contactSellerButton) {
            contactSellerButton.addEventListener('click', function () {
                alert('This feature will be implemented soon. Stay tuned!');
            });
        }
    }

    updateHeaderLoginLink();
    handleRegisterPage();
    handleLoginPage();
    handleProfilePage();
    handlePostItemPage();
    loadItemsFromLocalStorage();
    handleCategoryPage();
    handleFavoritesPage();
    handleSearchFromIndex();
    handleItemDetailsPage();
});


document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("postCategory");
    const priceContainer = document.getElementById("priceContainer");

    function togglePriceVisibility() {
        if (!categorySelect || !priceContainer) return;
        const selectedCategory = categorySelect.value;
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