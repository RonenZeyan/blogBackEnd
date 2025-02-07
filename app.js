// app.js
const express = require("express");
const http = require("http");
const connectToDB = require("./config/connectToDB");
const xss = require("xss-clean"); //using for stop xss attack
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimiting = require("express-rate-limit");
const { errorHandler, notFound } = require("./middlewares/error");
require("dotenv").config();
const cors = require("cors");

// ייבוא הפונקציה להפעיל את ה-Socket.IO
const { initSocketIO } = require("./config/connectToSocket");

connectToDB();

const app = express();

//middlewares
app.use(express.json());

//helmet (add security Headers)
app.use(helmet());

//hpp (prevent http param pollution)
app.use(hpp());

//prevent XSS attacks
app.use(xss());

//rate limiting
app.use(rateLimiting({
    windowMs: 10*60*1000, //that mean 10 mins (convert to ms)
    max:200, //user can send up to 200 requests in 10 mins (if more he will get denied with status error 429)
}));

app.use(cors({
    origin: "http://localhost:3000"
}));

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));
app.use("/api/notifications", require("./routes/notificationsRoute"));
app.use("/api/messages", require("./routes/messagesRoute"));

app.use(notFound);
app.use(errorHandler);

//create http server
const server = http.createServer(app);

// run socket io
const io = initSocketIO(server);
app.set("socketio", io);

// הפעלת השרת
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
