// // import Stripe from "stripe";
// // import { Course } from "../models/course.model.js";
// // import { CoursePurchase } from "../models/coursePurchase.model.js";
// // import { Lecture } from "../models/lecture.model.js";
// // import { User } from "../models/user.model.js";

// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // export const createCheckoutSession = async (req, res) => {
// //   try {
// //     const userId = req.id;
// //     const { courseId } = req.body;

// //     const course = await Course.findById(courseId);
// //     if (!course) return res.status(404).json({ message: "Course not found!" });

// //     // Create a new course purchase record
// //     const newPurchase = new CoursePurchase({
// //       courseId,
// //       userId,
// //       amount: course.coursePrice,
// //       status: "pending",
// //     });

// //     // Create a Stripe checkout session
// //     const session = await stripe.checkout.sessions.create({
// //       payment_method_types: ["card"],
// //       line_items: [
// //         {
// //           price_data: {
// //             currency: "inr",
// //             product_data: {
// //               name: course.courseTitle,
// //               images: [course.courseThumbnail],
// //             },
// //             unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination)
// //           },
// //           quantity: 1,
// //         },
// //       ],
// //       mode: "payment",
// //       success_url: `http://localhost:5173/course-progress/${courseId}`, // once payment successful redirect to course progress page
// //       cancel_url: `http://localhost:5173/course-detail/${courseId}`,
// //       metadata: {
// //         courseId: courseId,
// //         userId: userId,
// //         purchaseId: newPurchase._id.toString(),
// //       },
// //       shipping_address_collection: {
// //         allowed_countries: ["IN"], // Optionally restrict allowed countries
// //       },
// //     });

// //     if (!session.url) {
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "Error while creating session" });
// //     }

// //     // Save the purchase record
// //     newPurchase.paymentId = session.id;
// //     await newPurchase.save();

// //     return res.status(200).json({
// //       success: true,
// //       url: session.url, // Return the Stripe checkout URL
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // // export const stripeWebhook = async (req, res) => {
// // //   let event;

// // //   try {
// // //     const payloadString = JSON.stringify(req.body, null, 2);
// // //     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// // //     const header = stripe.webhooks.generateTestHeaderString({
// // //       payload: payloadString,
// // //       secret,
// // //     });

// // //     event = stripe.webhooks.constructEvent(payloadString, header, secret);
// // //   } catch (error) {
// // //     console.error("Webhook error:", error.message);
// // //     return res.status(400).send(`Webhook error: ${error.message}`);
// // //   }

// // //   // Handle the checkout session completed event
// // //   if (event.type === "checkout.session.completed") {
// // //     console.log("check session complete is called");

// // //     try {
// // //       const session = event.data.object;

// // //       const purchase = await CoursePurchase.findOne({
// // //         paymentId: session.id,
// // //       }).populate({ path: "courseId" });

// // //       if (!purchase) {
// // //         return res.status(404).json({ message: "Purchase not found" });
// // //       }

// // //       if (session.amount_total) {
// // //         purchase.amount = session.amount_total / 100;
// // //       }
// // //       purchase.status = "completed";

// // //       // Make all lectures visible by setting `isPreviewFree` to true
// // //       if (purchase.courseId && purchase.courseId.lectures.length > 0) {
// // //         await Lecture.updateMany(
// // //           { _id: { $in: purchase.courseId.lectures } },
// // //           { $set: { isPreviewFree: true } }
// // //         );
// // //       }

// // //       await purchase.save();

// // //       // Update user's enrolledCourses
// // //       await User.findByIdAndUpdate(
// // //         purchase.userId,
// // //         { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
// // //         { new: true }
// // //       );

// // //       // Update course to add user ID to enrolledStudents
// // //       await Course.findByIdAndUpdate(
// // //         purchase.courseId._id,
// // //         { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
// // //         { new: true }
// // //       );
// // //     } catch (error) {
// // //       console.error("Error handling event:", error);
// // //       return res.status(500).json({ message: "Internal Server Error" });
// // //     }
// // //   }
// // //   res.status(200).send();
// // // };

// // // export const stripeWebhook = async (req, res) => {
// // //   console.log("🔥 Stripe webhook route hit"); // Confirm route is triggered

// // //   let event;

// // //   try {
// // //     const sig = req.headers["stripe-signature"];
// // //     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// // //     console.log("📥 Stripe signature:", sig); // Log signature for debugging

