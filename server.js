const express = require('express')
const app = express()

//Create the middleware that will be used to process the form data
app.use(express.urlencoded({ extended: true }));

//This get call will create the frontend page through passing in html code
app.get("/", (req, res) => {

    //The HTML code that is passed in will create a form that will send all of the data to the /register POST call
    res.send(`
        <html>
            <body>
                <h1>Registration Portal</h1>
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
    `)
})


//This post call will recieve all of the data from the form in the html from the localHost:3000 
app.post("/register", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    console.log("Name: " + name + ", Email: " + email + ", Password: " + password)

    res.send(`<h1>YOU ARE REGISTERED!<h1/>`)
});

//This creates the localHost
app.listen(3000, () => {
    console.log("The server is working and is available in localHost:3000")
})
