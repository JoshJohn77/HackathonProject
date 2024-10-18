# Web Server Project

This project is a web server built using Node.js and Express.js that used MongoDB as the database. The server includes features such as user authentication, registration, login, profile management, and admin functionalities. It also utilizes JWT to authenticate users and bcrypt for password encryption.

## Features Implemented

### 1. User Registration
- Users can create an account by providing their name, email, and password.
- The email present must be unique.
- Passwords are encrypted using bcrypt before being stored in MongoDB.

### 2. User Login
- Users can log in using their email and password.
- A JWT token is generated upon successful login and stored in a cookie that would expire in 30 minutes.
- Invalid login attempts clear the session cookies and make the user re-enter their login information.

### 3. User Profile
- Users can view their profile information, including their name and email.
- Users can update their name, email, and password through the profile update page.
- JWT tokens are refreshed upon profile updates.

### 4. Admin Features
- Users with emails ending in `@Umee.com` are automatically given admin privileges.
- Admins can view a table of all non-admin users without accessing other admin information.

### 5. Password Encryption
- Passwords are encrypted using bcrypt.
- Passwords are only then stored in MongoDB.

## Testing Procedures

### 1. Initial Setup
- Verified that the server successfully connects to MongoDB upon startup.
- All sensitive data were not hardcoded to ensure data was secure.

### 2. Registration Testing
- Tested account creation with valid input data and ensured user data is stored in MongoDB with an encrypted password.
- Attempted registration with an existing email to confirm that the system prevents duplicate accounts.

### 3. Login Testing
- Verified that users can log in with the correct email and password and receive a valid JWT token in their cookies.
- Logging in with incorrect credentials would lead to error messages are displayed and no token is issued.
- Verified that tokens expire after 30 minutes of inactivity and automatically log out the user.

### 4. Profile Management
- Tested that the logged-in user can view their profile details.
- Updated user details and confirmed that the changes are shown in the MongoDB database.
- Ensured that non-logged-in users are redirected to the login page when attempting to access the profile page.

### 5. Admin Functionality Testing
- Tested email detection to ensure that users with emails ending in `@Umee.com` have admin privileges.
- Checked that admins can only view non-admin user details in the admin dashboard.
- Confirmed that non-admin users cannot access admin functionalities, even when attempting to manually navigate to restricted URLs.

### 6. Security Testing
- Verified that the token is validated correctly on each request to protected routes.
- Ensured that bcrypt hashes passwords before storing them and that password verification works correctly during login.
- Tested handling of expired or invalid tokens to make sure users are redirected to the login page.

## Conclusion
The web server has been tested for all implemented features, and it successfully handles user registration, login, profile updates, and admin privileges while ensuring security.