// // //     // Construct and verify the Stripe event
// // //     event = stripe.webhooks.constructEvent(req.body, sig, secret);

// // //     console.log("📦 Event received from Stripe:", event); // Confirm event received
// // //   } catch (error) {
// // //     console.error("❌ Webhook signature verification failed:", error.message);
// // //     return res.status(400).send(`Webhook Error: ${error.message}`);
// // //   }

// // //   if (event.type === "checkout.session.completed") {
// // //     console.log("✅ Stripe event type is checkout.session.completed");

// // //     try {
// // //       const session = event.data.object;
// // //       console.log("🎯 Checkout Session object:", session);

// // //       const purchase = await CoursePurchase.findOne({
// // //         paymentId: session.id,
// // //       }).populate({ path: "courseId" });

// // //       console.log("📘 Matching CoursePurchase found:", purchase);

// // //       if (!purchase) {
// // //         console.warn("⚠️ No purchase found for session ID:", session.id);
// // //         return res.status(404).json({ message: "Purchase not found" });
// // //       }

// // //       if (session.amount_total) {
// // //         purchase.amount = session.amount_total / 100;
// // //       }
// // //       purchase.status = "completed";

// // //       if (purchase.courseId && purchase.courseId.lectures.length > 0) {
// // //         console.log("📚 Updating all course lectures as preview-free");

// // //         await Lecture.updateMany(
// // //           { _id: { $in: purchase.courseId.lectures } },
// // //           { $set: { isPreviewFree: true } }
// // //         );
// // //       }

// // //       await purchase.save();
// // //       console.log("💾 Purchase saved with status completed");

// // //       await User.findByIdAndUpdate(
// // //         purchase.userId,
// // //         { $addToSet: { enrolledCourses: purchase.courseId._id } },
// // //         { new: true }
// // //       );
// // //       console.log("🙋‍♂️ User enrolledCourses updated");

// // //       await Course.findByIdAndUpdate(
// // //         purchase.courseId._id,
// // //         { $addToSet: { enrolledStudents: purchase.userId } },
// // //         { new: true }
// // //       );
// // //       console.log("🎓 Course enrolledStudents updated");

// // //     } catch (error) {
// // //       console.error("🚨 Error handling Stripe event:", error);
// // //       return res.status(500).json({ message: "Internal Server Error" });
// // //     }
// // //   } else {
// // //     console.log("ℹ️ Event type not handled:", event.type);
// // //   }

// // //   res.status(200).send(); // Always return 200 to Stripe
// // // };

// // export const stripeWebhook = async (req, res) => {
// //   console.log("🔥 Stripe webhook route hit");

// //   let event;

// //   try {
// //     const sig = req.headers["stripe-signature"];
// //     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// //     console.log("📥 Stripe signature:", sig);

// //     event = stripe.webhooks.constructEvent(req.body, sig, secret);

// //     console.log("📦 Event received from Stripe:", event);
// //   } catch (error) {
// //     console.error("❌ Webhook signature verification failed:", error.message);
// //     return res.status(400).send(`Webhook Error: ${error.message}`);
// //   }

// //   if (event.type === "checkout.session.completed") {
// //     console.log("✅ Stripe event type is checkout.session.completed");

// //     try {
// //       const session = event.data.object;
// //       console.log("🎯 Checkout Session object:", session);

// //       const purchaseId = session.metadata?.purchaseId;

// //       if (!purchaseId) {
// //         console.warn("⚠️ No purchaseId in session metadata");
// //         return res.status(400).end();
// //       }

// //       const purchase = await CoursePurchase.findById(purchaseId).populate({ path: "courseId" });

// //       console.log("📘 Matching CoursePurchase found:", purchase);

// //       if (!purchase) {
// //         console.warn("⚠️ No purchase found for ID:", purchaseId);
// //         return res.status(404).json({ message: "Purchase not found" });
// //       }

// //       if (session.amount_total) {
// //         purchase.amount = session.amount_total / 100;
// //       }
// //       purchase.status = "completed";

// //       if (purchase.courseId && purchase.courseId.lectures.length > 0) {
// //         console.log("📚 Updating all course lectures as preview-free");

// //         await Lecture.updateMany(
// //           { _id: { $in: purchase.courseId.lectures } },
// //           { $set: { isPreviewFree: true } }
// //         );
// //       }

// //       await purchase.save();
// //       console.log("💾 Purchase saved with status completed");

