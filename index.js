const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 5000
dotenv.config({ path: "./.env"});
const path = require("path");

//database connection
require("./db");

app.use(express.json());
app.use(cors({
    origin:"*"
}));


app.use('/api/user', require("./modules/routes/routeUser"));
app.use('/api/note', require("./modules/routes/routeNote"));
app.use('/api/deletednote',require("./modules/routes/routeDeletedNote"));

//serve static asset if in production
if(process.env.NODE_ENV === "production")
{
    //set static folder
    app.use(express.static("client/build"));

    app.get("*", (req,res) => {
        res.sendFile(path.resolve(__dirname,"build","index.html"));
    })
}

app.listen(port, () => {
    console.log("Server connected at "+port);
})