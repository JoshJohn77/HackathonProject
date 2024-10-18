const express = require('express');
const connectDb = require('./db'); 
const User = require('./Models/User');
const jwt = require('jsonwebtoken');
const app = express();
const dotenv = require('dotenv');
require('crypto').randomBytes(64).toString('hex')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');


dotenv.config();

//Connects to MongoDB
connectDb();

app.use(express.urlencoded({ extended: true }));

//This get call will create the frontend page where users can make a new account
app.get("/", (req, res) => {
    //The HTML code that is sent out will create a form that will send all of the data to the /register POST call
    res.send(`
        <html>
            <body>
                <h1>Registration</h1>
                <form action="/register" method="POST">
                    <label for="name">Name:</label><br>
                    <input type="text" id="name" name="name"><br><br>

                    <label for="email">Email:</label><br>
                    <input type="email" id="email" name="email"><br><br>

                    <label for="password">Password:</label><br>
                    <input type="password" id="password" name="password"><br><br>

                    <input type="submit" value="Register">
                </form>
            </body>
        </html>
    `);
});


//This post call will recieve all of the data from the form in the html from the localHost:3000
app.post("/register", async (req, res) => {
    //This will save all of the necessary inputs
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    try {
        let existingUser = await User.findOne({ email });
        //This ensures that there can be no email duplicates
        if (existingUser) {
            res.status(400)
            //Notifies the user that there is an account created with that email and allows them to login in using that email
            res.send(`
                <html> 
                    <style>
                        .custom-button {
                            display: inline-block;              
                            padding: 5px 2px;                 
                            font-size: 16px;                    
                            font-family: Arial, sans-serif;     
                            color: #fff;                        
                            background-color: #007bff;          
                            border: none;                       
                            border-radius: 4px;                 
                            cursor: pointer;                    
                            text-align: center;                 
                            text-decoration: none;              
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
                            transition: background-color 0.3s;
                        }
                    </style>
                    <body>
                        <h3>Email is already in use.<h3/>
                        <h3>Please login<h3/>
                        <a href="http://localhost:3000/login" class="custom-button">Login</a>
                    <body/>
                <html/>
            `)
            return
        }
        //Encrypts the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Creates and adds a new User to MongoDB
        const registeredUser = new User({name, email, password: hashedPassword})
        await registeredUser.save();
        res.status(201)
        //Redirects the user to the login page
        res.redirect("/login");
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400)
        res.send('Error occured while registering user');
    }
});

//Creates a login page for the user
app.get("/login", (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Login</h1>
                <form action="/login/authentication" method="POST">
                    <label for="email">Email:</label><br>
                    <input type="email" id="email" name="email"><br><br>

                    <label for="password">Password:</label><br>
                    <input type="password" id="password" name="password"><br><br>

                    <input type="submit" value="Login">
                </form>
            </body>
        </html>
    `);
});

//Auuthenticating the user
app.post("/login/authentication", async (req, res) => {
    //Saves all of the information from the form data in "/login"
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            //Creates a JWT_TOKEN
            const token = generateAccessToken(email)
            //Sends that token through a cookie that expires in 30 minutes
            res.cookie('token', token, {
                httpOnly: true,  
                secure: true,    
                maxAge: 1800 * 1000 
            });

            res.status(201)
            res.redirect("/profile")
        } else {
            res.clearCookie('token');
            res.status(400)
            res.send("Invalid email or password. Please try again")
        }
    } catch (error) {
        console.error('Error during authentication:' + error);
        res.status(400)
        res.send("Error occured while authenticating user")
    }
});

//This creates a profile page where teh suer can see details regarding their account
app.get("/profile", async(req,res) => {
    //Gets the token through the cookie
    const userToken = req.cookies.token
    try {
        //Decodes the token
        const decoded = jwt.verify(userToken, process.env.TOKEN_SECRET);
        if (!userToken) {
            res.status(401)
            res.redirect("/login")
            res.send("NO TOKEN PRESENT")
            return
        }
        const email = decoded.email
        const userName = (await User.findOne({ email })).name;
        let additionalContent = "";
        //Checks if the email is an admin email 
        if (isAdmin(email)) {
            additionalContent = `
                <p>Admin status: True</p>
                <a href="http://localhost:3000/adminView" class="custom-button">View All Profiles</a>
            `;
        }
        res.status(200)
        res.send(`
            <html>
                <style>
                    .custom-button {
                        display: inline-block;              /* Makes it behave like a button */
                        padding: 5px 2px;                 /* Padding for button size */
                        font-size: 16px;                    /* Font size similar to a default button */
                        font-family: Arial, sans-serif;     /* Default button font style */
                        color: #fff;                        /* White text color */
                        background-color: #007bff;          /* Button background color (blue) */
                        border: none;                       /* No border */
                        border-radius: 4px;                 /* Rounded corners like a default button */
                        cursor: pointer;                    /* Pointer cursor on hover */
                        text-align: center;                 /* Center the text inside the button */
                        text-decoration: none;              /* Remove the underline */
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Slight shadow for depth */
                        transition: background-color 0.3s;  /* Smooth transition for hover effect */
                    }
                </style>
                <body>
                    <h1>Welcome ${userName}</h1>
                    <p>Email: ${email}</p>
                    ${additionalContent}
                    <a href="http://localhost:3000/profile/update" class="custom-button">Update Profile</a>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Invalid token:', error);
        res.status(401)
        res.send('Access Denied: Invalid token');
    }
})

