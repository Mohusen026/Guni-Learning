import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
// import { stripeWebhook } from "./controllers/coursePurchase.controller.js";

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

// app.post("/api/v1/purchase/webhook", express.raw({ type: "application/json" }), stripeWebhook);
// app.post(
//     "/api/v1/purchase/webhook",
//     express.raw({ type: "application/json" }),
//     stripeWebhook
//   );




// Stripe requires raw body for signature validation
// app.post("/api/v1/purchase/webhook", bodyParser.raw({ type: "application/json" }), stripeWebhook);  

// default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
 
// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
 
 
app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})