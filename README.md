# HandongHarvest Marketplace

HandongHarvest is a client-side marketplace application tailored for the Handong community.  
This project enables users to:

- **Register & Login** using their Handong email  
- **Post items** for sale, free items, lost-and-found, etc.  
- **Browse items** by category, apply filters and sorting  
- **Favorite items** and view them in a dedicated favorites section  
- **View item details** on a standalone page  
- **Manage their own posts** (including deleting them)

All functionality is implemented on the client side using HTML, CSS, and JavaScript, with data persisted in the browser’s `localStorage`.  
Image uploads for posted items are stored as Base64 strings directly in `localStorage`.

The website is fully responsive, providing an optimal user experience on both desktop and mobile devices.  
It has been deployed and is accessible at: [https://handong-harvest.netlify.app/](https://handong-harvest.netlify.app/)

## Features

**User Registration & Login**:  
- Requires Handong email (`@handong.ac.kr` or `@handong.edu`)  
- Protects the community by ensuring only verified members use the platform

**User Profiles**:  
- View account details: username, email, registration date  
- Change password if needed  
- Manage user’s own posted listings

**Posting Items**:  
- Choose from categories: Books, Electronics, Services, Food & Coupons, Clothes, Lost & Found, Free, Others  
- Add a single image (converted to Base64 for storage)  
- Set price (if for sale), description, location, and whether open to offers  
- Save the item locally, displaying it for all users

**Browsing & Filtering**:  
- View items by category, with sorting (by time or price)  
- Toggle favorites (heart icon)  
- Access `favorites.html` to see all liked items  
- Search items on the `index.html` page by title

**Item Details Page**:  
- Shows one image, title, category, location, seller info, and price  
- Provides a "Contact Seller" button (placeholder feature, no backend)

**Additional Features**:  
- **Categories**: Items are organized into categories for easy navigation. Filters and sorting options enhance usability.
- **Favorites**: Users can like items, and these are stored in the favorites section. The feature is secured by requiring user authentication.
- **Footer Links**: Includes links to About Us, User Policy, FAQ, and Honor Code to maintain transparency and integrity.

## Technology Stack

- **Front-end**: HTML5, CSS3, JavaScript (vanilla)
- **No Backend/Server**: Entirely client-side  
- **Data Storage**: `localStorage` for users, posted items, and favorites

## Design and Development

The design process was centered around creating a warm and welcoming marketplace experience.  
Primary colors: `#1F4529`, `#FFFEF5`, `#47663B`, `#BC6C25`  
Font: Jost (inspired by Futura, supporting multiple languages)  
The platform was designed using Figma, ensuring consistency and attention to detail.

## How to Run

1. **Clone the Repository**:  
   ```bash
   git clone https://github.com/yudm3/Handong-Market.git
   cd Handong-Market
   ```

2. **Open `index.html` in a Browser**:  
   No server needed. Just open `index.html` to start using the application.

### Register & Login:
- Access `register.html` to create an account.
- Then login at `login.html`.

### Post Items & Browse:
- Use `post_item.html` to create new listings.
- Check `category.html` to filter and sort items.
- Mark favorites, view them on `favorites.html`.
- Check item details on `item_details.html`.

### Profile:
- On `profile.html`, view user info, change password, manage own posts.

## Notes & Limitations

- **No Backend**: All data is local to the browser. Clearing `localStorage` resets data.
- **Base64 Images**: May increase `localStorage` usage quickly and is not ideal for large files.
- **For Demonstration**: This is a school project/demo, not production-ready.

## Future Improvements
Based on user feedback and project goals:
- Adding seller ratings and customer reviews
- Expanding categories and implementing location-based filtering
- Introducing internal chat for communication between buyers and sellers
- Providing multilingual support (starting with Korean)

## Contributing

This is a closed concept and not open to public contributions at the moment. If you have suggestions, you may fork the repository and experiment on your own.

## License

All rights reserved (C) 2024 HandongHarvest.  
You may not reproduce, distribute, or create derivative works of this project’s code or concept without explicit written permission from the owner.
