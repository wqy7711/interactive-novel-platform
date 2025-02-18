require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const storyRoutes = require("./routes/storyRoutes");
const commentRoutes = require("./routes/commentRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

app.use("/api/users", userRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