// //       await User.findByIdAndUpdate(
// //         purchase.userId,
// //         { $addToSet: { enrolledCourses: purchase.courseId._id } },
// //         { new: true }
// //       );
// //       console.log("🙋‍♂️ User enrolledCourses updated");

// //       await Course.findByIdAndUpdate(
// //         purchase.courseId._id,
// //         { $addToSet: { enrolledStudents: purchase.userId } },
// //         { new: true }
// //       );
// //       console.log("🎓 Course enrolledStudents updated");

// //     } catch (error) {
// //       console.error("🚨 Error handling Stripe event:", error);
// //       return res.status(500).json({ message: "Internal Server Error" });
// //     }
// //   } else {
// //     console.log("ℹ️ Event type not handled:", event.type);
// //   }

// //   res.status(200).send(); // Always return 200 to Stripe
// // };

// // export const getCourseDetailWithPurchaseStatus = async (req, res) => {
// //   try {
// //     const { courseId } = req.params;
// //     const userId = req.id;

// //     const course = await Course.findById(courseId)
// //       .populate({ path: "creator" })
// //       .populate({ path: "lectures" });

// //     const purchased = await CoursePurchase.findOne({ userId, courseId });
// //     console.log(purchased);

// //     if (!course) {
// //       return res.status(404).json({ message: "course not found!" });
// //     }

// //     return res.status(200).json({
// //       course,
// //       purchased: !!purchased, // true if purchased, false otherwise
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // export const getAllPurchasedCourse = async (_, res) => {
// //   try {
// //     const purchasedCourse = await CoursePurchase.find({
// //       status: "completed",
// //     }).populate("courseId");
// //     if (!purchasedCourse) {
// //       return res.status(404).json({
// //         purchasedCourse: [],
// //       });
// //     }
// //     return res.status(200).json({
// //       purchasedCourse,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // ===========================  USED THESE================================================================================================

// import Stripe from "stripe";
// import { Course } from "../models/course.model.js";
// import { CoursePurchase } from "../models/coursePurchase.model.js";
// import { Lecture } from "../models/lecture.model.js";
// import { User } from "../models/user.model.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // // ✅ 1. Create Stripe Checkout Session
// // export const createCheckoutSession = async (req, res) => {
// //   try {
// //     const userId = req.id;
// //     const { courseId } = req.body;

// //     const course = await Course.findById(courseId);
// //     if (!course) return res.status(404).json({ message: "Course not found!" });

// //     const newPurchase = new CoursePurchase({
// //       courseId,
// //       userId,
// //       amount: course.coursePrice,
// //       status: "pending",
// //     });

// //     const session = await stripe.checkout.sessions.create({
// //       payment_method_types: ["card"],
// //       line_items: [
// //         {
// //           price_data: {
// //             currency: "inr",
// //             product_data: {
// //               name: course.courseTitle,
// //               images: [course.courseThumbnail],
// //             },
// //             unit_amount: course.coursePrice * 100,
// //           },
// //           quantity: 1,
// //         },
// //       ],
// //       mode: "payment",
// //       success_url: `http://localhost:5173/course-progress/${courseId}`,
// //       cancel_url: `http://localhost:5173/course-detail/${courseId}`,
// //       metadata: {
// //         courseId: courseId,
// //         userId: userId,
// //         purchaseId: newPurchase._id.toString(),
// //       },
// //       shipping_address_collection: {
// //         allowed_countries: ["IN"],
// //       },
// //     });

// //     if (!session.url) {
// //       return res.status(400).json({ success: false, message: "Error creating session" });
// //     }

// //     newPurchase.paymentId = session.id;
// //     await newPurchase.save();

// //     return res.status(200).json({
// //       success: true,
// //       url: session.url,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).json({ success: false, message: "Internal Server Error" });
// //   }
// // };

// // ✅ 1. Create Stripe Checkout Session
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const userId = req.id;
//     const { courseId } = req.body;

//     const course = await Course.findById(courseId);
//     // console.log("📦 Incoming body:", req.body); // Add this for debugging

//     // const courseId = req.body.courseId;
//     // const course = await Course.findById(courseId);

//     if (!course) return res.status(404).json({ message: "Course not found!" });

//     const newPurchase = new CoursePurchase({
//       courseId,
//       userId,
//       amount: course.coursePrice,
//       status: "pending",
//     });

