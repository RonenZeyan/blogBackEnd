// app.js
const express = require("express");
const http = require("http");
const connectToDB = require("./config/connectToDB");
const { errorHandler, notFound } = require("./middlewares/error");
require("dotenv").config();
const cors = require("cors");

// ייבוא הפונקציה להפעיל את ה-Socket.IO
const { initSocketIO } = require("./config/connectToSocket");

connectToDB();

const app = express();

app.use(express.json());

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

// יצירת שרת HTTP
const server = http.createServer(app);

// הפעלת ה-Socket.IO
const io = initSocketIO(server);
app.set("socketio", io);

// הפעלת השרת
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
