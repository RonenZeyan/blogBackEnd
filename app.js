
const express = require("express")
const connectToDB = require("./config/connectToDB");
const { errorHandler, notFound } = require("./middlewares/error");
require("dotenv").config();  //this command let the express read the .env file 
const cors = require("cors");

//connection to DB 
connectToDB();


//init app
const app = express();


//Middlewares 
app.use(express.json());


//cors policy
app.use(cors({
    origin:"http://localhost:3000"
}))

//Routes

app.use("/api/auth",require("./routes/authRoute"));
app.use("/api/users",require("./routes/usersRoute"));
app.use("/api/posts",require("./routes/postsRoute"));
app.use("/api/comments",require("./routes/commentsRoute"));
app.use("/api/categories",require("./routes/categoriesRoute"));

//Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

//Running
const PORT = process.env.PORT || 8000;
app.listen(PORT,console.log(`Server is Running in ${process.env.NODE_ENV} mode in port ${PORT}`));