//     // ✅ Console log to verify purchaseId
//     console.log("🧾 New Purchase ID:", newPurchase._id.toString());

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: course.courseTitle,
//               images: [course.courseThumbnail],
//             },
//             unit_amount: course.coursePrice * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `http://localhost:5173/course-progress/${courseId}`,
//       cancel_url: `http://localhost:5173/course-detail/${courseId}`,
//       metadata: {
//         courseId,
//         userId,
//         purchaseId: newPurchase._id.toString(), // ✅ this is what gets passed to webhook
//       },
//       shipping_address_collection: {
//         allowed_countries: ["IN"],
//       },
//     });

//     if (!session.url) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Error creating session" });
//     }

//     newPurchase.paymentId = session.id;
//     await newPurchase.save();

//     return res.status(200).json({
//       success: true,
//       url: session.url,
//     });
//   } catch (error) {
//     console.log("🚨 Error in createCheckoutSession:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// // export const createCheckoutSession = async (req, res) => {
// //   try {
// //     const userId = req.id;
// //     const { courseId } = req.body;

// //     const course = await Course.findById(courseId);
// //     if (!course) return res.status(404).json({ message: "Course not found!" });

// //     const session = await stripe.checkout.sessions.create({
// //       payment_method_types: ["card"],
// //       line_items: [
// //         {
// //           price_data: {
// //             currency: "inr",
// //             product_data: {
// //               name: course.courseTitle,
// //               images: [course.courseThumbnail],
// //             },
// //             unit_amount: course.coursePrice * 100,
// //           },
// //           quantity: 1,
// //         },
// //       ],
// //       mode: "payment",
// //       success_url: `http://localhost:5173/course-progress/${courseId}`,
// //       cancel_url: `http://localhost:5173/course-detail/${courseId}`,
// //       metadata: {
// //         courseId: courseId.toString(),
// //         userId: userId.toString(),
// //         // We'll add purchaseId below after saving
// //       },
// //       shipping_address_collection: {
// //         allowed_countries: ["IN"],
// //       },
// //     });

// //     if (!session.id) {
// //       return res.status(400).json({ success: false, message: "Error creating session" });
// //     }

// //     const newPurchase = new CoursePurchase({
// //       courseId,
// //       userId,
// //       amount: course.coursePrice,
// //       status: "pending",
// //       paymentId: session.id,
// //     });

// //     await newPurchase.save();

// //     // Optional: update session metadata with purchaseId (if you want to use it in webhook)
// //     await stripe.checkout.sessions.update(session.id, {
// //       metadata: {
// //         courseId: courseId.toString(),
// //         userId: userId.toString(),
// //         purchaseId: newPurchase._id.toString(),
// //       },
// //     });

// //     return res.status(200).json({
// //       success: true,
// //       url: session.url,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).json({ success: false, message: "Internal Server Error" });
// //   }
// // };

// // export const createCheckoutSession = async (req, res) => {
// //   try {
// //     const userId = req.id;
// //     const { courseId } = req.body;

// //     const course = await Course.findById(courseId);
// //     if (!course) return res.status(404).json({ message: "Course not found!" });

// //     // ✅ First: Create purchase record
// //     const newPurchase = new CoursePurchase({
// //       courseId,
// //       userId,
// //       amount: course.coursePrice,
// //       status: "pending",
// //     });
// //     await newPurchase.save();

// //     // ✅ Then: Create Stripe session WITH metadata (including purchaseId)
// //     const session = await stripe.checkout.sessions.create({
// //       payment_method_types: ["card"],
// //       line_items: [
// //         {
// //           price_data: {
// //             currency: "inr",
// //             product_data: {
// //               name: course.courseTitle,
// //               images: [course.courseThumbnail],
// //             },
// //             unit_amount: course.coursePrice * 100,
// //           },
// //           quantity: 1,
// //         },
// //       ],
// //       mode: "payment",
// //       success_url: `http://localhost:5173/course-progress/${courseId}`,
// //       cancel_url: `http://localhost:5173/course-detail/${courseId}`,
// //       metadata: {
// //         courseId: courseId.toString(),
// //         userId: userId.toString(),
// //         purchaseId: newPurchase._id.toString(), // ✅ already available now
// //       },
// //       shipping_address_collection: {
// //         allowed_countries: ["IN"],
// //       },
// //     });

// //     //  Store session.id in purchase (optional, but good to track)
// //     newPurchase.paymentId = session.id;
// //     await newPurchase.save();