app.get("/profile/update", (req,res) =>{
    const userToken = req.cookies.token
    try {
        const decoded = jwt.verify(userToken, process.env.TOKEN_SECRET)
        if (!userToken) {
            res.status(401)
            //If the token is invalid or expired it will redirec the user to the login page
            res.redirect("/login")
            res.send("NO TOKEN PRESENT")
            return
        }
        res.status(201)
        res.send(`
            <html>
                <body>  
                    <h1>Update Profile</h1>
                    <form action="/updateProfile" method="POST">
                        <label for="name">Name (optional):</label><br>
                        <input type="text" id="name" name="name"><br><br>

                        <label for="email">Email (optional):</label><br>
                        <input type="email" id="email" name="email"><br><br>

                        <label for="password">Password (optional):</label><br>
                        <input type="password" id="password" name="password"><br><br>

                        <input type="submit" value="Update">
                    </form>

                <body/>
            </html>
        `);


    } catch (error) {
        console.error('Invalid token:', error);
        res.status(401)
        res.send('Access Denied: Invalid token');
    }
})

//This updates the user's profile based on form data from the "/profile/update"
app.post("/updateProfile", async (req, res) => {
    const userToken = req.cookies.token
    try {
        const decoded = jwt.verify(userToken, process.env.TOKEN_SECRET)
        //If the name is provided, use it, otherwise, use the decoded name
        const name = req.body.name ? req.body.name : decoded.name; 
        const email = req.body.email ? req.body.email : decoded.email;
        //Encrypts the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const password = req.body.password ? hashedPassword : decoded.password;

        //Finds and updates the user based on the formData
        const updatedUser = await User.findOneAndUpdate(
            { email: decoded.email },  // Find the user by their original email
            { name: name, email: email, password: password },  // Update these fields
            { new: true, useFindAndModify: false }  // Return the updated document
        );
        const token = generateAccessToken(email)
        //Sends the token through a cookie that expires in 30 minutes
        res.cookie('token', token, {
            httpOnly: true,  
            secure: true,
            maxAge: 1800 * 1000
        });
        res.status(201)
        res.redirect('/profile')
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400)
        res.send("An error occured");
    }
});

//This shows the user a view of all of the accounts currently active
app.get("/adminView", async (req, res) => {
    const userToken = req.cookies.token
    try {
        const decoded = jwt.verify(userToken, process.env.TOKEN_SECRET)
        if (!userToken) {
            res.status(401)
            res.redirect("/login")
            res.send("NO TOKEN PRESENT")
            return
        }
        if(isAdmin(decoded.email)){
            const users = await User.find({});
            //This finds all of the nonAdminUsers
            const nonAdminUsers = users.filter(user => !isAdmin(user.email));
                //Creates a table with all of the user's information present except the password
                let tableRows = nonAdminUsers.map(user => `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                    </tr>
                `).join('');
                res.status(201)
                res.send(`
                    <html>
                        <style>
                            table, th, td {
                                border: 1px solid black;
                                border-collapse: collapse;
                                padding: 8px;
                            }
                            th, td {
                                text-align: left;
                            }
                        </style>
                        <body>
                            <h1>Admin View: User Information</h1>
                            <table>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                                ${tableRows}
                            </table>
                        </body>
                    </html>
                `);
        }
    } catch (error) {
        console.error('Invalid token:', error);
        res.status(401)
        res.send('Access Denied: Invalid token');
    }
})

function generateAccessToken(email) {
    //Signs a JWT_TOKEN using the email and the TOKEN_SECRET. The token expires in 30 minutes
    const token = jwt.sign({email: email}, process.env.TOKEN_SECRET, { expiresIn: '30m' });
    return token;
  }

//Checks if the email passed in is an admin
function isAdmin(email){
    return email.endsWith('@Umee.com')
}

//This creates the localHost
app.listen(3000, () => {
    console.log("The server is running at http://localhost:3000");
});