// //     return res.status(200).json({
// //       success: true,
// //       url: session.url,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).json({ success: false, message: "Internal Server Error" });
// //   }
// // };

// // ✅ 2. Stripe Webhook to handle post-payment logic
// // export const stripeWebhook = async (req, res) => {
// //   console.log("🔥 Stripe webhook route hit");

// //   let event;

// //   try {
// //     const sig = req.headers["stripe-signature"];
// //     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// //     event = stripe.webhooks.constructEvent(req.body, sig, secret);
// //     console.log("📦 Event received from Stripe:", event);
// //   } catch (error) {
// //     console.error("❌ Webhook signature verification failed:", error.message);
// //     return res.status(400).send(`Webhook Error: ${error.message}`);
// //   }

// //   if (event.type === "checkout.session.completed") {
// //     console.log("✅ Stripe event type is checkout.session.completed");

// //     try {
// //       const session = event.data.object;
// //       const purchaseId = session.metadata?.purchaseId;

// //       if (!purchaseId) {
// //         console.warn("⚠️ No purchaseId in session metadata");
// //         return res.status(400).end();
// //       }

// //       const purchase = await CoursePurchase.findById(purchaseId).populate({ path: "courseId" });

// //       if (!purchase) {
// //         console.warn("⚠️ No purchase found for ID:", purchaseId);
// //         return res.status(404).json({ message: "Purchase not found" });
// //       }

// //       // Update purchase status and amount
// //       if (session.amount_total) {
// //         purchase.amount = session.amount_total / 100;
// //       }
// //       purchase.status = "completed";

// //       // Mark all lectures as preview-free (optional logic)
// //       if (purchase.courseId?.lectures?.length > 0) {
// //         await Lecture.updateMany(
// //           { _id: { $in: purchase.courseId.lectures } },
// //           { $set: { isPreviewFree: true } }
// //         );
// //       }

// //       await purchase.save();

// //       // Enroll user in course
// //       await User.findByIdAndUpdate(
// //         purchase.userId,
// //         { $addToSet: { enrolledCourses: purchase.courseId._id } },
// //         { new: true }
// //       );

// //       // Add user to enrolled students
// //       await Course.findByIdAndUpdate(
// //         purchase.courseId._id,
// //         { $addToSet: { enrolledStudents: purchase.userId } },
// //         { new: true }
// //       );

// //       console.log("✅ Purchase status updated and user enrolled");

// //     } catch (error) {
// //       console.error("🚨 Error handling Stripe event:", error);
// //       return res.status(500).json({ message: "Internal Server Error" });
// //     }
// //   } else {
// //     console.log("ℹ️ Event type not handled:", event.type);
// //   }

// //   res.status(200).send(); // Stripe requires a 200 response to acknowledge receipt
// // };

// // // ✅ 2. Stripe Webhook to handle post-payment logic
// // export const stripeWebhook = async (req, res) => {
// //   console.log("🔥 Stripe webhook route hit");

// //   let event;

// //   try {
// //     const sig = req.headers["stripe-signature"];
// //     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// //     event = stripe.webhooks.constructEvent(req.body, sig, secret);
// //     console.log("📦 Event received from Stripe:", event.type);
// //   } catch (error) {
// //     console.error("❌ Webhook signature verification failed:", error.message);
// //     return res.status(400).send(`Webhook Error: ${error.message}`);
// //   }

// //   if (event.type === "checkout.session.completed") {
// //     try {
// //       const session = event.data.object;

// //       // ✅ Log session metadata
// //       console.log("🎯 Webhook Session Metadata:", session.metadata);

// //       const purchaseId = session.metadata?.purchaseId;

// //       if (!purchaseId) {
// //         console.warn("⚠️ No purchaseId in session metadata");
// //         return res.status(400).end();
// //       }

// //       const purchase = await CoursePurchase.findById(purchaseId).populate({ path: "courseId" });

// //       if (!purchase) {
// //         console.warn("⚠️ No purchase found for ID:", purchaseId);
// //         return res.status(404).json({ message: "Purchase not found" });
// //       }

// //       if (session.amount_total) {
// //         purchase.amount = session.amount_total / 100;
// //       }

// //       purchase.status = "completed";

// //       if (purchase.courseId?.lectures?.length > 0) {
// //         await Lecture.updateMany(
// //           { _id: { $in: purchase.courseId.lectures } },
// //           { $set: { isPreviewFree: true } }
// //         );
// //       }

// //       await purchase.save();

// //       // ✅ Enroll user
// //       await User.findByIdAndUpdate(
// //         purchase.userId,
// //         { $addToSet: { enrolledCourses: purchase.courseId._id } },
// //         { new: true }
// //       );

// //       // ✅ Add user to enrolled students
// //       await Course.findByIdAndUpdate(
// //         purchase.courseId._id,
// //         { $addToSet: { enrolledStudents: purchase.userId } },
// //         { new: true }
// //       );

// //       console.log("✅ Purchase completed and user enrolled successfully.");
// //     } catch (error) {
// //       console.error("🚨 Error handling Stripe event:", error);
// //       return res.status(500).json({ message: "Internal Server Error" });
// //     }
// //   } else {
// //     console.log("ℹ️ Event type not handled:", event.type);
// //   }

// //   res.status(200).send(); // Stripe expects a 200 response
// // };

// // export const stripeWebhook = async (req, res) => {
// //   console.log("🔥 Stripe webhook route hit");

// //   let event;

// //   try {
// //     const sig = req.headers["stripe-signature"];
// //     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// //     event = stripe.webhooks.constructEvent(req.body, sig, secret);
// //     console.log("📦 Event received from Stripe:", event.type);
// //   } catch (error) {
// //     console.error("❌ Webhook signature verification failed:", error.message);
// //     return res.status(400).send(`Webhook Error: ${error.message}`);
// //   }

// //   if (event.type === "checkout.session.completed") {
// //     try {
// //       const session = event.data.object;

// //       // ✅ Log full session object for debugging
// //       console.log("🎯 Webhook Session Object:", session);

// //       const { metadata } = session;

// //       if (!metadata || !metadata.purchaseId) {
// //         console.warn("⚠️ No metadata or purchaseId found in session");
// //         return res.status(400).end();
// //       }

// //       const purchaseId = metadata.purchaseId;

// //       const purchase = await CoursePurchase.findById(purchaseId).populate("courseId");

// //       if (!purchase) {
// //         console.warn("⚠️ No purchase found for ID:", purchaseId);
// //         return res.status(404).json({ message: "Purchase not found" });
// //       }

// //       purchase.status = "completed";

// //       if (session.amount_total) {
// //         purchase.amount = session.amount_total / 100;
// //       }

// //       await purchase.save();

// //       // ✅ Update user's enrolled courses
// //       await User.findByIdAndUpdate(
// //         purchase.userId,
// //         { $addToSet: { enrolledCourses: purchase.courseId._id } },
// //         { new: true }
// //       );

// //       // ✅ Update course's enrolled students
// //       await Course.findByIdAndUpdate(
// //         purchase.courseId._id,
// //         { $addToSet: { enrolledStudents: purchase.userId } },
// //         { new: true }
// //       );

// //       // ✅ Optional: Unlock all lectures if needed
// //       if (purchase.courseId?.lectures?.length > 0) {
// //         await Lecture.updateMany(
// //           { _id: { $in: purchase.courseId.lectures } },
// //           { $set: { isPreviewFree: true } }
// //         );
// //       }

// //       console.log("✅ Purchase completed and user enrolled successfully.");
// //     } catch (error) {
// //       console.error("🚨 Error handling Stripe event:", error);
// //       return res.status(500).json({ message: "Internal Server Error" });
// //     }
// //   } else {
// //     console.log("ℹ️ Event type not handled:", event.type);
// //   }

// //   res.status(200).send();
// // };

// export const stripeWebhook = async (req, res) => {
//   console.log("🔥 Stripe webhook route hit");

//   let event;

//   try {
//     const sig = req.headers["stripe-signature"];
//     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

//     event = stripe.webhooks.constructEvent(req.body, sig, secret);
//     console.log("📦 Event received from Stripe:", event.type);
//   } catch (error) {
//     console.error("❌ Webhook signature verification failed:", error.message);
//     return res.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     try {
//       const session = event.data.object;

//       // ✅ Ensure the payment is actually paid
//       if (session.payment_status !== "paid") {
//         console.warn("⚠️ Payment was not successful, skipping...");
//         return res.status(200).send();
//       }

//       // ✅ Log session for debugging
//       console.log("🎯 Webhook Session Object:", session);

//       const { metadata } = session;

//       if (!metadata || !metadata.purchaseId) {
//         console.warn("⚠️ No metadata or purchaseId found in session");
//         return res.status(400).end();
//       }

//       const purchaseId = metadata.purchaseId;

//       const purchase = await CoursePurchase.findById(purchaseId).populate(
//         "courseId"
//       );

//       if (!purchase) {
//         console.warn("⚠️ No purchase found for ID:", purchaseId);
//         return res.status(404).json({ message: "Purchase not found" });
//       }

//       purchase.status = "completed";

//       if (session.amount_total) {
//         purchase.amount = session.amount_total / 100;
//       }

//       await purchase.save();

//       // ✅ Update user's enrolled courses
//       await User.findByIdAndUpdate(
//         purchase.userId,
//         { $addToSet: { enrolledCourses: purchase.courseId._id } },
//         { new: true }
//       );

//       // ✅ Update course's enrolled students
//       await Course.findByIdAndUpdate(
//         purchase.courseId._id,
//         { $addToSet: { enrolledStudents: purchase.userId } },
//         { new: true }
//       );

//       // ✅ Optional: Unlock all lectures if needed
//       if (purchase.courseId?.lectures?.length > 0) {
//         await Lecture.updateMany(
//           { _id: { $in: purchase.courseId.lectures } },
//           { $set: { isPreviewFree: true } }
//         );
//       }

//       console.log("✅ Purchase completed and user enrolled successfully.");
//     } catch (error) {
//       console.error("🚨 Error handling Stripe event:", error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else {
//     console.log("ℹ️ Event type not handled:", event.type);
//   }

//   res.status(200).send();
// };

// // ✅ 3. Get Course Detail with Purchase Status
// export const getCourseDetailWithPurchaseStatus = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.id;

//     const course = await Course.findById(courseId)
//       .populate({ path: "creator" })
//       .populate({ path: "lectures" });

//     if (!course) {
//       return res.status(404).json({ message: "Course not found!" });
//     }

//     const purchased = await CoursePurchase.findOne({ userId, courseId });

//     return res.status(200).json({
//       course,
//       purchased: !!purchased,
//     });
//     // const purchased = await CoursePurchase.findOne({
//     //   userId,
//     //   courseId,
//     //   status: "completed",
//     // });

//     // return res.status(200).json({
//     //   course,
//     //   purchased: purchased ? { status: purchased.status } : null, // return status info if needed
//     // });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to get course detail" });
//   }
// };

// // ✅ 4. Get All Purchased Courses
// export const getAllPurchasedCourse = async (_, res) => {
//   try {
//     const purchasedCourse = await CoursePurchase.find({
//       status: "completed",
//     }).populate("courseId");

//     return res.status(200).json({
//       purchasedCourse: purchasedCourse || [],
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to fetch purchased courses" });
//   }
// };

// // import Stripe from "stripe";
// // import { Course } from "../models/course.model.js";
// // import { CoursePurchase } from "../models/coursePurchase.model.js";
// // import { Lecture } from "../models/lecture.model.js";
// // import { User } from "../models/user.model.js";

// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // export const createCheckoutSession = async (req, res) => {
// //   try {
// //     const userId = req.id;
// //     const { courseId } = req.body;

// //     const course = await Course.findById(courseId);
// //     if (!course) return res.status(404).json({ message: "Course not found!" });

// //     // Create a new course purchase record
// //     const newPurchase = new CoursePurchase({
// //       courseId,
// //       userId,
// //       amount: course.coursePrice,
// //       status: "pending",
// //     });

// //     // Create a Stripe checkout session with metadata (including purchaseId)
// //     const session = await stripe.checkout.sessions.create({
// //       payment_method_types: ["card"],
// //       line_items: [
// //         {
// //           price_data: {
// //             currency: "inr",
// //             product_data: {
// //               name: course.courseTitle,
// //               images: [course.courseThumbnail],
// //             },
// //             unit_amount: course.coursePrice * 100, // Amount in paise
// //           },
// //           quantity: 1,
// //         },
// //       ],
// //       mode: "payment",
// //       success_url: `http://localhost:5173/course-progress/${courseId}`,
// //       cancel_url: `http://localhost:5173/course-detail/${courseId}`,
// //       metadata: {
// //         courseId: courseId,
// //         userId: userId,
// //         purchaseId: newPurchase._id.toString(),
// //       },
// //       shipping_address_collection: {
// //         allowed_countries: ["IN"],
// //       },
// //     });

// //     if (!session.url) {
// //       return res.status(400).json({ success: false, message: "Error while creating session" });
// //     }

// //     // Save the purchase record with paymentId from session
// //     newPurchase.paymentId = session.id;
// //     await newPurchase.save();

// //     return res.status(200).json({
// //       success: true,
// //       url: session.url,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // export const stripeWebhook = async (req, res) => {
// //   console.log("🔥 Stripe webhook route hit");

// //   let event;

// //   try {
// //     const sig = req.headers["stripe-signature"];
// //     const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// //     console.log("📥 Stripe signature:", sig);

// //     event = stripe.webhooks.constructEvent(req.body, sig, secret);

// //     console.log("📦 Event received from Stripe:", event);
// //   } catch (error) {
// //     console.error("❌ Webhook signature verification failed:", error.message);
// //     return res.status(400).send(`Webhook Error: ${error.message}`);
// //   }

// //   if (event.type === "checkout.session.completed") {
// //     console.log("✅ Stripe event type is checkout.session.completed");
// //     try {
// //       const session = event.data.object;
// //       console.log("🎯 Checkout Session object:", session);

// //       const purchaseId = session.metadata?.purchaseId;
// //       if (!purchaseId) {
// //         console.warn("⚠️ No purchaseId in session metadata");
// //         return res.status(400).end();
// //       }

// //       const purchase = await CoursePurchase.findById(purchaseId).populate({ path: "courseId" });
// //       console.log("📘 Matching CoursePurchase found:", purchase);

// //       if (!purchase) {
// //         console.warn("⚠️ No purchase found for ID:", purchaseId);
// //         return res.status(404).json({ message: "Purchase not found" });
// //       }

// //       if (session.amount_total) {
// //         purchase.amount = session.amount_total / 100;
// //       }
// //       purchase.status = "completed";

// //       if (purchase.courseId && purchase.courseId.lectures.length > 0) {
// //         console.log("📚 Updating all course lectures as preview-free");

// //         await Lecture.updateMany(
// //           { _id: { $in: purchase.courseId.lectures } },
// //           { $set: { isPreviewFree: true } }
// //         );
// //       }

// //       await purchase.save();
// //       console.log("💾 Purchase saved with status completed");

// //       await User.findByIdAndUpdate(
// //         purchase.userId,
// //         { $addToSet: { enrolledCourses: purchase.courseId._id } },
// //         { new: true }
// //       );
// //       console.log("🙋‍♂️ User enrolledCourses updated");

// //       await Course.findByIdAndUpdate(
// //         purchase.courseId._id,
// //         { $addToSet: { enrolledStudents: purchase.userId } },
// //         { new: true }
// //       );
// //       console.log("🎓 Course enrolledStudents updated");

// //     } catch (error) {
// //       console.error("🚨 Error handling Stripe event:", error);
// //       return res.status(500).json({ message: "Internal Server Error" });
// //     }
// //   } else {
// //     console.log("ℹ️ Event type not handled:", event.type);
// //   }

// //   res.status(200).send(); // Always return 200 to Stripe
// // };

// // export const getCourseDetailWithPurchaseStatus = async (req, res) => {
// //   try {
// //     const { courseId } = req.params;
// //     const userId = req.id;

// //     const course = await Course.findById(courseId)
// //       .populate({ path: "creator" })
// //       .populate({ path: "lectures" });

// //     const purchased = await CoursePurchase.findOne({ userId, courseId });
// //     console.log(purchased);

// //     if (!course) {
// //       return res.status(404).json({ message: "course not found!" });
// //     }

// //     return res.status(200).json({
// //       course,
// //       purchased: !!purchased,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // export const getAllPurchasedCourse = async (_, res) => {
// //   try {
// //     const purchasedCourse = await CoursePurchase.find({
// //       status: "completed",
// //     }).populate("courseId");
// //     if (!purchasedCourse) {
// //       return res.status(404).json({
// //         purchasedCourse: [],
// //       });
// //     }
// //     return res.status(200).json({
// //       purchasedCourse,
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };


















import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/course-progress/${courseId}`, // once payment successful redirect to course progress page
      cancel_url: `http://localhost:5173/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["IN"], // Optionally restrict allowed countries
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    // Save the purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: session.url, // Return the Stripe checkout URL
    });
  } catch (error) {
    console.log(error);
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
  }
};
