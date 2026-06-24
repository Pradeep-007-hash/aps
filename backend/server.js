import dotenv from "dotenv";
dotenv.config();

console.log("🔍 Backend loaded GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("🔍 Backend loaded JWT_SECRET:", process.env.JWT_SECRET ? "Present (Verified)" : "Missing (Error)");

import express, { json } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import multer from "multer";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";

const { hash, compare } = bcrypt;
const { memoryStorage } = multer;
const { randomBytes } = crypto; 

const app = express();

// ----------------- CORS Setup -----------------
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS for all routes (this automatically handles preflight requests as well)
app.use(cors(corsOptions));

app.use(json());
app.use(bodyParser.json()); // Ensure bodyParser is used

// ----------------- Multer setup for image uploads -----------------
const storage = memoryStorage();
const upload = multer({ storage: storage });

// ----------------- MongoDB CONNECTION -----------------
const fallbackUri = "mongodb+srv://2312034:Pradeep@pradeepdatabase.iszxesl.mongodb.net/?retryWrites=true&w=majority&appName=PradeepDatabase";
const uri = process.env.MONGO_URI || fallbackUri;
const client = new MongoClient(uri);

let db;

async function sendNotification(userId, message, type) {
  try {
    if (!db) return;
    const notification = {
      userId: new ObjectId(userId),
      message,
      type,
      isRead: false,
      createdAt: new Date()
    };
    await db.collection("notifications").insertOne(notification);
    console.log(`✅ Notification saved for user ${userId}: ${message}`);
  } catch (err) {
    console.error("❌ Error saving notification:", err);
  }
}

async function connectDB() {
  try {
    await client.connect();
    db = client.db("community_db");
    console.log("✅ MongoDB Connected!");

    // Helper to send notifications inside server.js mapped to the connected db
    global.sendNotification = async function(userId, message, type) {
      try {
        if (!db) return;
        const notification = {
          userId: new ObjectId(userId),
          message,
          type,
          isRead: false,
          createdAt: new Date()
        };
        await db.collection("notifications").insertOne(notification);
        console.log(`✅ Notification saved for user ${userId}: ${message}`);
      } catch (err) {
        console.error("❌ Error saving notification:", err);
      }
    };
    // Expose alias if needed in file scope
    // We will just declare a file-scoped function below that calls the global or uses db.

    // Insert security user if not exists
    const existing = await db.collection("users").findOne({ username: "security" });
    if (!existing) {
      const hashedPassword = await hash("security123", 10);
      const securityUser = {
        firstname: "Security",
        lastname: "Guard",
        username: "security",
        email: "security@community.com",
        phone: "1234567890",
        password: hashedPassword,
        role: "security",
        status: "APPROVED",
        createdAt: new Date(),
      };
      await db.collection("users").insertOne(securityUser);
      console.log("✅ Security user inserted successfully.");
      console.log("Username: security");
      console.log("Password: security123");
    } else {
      console.log("Security user already exists.");
    }

    // Seed complaints if collection is empty
    const complaintsCount = await db.collection("complaints").countDocuments();
    if (complaintsCount === 0) {
      await db.collection("complaints").insertMany([
        { id: '#CMP-001', title: 'Leaky Faucet in Kitchen', status: 'Pending', date: 'Oct 10, 2023', type: 'Plumbing', createdAt: new Date('2023-10-10') },
        { id: '#CMP-002', title: 'Hallway Light Broken', status: 'Resolved', date: 'Oct 05, 2023', type: 'Electrical', createdAt: new Date('2023-10-05') },
        { id: '#CMP-003', title: 'Gym Equipment Maintenance', status: 'In Progress', date: 'Oct 12, 2023', type: 'Facility', createdAt: new Date('2023-10-12') },
      ]);
      console.log("✅ Complaints seeded successfully.");
    }
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}
connectDB();

// ----------------- Nodemailer Setup (CRITICAL: UPDATE THIS!) -----------------
// You MUST replace these with your actual email service credentials 
// (e.g., Gmail App Password). The server WILL fail if these are generic.
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'athulpalanichamy076@gmail.com', // <-- REPLACE THIS
        pass: 'jrlr kwjc ddbb zgff' // <-- REPLACE THIS
    }
});
// ------------------------------------------------------------------------------------------------

// Utility function to generate a 6-digit OTP
function generateOTP() {
    return (randomBytes(4).readUInt32LE(0) % 1000000).toString().padStart(6, '0');
}

// Generate signed JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      user: { 
        id: user._id.toString(), 
        role: user.role 
      } 
    },
    process.env.JWT_SECRET || "your_jwt_secret_key_here",
    { expiresIn: "7d" }
  );
}

// Generate unique username based on email
async function generateUniqueUsername(email, dbConn) {
  const prefix = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  let username = prefix;
  let exists = await dbConn.collection("users").findOne({ username });
  let count = 1;
  while (exists) {
    username = `${prefix}${count}`;
    exists = await dbConn.collection("users").findOne({ username });
    count++;
  }
  return username;
}

// Google ID token verification
async function verifyGoogleToken(idToken) {
  if (idToken.startsWith("mock_google_token")) {
    console.log("ℹ️ Using Google Mock Token for verification");
    let email = "mock.google.user@example.com";
    if (idToken.startsWith("mock_google_token_")) {
      email = idToken.substring("mock_google_token_".length);
    }
    const namePart = email.split("@")[0];
    const firstname = namePart.split(".")[0] || "MockGoogle";
    const lastname = namePart.split(".")[1] || "User";
    return {
      email,
      email_verified: true,
      sub: "mock_google_" + namePart,
      firstname: firstname.charAt(0).toUpperCase() + firstname.slice(1),
      lastname: lastname.charAt(0).toUpperCase() + lastname.slice(1),
      picture: "https://lh3.googleusercontent.com/a/mock"
    };
  }

  try {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientID);
    const ticket = await client.verifyIdToken({
        idToken,
        audience: clientID,
    });
    const payload = ticket.getPayload();
    if (payload) {
      return {
        email: payload.email,
        email_verified: payload.email_verified,
        sub: payload.sub,
        firstname: payload.given_name || payload.name || "Google",
        lastname: payload.family_name || "",
        picture: payload.picture
      };
    }
  } catch (err) {
    console.error("❌ Google Token Verification Error:", err.message);
  }
  return null;
}

// Apple ID token verification
async function verifyAppleToken(idToken) {
  if (idToken.startsWith("mock_apple_token")) {
    console.log("ℹ️ Using Apple Mock Token for verification");
    let email = "mock.apple.user@example.com";
    if (idToken.startsWith("mock_apple_token_")) {
      email = idToken.substring("mock_apple_token_".length);
    }
    const namePart = email.split("@")[0];
    const firstname = namePart.split(".")[0] || "MockApple";
    const lastname = namePart.split(".")[1] || "User";
    return {
      email,
      sub: "mock_apple_" + namePart,
      firstname: firstname.charAt(0).toUpperCase() + firstname.slice(1),
      lastname: lastname.charAt(0).toUpperCase() + lastname.slice(1),
    };
  }

  try {
    const payload = await appleSignin.verifyIdToken(idToken, {
      audience: process.env.APPLE_CLIENT_ID,
    });
    if (payload) {
      return {
        email: payload.email,
        sub: payload.sub,
        firstname: "Apple",
        lastname: "User",
      };
    }
  } catch (err) {
    console.error("❌ Apple Token Verification Error:", err.message);
  }
  return null;
}


// ----------------- OTP LOGIN & FORGET PASSWORD APIs -----------------

// POST - Generates OTP and sends it to the user's email (Used by frontend Login.jsx for 'Email OTP' flow)
app.post("/api/generate-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required to generate OTP." });
    }

    try {
        // 1. Find the user by email
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "Email not registered." });
        }

        // 2. Generate a new OTP and set expiry time (e.g., 5 minutes)
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // 3. Store the OTP in a temporary collection (linking it to the user)
        // Ensure old tokens are cleaned up to avoid confusion, though findOne/sort helps.
        await db.collection("otp_tokens").deleteMany({ email }); // Clean old tokens
        await db.collection("otp_tokens").insertOne({
            email,
            otp,
            expiresAt,
            userId: user._id.toString(),
            createdAt: new Date(),
        });
        
        // 4. Send the OTP via email
        const mailOptions = {
    from: 'Your Community App <YOUR_EMAIL@gmail.com>',
    to: email,
    subject: 'Community App OTP Verification',
    // ⬇️ ADD A PLAIN TEXT VERSION HERE ⬇️
    text: `Your Community App OTP is: ${otp}. This code is valid for 5 minutes.`,
    
    // Your HTML content remains the same
    html: `
        <p>🎊 Hello there!</p>
        <p>🎉 Welcome back to the Community Management System. We received a request to log in to your account.</p>
        <p style="font-size: 20px; color: #1976d2; background: #f4f6f9; padding: 15px; border-radius: 8px; text-align: center;">
            Your One-Time Password (OTP) is: <strong>${otp}</strong>
        </p>
        <p>This code is valid for <strong>5 minutes</strong>. Please enter it on the login screen to continue.</p>
        <p style="margin-top: 30px; color: #888;">
            If you didn't request this code, please ignore this email.
        </p>
        <p>
            Thank you,<br>
            The Community Management System Team 🤝
        </p>
    `
};

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "✅ OTP sent successfully! Check your inbox." });

    } catch (err) {
        console.error("❌ Error generating or sending OTP:", err);
        if (err.code === 'EENVELOPE' || err.code === 'EAUTH') {
             res.status(500).json({ error: "Server error: Failed to send email. Check Nodemailer credentials/config." });
        } else {
             res.status(500).json({ error: "Server error during OTP generation." });
        }
    }
});

// POST - Verifies OTP and performs LOGIN (Matches frontend Login.jsx /api/verify-otp call)
app.post("/api/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required for login verification." });
    }

    try {
        // 1. Find the most recent, unexpired OTP for this email
        const tokenEntry = await db.collection("otp_tokens").findOne(
            { 
                email, 
                otp, 
                expiresAt: { $gt: new Date() } // Must be greater than current time
            },
            { sort: { createdAt: -1 } } // Get the newest one
        );

        if (!tokenEntry) {
            return res.status(400).json({ success: false, message: "❌ Invalid or expired OTP." });
        }

        // 2. Find the user associated with the token
        const user = await db.collection("users").findOne({ _id: new ObjectId(tokenEntry.userId) });

        if (!user) {
            return res.status(404).json({ success: false, message: "User associated with OTP not found." });
        }

        // 3. Check for admin approval status (same as password login)
        if (user.role !== "admin" && user.status !== "APPROVED") {
            return res.status(403).json({ success: false, message: "⏳ Account pending admin approval." });
        }

        // 4. Invalidate the specific OTP token used after successful verification
        await db.collection("otp_tokens").deleteOne({ _id: tokenEntry._id });

        // 5. Generate token
        const token = generateToken(user);

        // 6. Successful Login
        res.status(200).json({
            success: true,
            message: "✅ OTP verified. Login successful!",
            token,
            user: {
                id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                role: user.role,
                status: user.status,
                image: user.image || null,
            },
        });

    } catch (err) {
        console.error("❌ Error verifying OTP for login:", err);
        res.status(500).json({ success: false, message: "Server error during OTP verification." });
    }
});


// POST - Verifies OTP and resets the password (For Forget Password flow)
app.post("/api/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP, and new password are required." });
    }

    try {
        // 1. Find the most recent, unexpired OTP for this email
        const tokenEntry = await db.collection("otp_tokens").findOne(
            { 
                email, 
                otp, 
                expiresAt: { $gt: new Date() } // Must be greater than current time
            },
            { sort: { createdAt: -1 } } // Get the newest one
        );

        if (!tokenEntry) {
            const expiredToken = await db.collection("otp_tokens").findOne({ email, otp });
            if (expiredToken) {
                 return res.status(400).json({ error: "❌ Invalid or expired OTP. Please request a new one." });
            }
             return res.status(400).json({ error: "❌ Invalid OTP. Please check the code." });
        }

        // 2. Hash the new password
        const hashedPassword = await hash(newPassword, 10);

        // 3. Update the user's password
        const result = await db.collection("users").updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found for password reset." });
        }

        // 4. Invalidate all OTPs for this email after a successful reset
        await db.collection("otp_tokens").deleteMany({ email });


        res.status(200).json({ message: "✅ Password reset successfully! You can now log in." });

    } catch (err) {
        console.error("❌ Error resetting password:", err);
        res.status(500).json({ error: "Server error during password reset." });
    }
});

// ----------------- FORGOT PASSWORD MODULE APIs -----------------

// POST - Request password reset OTP
app.post("/auth/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: "Email is required." });
    }

    try {
        if (!db) {
            return res.status(503).json({ success: false, error: "Database not connected yet." });
        }

        // 1. Verify that the email exists in the users collection
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            // Security requirement: Return generic success to prevent email enumeration
            return res.status(200).json({ success: true, message: "If the email is registered, an OTP has been sent." });
        }

        // 2. Generate a random 6-digit OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

        // 3. Store the OTP in the otp_tokens collection
        await db.collection("otp_tokens").deleteMany({ email }); // Clean old tokens
        await db.collection("otp_tokens").insertOne({
            email,
            otp,
            expiresAt,
            userId: user._id.toString(),
            createdAt: new Date(),
        });

        // 4. Send the OTP via email using Nodemailer
        const mailOptions = {
            from: 'Your Community App <YOUR_EMAIL@gmail.com>',
            to: email,
            subject: 'APS Password Reset OTP',
            text: `Your Apartment Portal System password reset OTP is: ${otp}. This code is valid for 5 minutes.`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #0284c7; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
                    <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hello there!</p>
                    <p style="color: #334155; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your Apartment Portal System account.</p>
                    <div style="font-size: 28px; font-weight: bold; color: #0284c7; background: #f0f9ff; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0; letter-spacing: 4px; border: 1px dashed #bae6fd;">
                        ${otp}
                    </div>
                    <p style="color: #334155; font-size: 16px; line-height: 1.5;">This code is valid for <strong>5 minutes</strong>. If you did not request this password reset, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">APS Community Management System Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "OTP sent successfully" });

    } catch (err) {
        console.error("❌ Error requesting forgot-password:", err);
        res.status(500).json({ success: false, error: "Server error during password reset request." });
    }
});

// POST - Verify OTP and generate secure reset token
app.post("/auth/verify-reset-otp", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, error: "Email and OTP are required." });
    }

    try {
        if (!db) {
            return res.status(503).json({ success: false, error: "Database not connected yet." });
        }

        // 1. Find OTP record matching email and otp that hasn't expired
        const tokenEntry = await db.collection("otp_tokens").findOne(
            { 
                email, 
                otp, 
                expiresAt: { $gt: new Date() } 
            },
            { sort: { createdAt: -1 } }
        );

        if (!tokenEntry) {
            return res.status(400).json({ success: false, error: "Invalid or expired OTP." });
        }

        // 2. Delete the used OTP record
        await db.collection("otp_tokens").deleteOne({ _id: tokenEntry._id });

        // 3. Generate a secure temporary reset token using crypto
        const resetToken = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

        // 4. Store reset token in reset_tokens collection
        await db.collection("reset_tokens").deleteMany({ email }); // Clean old reset tokens
        await db.collection("reset_tokens").insertOne({
            email,
            resetToken,
            expiresAt,
            createdAt: new Date()
        });

        // 5. Return token
        res.status(200).json({ success: true, resetToken });

    } catch (err) {
        console.error("❌ Error verifying reset OTP:", err);
        res.status(500).json({ success: false, error: "Server error during OTP verification." });
    }
});

// POST - Reset password using verified token
app.post("/auth/reset-password", async (req, res) => {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
        return res.status(400).json({ success: false, error: "Email, reset token, and new password are required." });
    }

    // Password validation rules:
    // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
            success: false, 
            error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
        });
    }

    try {
        if (!db) {
            return res.status(503).json({ success: false, error: "Database not connected yet." });
        }

        // 1. Find and validate reset token record
        const tokenEntry = await db.collection("reset_tokens").findOne({
            email,
            resetToken,
            expiresAt: { $gt: new Date() }
        });

        if (!tokenEntry) {
            return res.status(400).json({ success: false, error: "Invalid or expired reset token." });
        }

        // 2. Hash password using bcryptjs
        const hashedPassword = await hash(newPassword, 10);

        // 3. Update user password in MongoDB
        const result = await db.collection("users").updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        // 4. Delete the used reset token record (and any stray OTP entries for security)
        await db.collection("reset_tokens").deleteMany({ email });
        await db.collection("otp_tokens").deleteMany({ email });

        res.status(200).json({ success: true, message: "Password reset successful" });

    } catch (err) {
        console.error("❌ Error resetting password via token:", err);
        res.status(500).json({ success: false, error: "Server error during password reset." });
    }
});

// POST - Contact Form Inquiry
app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required." });
    }

    try {
        const mailOptions = {
            from: `UrbanNest Portal Inquiry <athulpalanichamy076@gmail.com>`,
            to: 'mailforsample3@gmail.com',
            replyTo: email,
            subject: `UrbanNest Portal Inquiry: ${subject.toUpperCase()} - from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">New Contact Form Inquiry</h2>
                    <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 10px 0;"><strong>Topic:</strong> ${subject.toUpperCase()}</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="white-space: pre-wrap; color: #334155; line-height: 1.6;"><strong>Message:</strong><br/>${message}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Inquiry sent successfully." });

    } catch (err) {
        console.error("❌ Error sending contact email:", err);
        res.status(500).json({ error: "Server error: Failed to send inquiry email." });
    }
});

/// ----------------- SIGNUP API -----------------
app.post("/signup", upload.single("photo"), async (req, res) => {
  const data = req.body;
  let imageData = null;
  if (req.file) imageData = req.file.buffer.toString("base64");

  try {
    // Check if username or email already exists
    const existing = await db.collection("users").findOne({
      $or: [{ username: data.username }, { email: data.email }]
    });

    if (existing) {
      return res.status(400).json({ error: "⚠️ Username or Email already exists" });
    }
    // Checking for floor_no and door_no already exists
    const existingFlat = await db.collection("users").findOne({
      floor_no: data.floor_no,
      door_no: data.door_no
    });
    if (existingFlat) {
      return res.status(400).json({ error: "⚠️ Floor No and Door No combination already exists" });
    }
    // Checking for email aleady exists
    const existingEmail = await db.collection("users").findOne({ email: data.email });
    if (existingEmail) {
      return res.status(400).json({ error: "⚠️ Email already exists" });
    }
    
    const hashedPassword = await hash(data.password, 10);
    const status = data.role === "admin" ? "APPROVED" : "PENDING";

    // Transform dynamic family_member fields into an array
    let familyMembers = [];
    const numMembers = Number(data.family_members) || 0;

    for (let i = 0; i < numMembers; i++) {
      const member = {
        name: data[`family_member_${i + 1}`] || "",
        age: data[`family_member_${i + 1}age`] || "",
        gender: data[`family_member_${i + 1}gender`] || "",
        occupation: data[`family_member_${i + 1}occupation`] || "",
        student_school: data[`family_member_${i + 1}student_school`] || "",
        student_school_name: data[`family_member_${i + 1}student_school_name`] || "",
        student_college: data[`family_member_${i + 1}student_college`] || "",
        student_college_name: data[`family_member_${i + 1}student_college_name`] || "",
        office_name: data[`family_member_${i + 1}office_name`] || ""
      };
      familyMembers.push(member);
    }

    await db.collection("users").insertOne({
      firstname: data.firstname,
      lastname: data.lastname,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      door_no: data.door_no,
      floor_no: data.floor_no,
      apartment: data.apartment,
      family_details: data.family_details,
      family_members: familyMembers,
      communication: data.communication,
      worker_type: data.worker_type,
      work: data.work,
      seperate_work: data.seperate_work,
      time: data.time,
      terms: data.terms === "true" || data.terms === true,
      status,
      image: imageData
    });

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});


// ----------------- LOGIN API - Improved -----------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.collection("users").findOne({ username });
    
    // 1. Check if user exists
    if (!user) {
        return res.status(401).json({ error: "❌ Invalid username or password" });
    }

    // 2. Critical: Check for missing/invalid password field BEFORE bcrypt.compare()
    if (!user.password) {
        console.error(`❌ Data Error: User ${username} found but has no password field.`);
        return res.status(500).json({ error: "Server error: User record corrupt." });
    }
    
    // 3. Check for admin approval status
    if (user.role !== "admin" && user.status !== "APPROVED") {
      return res.status(403).json({ error: "⏳ Account pending admin approval" });
    }

    // 4. Compare password
    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "❌ Invalid username or password" });

res.json({
  message: "✅ Login successful",
  token: generateToken(user),
  user: {
    id: user._id.toString(),
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    image: user.image || null,
  },
});
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});


// ----------------- SOCIAL AUTHENTICATION APIs -----------------

// POST - Authenticate with Google
app.post("/auth/google", async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    return res.status(400).json({ error: "Google credential token is required." });
  }

  try {
    console.log("🔍 Google Auth: Attempting to verify credential...");
    
    // Verify the Google ID token using OAuth2Client
    const payload = await verifyGoogleToken(credential);
    
    if (!payload) {
      console.error("❌ Google Token Verification Failed");
      return res.status(401).json({ error: "Invalid Google credential. Token verification failed." });
    }

    console.log("✅ Google Token Verified for email:", payload.email);
    
    const { email, sub, firstname, lastname, picture } = payload;

    // 1. Look for user by provider/providerId
    let user = await db.collection("users").findOne({ provider: "google", providerId: sub });

    // 2. If not found by provider, check by email
    if (!user) {
      console.log("👤 User not found by provider, checking by email...");
      user = await db.collection("users").findOne({ email });
      
      if (user) {
        console.log("👤 User found by email, linking Google provider...");
        // Link the provider to the existing account
        const updateFields = {
          provider: "google",
          providerId: sub
        };
        // Update profile picture if user doesn't already have one
        if (!user.image && picture) {
          updateFields.profilePicture = picture;
        }
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: updateFields }
        );
        // Refresh the user object
        user = await db.collection("users").findOne({ _id: user._id });
      } else {
        console.log("👤 User not found, creating new account...");
        // Create a new account automatically
        const generatedUsername = await generateUniqueUsername(email, db);
        const dummyPassword = await hash(randomBytes(16).toString("hex"), 10);
        
        const newUser = {
          firstname,
          lastname,
          username: generatedUsername,
          email,
          phone: "",
          password: dummyPassword,
          role: "member", // default role
          door_no: "",
          floor_no: "",
          apartment: "",
          family_details: "",
          family_members: [],
          communication: "",
          worker_type: "",
          work: "",
          seperate_work: "",
          time: "",
          terms: true,
          status: "APPROVED", // Auto-approved for social login
          provider: "google",
          providerId: sub,
          profilePicture: picture,
          createdAt: new Date()
        };

        const result = await db.collection("users").insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
        console.log("✅ New user created with ID:", user._id);
      }
    } else {
      console.log("✅ Existing user found:", user._id);
    }

    // 3. Issue JWT Token
    const token = generateToken(user);

    res.json({
      message: "✅ Google login successful",
      token,
      user: {
        id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
        image: user.image || user.profilePicture || null,
      }
    });

  } catch (err) {
    console.error("❌ Google Auth Error:", err.message);
    res.status(500).json({ error: "Server error during Google authentication: " + err.message });
  }
});

// POST - Authenticate with Apple
app.post("/auth/apple", async (req, res) => {
  const { idToken, userDetails } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "Apple ID Token is required." });
  }

  try {
    const payload = await verifyAppleToken(idToken);
    if (!payload) {
      return res.status(401).json({ error: "Invalid Apple ID Token." });
    }

    const { email, sub } = payload;
    let firstname = payload.firstname || "Apple";
    let lastname = payload.lastname || "User";

    // If userDetails is passed from the client, parse it (it might contain name)
    if (userDetails) {
      try {
        const parsed = typeof userDetails === 'string' ? JSON.parse(userDetails) : userDetails;
        if (parsed.name) {
          if (parsed.name.firstName) firstname = parsed.name.firstName;
          if (parsed.name.lastName) lastname = parsed.name.lastName;
        }
      } catch (e) {
        console.error("Error parsing Apple userDetails:", e);
      }
    }

    // 1. Look for user by provider/providerId
    let user = await db.collection("users").findOne({ provider: "apple", providerId: sub });

    // 2. If not found by provider, check by email
    if (!user) {
      user = await db.collection("users").findOne({ email });
      if (user) {
        // Link the provider to the existing account
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { provider: "apple", providerId: sub } }
        );
        user = await db.collection("users").findOne({ _id: user._id });
      } else {
        // Create a new account automatically
        const generatedUsername = await generateUniqueUsername(email, db);
        const dummyPassword = await hash(randomBytes(16).toString("hex"), 10);
        
        const newUser = {
          firstname,
          lastname,
          username: generatedUsername,
          email,
          phone: "",
          password: dummyPassword,
          role: "member", // default role
          door_no: "",
          floor_no: "",
          apartment: "",
          family_details: "",
          family_members: [],
          communication: "",
          worker_type: "",
          work: "",
          seperate_work: "",
          time: "",
          terms: true,
          status: "APPROVED", // Auto-approved for social login
          provider: "apple",
          providerId: sub,
          createdAt: new Date()
        };

        const result = await db.collection("users").insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }
    }

    // 3. Issue JWT Token
    const token = generateToken(user);

    res.json({
      message: "✅ Apple login successful",
      token,
      user: {
        id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
        image: user.image || null,
      }
    });

  } catch (err) {
    console.error("❌ Apple Auth Error:", err);
    res.status(500).json({ error: "Server error during Apple authentication." });
  }
});


// ----------------- ADMIN/USER Profile Management -----------------

// GET user profile by ID (ObjectId or username)
app.get("/user/profile/:id", async (req, res) => {
  const { id } = req.params;

  let query;
  if (ObjectId.isValid(id)) {
    query = { _id: new ObjectId(id) };
  } else {
    query = { username: id };
  }

  try {
    const user = await db.collection("users").findOne(
      query,
      { projection: { password: 0 } } // exclude password
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Server error while fetching user profile" });
  }
});

// PUT (UPDATE) user profile by username - Consolidated and cleaned the duplicate routes
app.put("/user/profile/:id", upload.single("photo"), async (req, res) => {
  const { id } = req.params;
  console.log("PUT /user/profile/:id called with id:", id);
  console.log("Incoming Content-Type:", req.headers['content-type']);
  console.log("req.body is:", req.body);

  try {
    const body = req.body || {};
    const { 
      firstname, lastname, email, phone, floor_no, door_no, 
      apartment, family_details, worker_type, work, seperate_work, time 
    } = body;
    
    // Parse family_members if passed as string (from FormData)
    let family_members;
    if (body.family_members) {
      try {
        family_members = JSON.parse(body.family_members);
      } catch (e) {
        family_members = body.family_members;
      }
    }

    const updateFields = { 
      firstname, lastname, email, phone, floor_no, door_no,
      apartment, family_details, worker_type, work, seperate_work, time
    };
    
    if (family_members !== undefined) {
      updateFields.family_members = family_members;
    }

    if (req.file) {
      updateFields.image = req.file.buffer.toString("base64");
    }

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) delete updateFields[key];
    });

    let query;
    if (ObjectId.isValid(id) && (String(id).length === 24 || String(id).length === 12)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { username: id };
    }

    const result = await db.collection("users").findOneAndUpdate(
      query,
      { $set: updateFields },
      { returnDocument: "after" }
    );

    // Support both MongoDB Driver v5 (returns {value: doc}) and v6+ (returns doc)
    const updatedUser = result?.value || result;

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: updatedUser.username,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      floor_no: updatedUser.floor_no,
      door_no: updatedUser.door_no,
      role: updatedUser.role,
      status: updatedUser.status,
      image: updatedUser.image || null,
      family_details: updatedUser.family_details,
      family_members: updatedUser.family_members,
      apartment: updatedUser.apartment,
    });
  } catch (err) {
    console.error("Server error while updating profile:", err);
    res.status(500).json({ error: "Server error while updating profile: " + err.message });
  }
});

// ----------------- ADMIN MANAGEMENT ROUTES -----------------

// GET all users for admin view (kept for completeness)
app.get("/admin/users", async (req, res) => { 
    try {
        // Fetch all users. You can exclude sensitive fields like password.
        const users = await db.collection("users").find({})
            .project({ 
                password: 0, 
                family_details: 0, 
                family_members: 0, 
                communication: 0, 
                worker_type: 0, 
                work: 0, 
                seperate_work: 0, 
                time: 0, 
                terms: 0 
            })
            .toArray(); 
        
        res.json(users);

    } catch (err) {
        console.error("Error fetching all users for admin:", err);
        res.status(500).json({ error: "Server error fetching user list" });
    } 
});

// GET pending users (new functionality)
app.get("/pending-users", async (req, res) => {
    const adminUserId = req.headers["x-user-id"]; 
    
    if (!adminUserId || !ObjectId.isValid(adminUserId)) {
        return res.status(401).json({ error: "Unauthorized: Missing Admin ID" });
    }

    try {
        // 1. Authorization check
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can view pending users" });
        }

        // 2. Fetch pending users
        const pendingUsers = await db.collection("users").find({ status: "PENDING" })
            .project({ password: 0 }) 
            .toArray();

        res.json(pendingUsers);
    } catch (err) {
        console.error("Error fetching pending users:", err);
        res.status(500).json({ error: "Server error fetching pending user list" });
    }
});


// PUT Admin approves user by ID (New functionality)
app.put("/admin/approve/:id", async (req, res) => {
    const targetId = req.params.id;
    const adminUserId = req.headers["x-user-id"]; 

    if (!ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        // 1. Authorization check
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can approve users" });
        }

        // 2. Perform the update
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(targetId) },
            { $set: { status: "APPROVED" } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found for approval" });
        }

        res.status(200).json({ message: "User approved successfully" });
    } catch (err) {
        console.error("Error approving user:", err);
        res.status(500).json({ error: "Server error during approval" });
    }
});

// DELETE Admin rejects/deletes user by ID (New functionality)
app.delete("/admin/reject/:id", async (req, res) => {
    const targetId = req.params.id;
    const adminUserId = req.headers["x-user-id"];

    if (!ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        // 1. Authorization check
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can reject/delete users" });
        }

        // 2. Perform the deletion
        const result = await db.collection("users").deleteOne({ _id: new ObjectId(targetId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found for deletion" });
        }

        res.status(200).json({ message: "User rejected and deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Server error during rejection/deletion" });
    }
});

// Alternative POST route for approval (filling the stub, expects ID in body)
app.post("/approve-user", async (req, res) => {
    const targetId = req.body.id;
    req.params.id = targetId; // Reuse the PUT logic by setting params
    req.method = 'PUT'; // Informative only, doesn't change Express flow
    // return await app.handle(req, res); // This is highly non-standard. Implementing direct logic instead.
    
    // Direct implementation logic (as above)
    const adminUserId = req.headers["x-user-id"]; 
    if (!targetId || !ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can approve users" });
        }
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(targetId) },
            { $set: { status: "APPROVED" } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: "User not found for approval" });
        res.status(200).json({ message: "User approved successfully via POST" });
    } catch (err) {
        console.error("Error approving user (POST):", err);
        res.status(500).json({ error: "Server error during POST approval" });
    }
});

// Alternative POST route for rejection (filling the stub, expects ID in body)
app.post("/reject-user", async (req, res) => {
    const targetId = req.body.id;
    
    const adminUserId = req.headers["x-user-id"];

    if (!targetId || !ObjectId.isValid(targetId)) return res.status(400).json({ error: "Invalid target user ID" });
    if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized: Invalid or missing Admin ID" });

    try {
        const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Only admins can reject/delete users" });
        }
        const result = await db.collection("users").deleteOne({ _id: new ObjectId(targetId) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "User not found for deletion" });
        res.status(200).json({ message: "User rejected and deleted successfully via POST" });
    } catch (err) {
        console.error("Error deleting user (POST):", err);
        res.status(500).json({ error: "Server error during POST rejection/deletion" });
    }
});

// GET admin user profile (filling the stub, identical to /user/profile/:id)
app.get("/admin/user/:id", async (req, res) => { 
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    try {
        const user = await db.collection("users").findOne(
          { _id: new ObjectId(id) },
          { projection: { password: 0 } }
        );
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching admin user profile:", err);
        res.status(500).json({ error: "Server error while fetching admin user profile" });
    }
});


// ----------------- EVENTS APIs -----------------

// Create event (admin or user with x-user-id) - Consolidated
app.post("/events", async (req, res) => {
  const data = req.body;
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Validate required fields
  if (!data.title || !data.date || !data.startTime || !data.venue) {
    return res.status(400).json({ error: "Title, Date, Start Time, and Venue are required." });
  }

  // Validate date is not in the past
  const eventDate = new Date(data.date);
  if (isNaN(eventDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate < today) {
    return res.status(400).json({ error: "Event date cannot be in the past." });
  }

  const newEvent = {
    title: data.title,
    description: data.description,
    date: new Date(data.date),
    startTime: data.startTime,
    endTime: data.endTime,
    venue: data.venue,
    organizer: data.organizer,
    contact: data.contact,
    category: data.category,
    image: data.image || null,
    postedBy: userId, // Store the user ID as a string
    likes: [],
    comments: [],
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("events").insertOne(newEvent);
    res.status(201).json({ ...newEvent, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET UPCOMING EVENTS (with poster profile lookup)
app.get("/events/upcoming", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await db.collection("events").aggregate([
      {
        $match: { date: { $gte: today } }
      },
      {
        $addFields: {
          postedByObjId: {
            $cond: {
              if: { $eq: [{ $type: "$postedBy" }, "string"] },
              then: { $toObjectId: "$postedBy" },
              else: "$postedBy"
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "postedByObjId",
          foreignField: "_id",
          as: "poster"
        }
      },
      {
        $unwind: {
          path: "$poster",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          venue: 1,
          organizer: 1,
          contact: 1,
          category: 1,
          image: 1,
          postedBy: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          posterName: {
            $concat: ["$poster.firstname", " ", "$poster.lastname"]
          },
          posterImage: "$poster.image"
        }
      },
      {
        $sort: { date: 1 }
      }
    ]).toArray();
    
    res.json(events);
  } catch (err) {
    console.error("Error fetching upcoming events:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET PAST EVENTS (with poster profile lookup)
app.get("/events/past", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await db.collection("events").aggregate([
      {
        $match: { date: { $lt: today } }
      },
      {
        $addFields: {
          postedByObjId: {
            $cond: {
              if: { $eq: [{ $type: "$postedBy" }, "string"] },
              then: { $toObjectId: "$postedBy" },
              else: "$postedBy"
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "postedByObjId",
          foreignField: "_id",
          as: "poster"
        }
      },
      {
        $unwind: {
          path: "$poster",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          venue: 1,
          organizer: 1,
          contact: 1,
          category: 1,
          image: 1,
          postedBy: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          posterName: {
            $concat: ["$poster.firstname", " ", "$poster.lastname"]
          },
          posterImage: "$poster.image"
        }
      },
      {
        $sort: { date: -1 }
      }
    ]).toArray();
    
    res.json(events);
  } catch (err) {
    console.error("Error fetching past events:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single event (Kept for completeness)
app.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid event ID" });

  try {
    const event = await db.collection("events").findOne({ _id: new ObjectId(id) });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put("/events/:id", async (req, res) => {
    const eventId = req.params.id;
    const userId = req.headers["x-user-id"];
    const data = req.body;

    // 1. Basic ID Validation
    if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID format." });
    }
    if (!userId || !ObjectId.isValid(userId)) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing User ID." });
    }

    const eventObjectId = new ObjectId(eventId);
    const userObjectId = new ObjectId(userId);

    try {
        // 2. Fetch Event and User
        const event = await db.collection("events").findOne({ _id: eventObjectId });
        if (!event) return res.status(404).json({ error: "Event not found." });

        const user = await db.collection("users").findOne({ _id: userObjectId });
        if (!user) return res.status(404).json({ error: "User not found in database." });

        // 3. Authorization Check (CRITICAL)
        // Ensure both IDs are strings for reliable comparison
        const eventPosterIdString = String(event.postedBy);
        const userIdString = String(userId);

        const isOwner = eventPosterIdString === userIdString;
        const isAdmin = user.role === "admin";

        console.log(`Edit Attempt: User ID ${userIdString}, Event Poster ID ${eventPosterIdString}`);
        console.log(`Is Owner: ${isOwner}, Is Admin: ${isAdmin}`);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "Forbidden: Not the event owner or admin." });
        }

        // 4. Prepare Update Data
        const updateData = { ...data, updatedAt: new Date() };

        // CRITICAL: Ensure date is converted to a proper Date object and validate not in past
        if (data.date) {
            const dateObj = new Date(data.date);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ error: "Invalid date value provided." });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateObj.setHours(0, 0, 0, 0);

            if (dateObj < today) {
                return res.status(400).json({ error: "Event date cannot be in the past." });
            }

            updateData.date = dateObj;
        }

        // Clean up protected fields that should not be updated via PUT
        delete updateData.likes;
        delete updateData.comments;
        delete updateData.postedBy;
        delete updateData._id;

        // 5. Execute Update
        const result = await db.collection("events").updateOne(
            { _id: eventObjectId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Event was not found for updating." });
        }

        // 6. Return the updated event (optional but good practice)
        const updatedEvent = await db.collection("events").findOne({ _id: eventObjectId });
        res.json(updatedEvent);

    } catch (err) {
        // Log the exact server error for debugging!
        console.error("❌ Critical Error updating event:", err);
        res.status(500).json({ error: "Server error during event update." });
    }
})

// DELETE EVENT - CONSOLIDATED ROUTE (Kept the robust version)
app.delete("/events/:id", async (req, res) => {
    const eventId = req.params.id;
    const userId = req.headers["x-user-id"]; 

    // 1. Validation for IDs
    if (!ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "Invalid event ID format." });
    }
    if (!userId || !ObjectId.isValid(userId)) {
        console.log("Unauthorized: Missing or Invalid User ID in header.");
        return res.status(401).json({ error: "Unauthorized: Invalid or missing User ID in header." });
    }

    try {
        // Find the event
        const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
        if (!event) return res.status(404).json({ error: "Event not found." });

        // Find the user object to check their role
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        
        if (!user) {
            console.error(`Deletion failed: User not found in 'users' collection for ID: ${userId}`);
            return res.status(404).json({ error: "Admin/User credentials not found in database." });
        }

        // 3. Authorization Check: Owner or Admin
        const eventPosterIdString = event.postedBy instanceof ObjectId ? event.postedBy.toString() : String(event.postedBy);

        const isOwner = eventPosterIdString === String(userId);
        const isAdminUser = user.role === "admin";

        console.log(`DELETE attempt: User Role: ${user.role}, Is Owner: ${isOwner}, Is Admin Check Result: ${isAdminUser}`);

        if (!isOwner && !isAdminUser) {
            return res.status(403).json({ error: "Forbidden: You must be the event owner or an admin to delete this." });
        }

        // 4. Perform Deletion
        const result = await db.collection("events").deleteOne({ _id: new ObjectId(eventId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Event was not deleted (possibly disappeared before deletion)." });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("Critical Error in delete route processing:", err);
        res.status(500).json({ error: "A server error occurred during deletion." });
    }
});

// --- LIKE/UNLIKE EVENT --- (unchanged)
app.post("/events/:id/like", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "Event not found" });

    let update;
    if (event.likes?.includes(userId)) {
      update = { $pull: { likes: userId } };
    } else {
      update = { $push: { likes: userId } };
    }

    await db.collection("events").updateOne(
      { _id: new ObjectId(req.params.id) },
      update
    );
    const updated = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, likes: updated.likes });
  } catch (err) {
    res.status(500).json({ error: "Failed to like/unlike" });
  }
});

// --- COMMENT EVENT --- (unchanged)
app.post("/events/:id/comment", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { text } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const comment = {
      userId,
      username: user.username || user.firstname || "Anonymous",
      text,
      createdAt: new Date(),
    };

    await db.collection("events").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { comments: comment } }
    );
    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});


// ----------------- LOST AND FOUND APIs -----------------

// GET all lost and found items
app.get("/lostandfound", async (req, res) => {
  try {
    const items = await db.collection("lostandfound").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "poster"
        }
      },
      {
        $unwind: {
          path: "$poster",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          type: 1,
          title: 1,
          description: 1,
          contact: 1,
          name: 1,
          image: 1,
          createdAt: 1,
          postedBy: 1,
          posterName: {
            $concat: ["$poster.firstname", " ", "$poster.lastname"]
          },
          posterImage: "$poster.image"
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();
    res.json(items);
  } catch (err) {
    console.error("Error fetching lost and found items:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new lost or found item
app.post("/lostandfound", upload.single('photo'), async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { type, title, description, contact, name } = req.body;
  if (!type || !title || !description || !contact || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let imageData = null;
  if (req.file) {
    imageData = req.file.buffer.toString("base64");
  }

  const newItem = {
    type,
    title,
    description,
    contact,
    name,
    postedBy: userId,
    image: imageData,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("lostandfound").insertOne(newItem);
    res.status(201).json({ ...newItem, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating lost and found item:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE lost and found item (admin only)
app.delete("/lostandfound/:id", async (req, res) => {
  const itemId = req.params.id;
  const userId = req.headers["x-user-id"];

  if (!ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid item ID format." });
  }
  if (!userId || !ObjectId.isValid(userId)) {
    return res.status(401).json({ error: "Unauthorized: Invalid or missing User ID." });
  }

  try {
    // Find the user to check role
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Only admins can delete lost and found items." });
    }

    // Find and delete the item
    const result = await db.collection("lostandfound").deleteOne({ _id: new ObjectId(itemId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (err) {
    console.error("Error deleting lost and found item:", err);
    res.status(500).json({ error: "Server error during deletion." });
  }
});

// ----------------- VISITOR LOG APIs -----------------

// GET family details by door number
app.get("/family/:doorNo", async (req, res) => {
  const { doorNo } = req.params;
  try {
    const user = await db.collection("users").findOne(
      { door_no: doorNo },
      { projection: { family_members: 1, firstname: 1, lastname: 1, floor_no: 1 } }
    );
    if (!user) {
      return res.status(404).json({ error: "No family found for this door number" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching family details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all visitor entries
app.get("/visitors", async (req, res) => {
  try {
    const visitors = await db.collection("visitors").find({}).sort({ entryTime: -1 }).toArray();
    res.json(visitors);
  } catch (err) {
    console.error("Error fetching visitor logs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new visitor entry
app.post("/visitors", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, contact, purpose, vehicleNumber, entryTime, doorNo } = req.body;
  if (!name || !contact || !purpose || !entryTime || !doorNo) {
    return res.status(400).json({ error: "Name, contact, purpose, entry time, and door number are required" });
  }

  const newVisitor = {
    name,
    contact,
    purpose,
    vehicleNumber: vehicleNumber || "",
    entryTime: new Date(entryTime),
    doorNo,
    loggedBy: userId,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("visitors").insertOne(newVisitor);

    // Send notification to the resident at the door number
    const resident = await db.collection("users").findOne({ door_no: doorNo });
    if (resident) {
      await sendNotification(resident._id.toString(), `A visitor named ${name} has arrived at your door (${doorNo}). Purpose: ${purpose}.`, "visitor");
    }

    res.status(201).json({ ...newVisitor, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating visitor entry:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- DELIVERY LOG APIs -----------------

// GET all delivery entries
app.get("/deliveries", async (req, res) => {
  try {
    const deliveries = await db.collection("deliveries").find({}).sort({ deliveryTime: -1 }).toArray();
    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching delivery logs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single delivery by ID
app.get("/deliveries/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid delivery ID" });

  try {
    const delivery = await db.collection("deliveries").findOne({ _id: new ObjectId(id) });
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });
    res.json(delivery);
  } catch (err) {
    console.error("Error fetching delivery:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update delivery status
app.put("/deliveries/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.headers["x-user-id"];

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid delivery ID" });
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!status || !["Pending", "Received"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be 'Pending' or 'Received'" });
  }

  try {
    const result = await db.collection("deliveries").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery status updated successfully" });
  } catch (err) {
    console.error("Error updating delivery status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new delivery entry
app.post("/deliveries", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { senderName, senderContact, recipientDoorNo, itemDescription, deliveryTime, deliveryType } = req.body;
  if (!senderName || !senderContact || !recipientDoorNo || !itemDescription || !deliveryTime) {
    return res.status(400).json({ error: "Sender name, contact, recipient door number, item description, and delivery time are required" });
  }

  const newDelivery = {
    senderName,
    senderContact,
    recipientDoorNo,
    itemDescription,
    deliveryType: deliveryType || "Other",
    deliveryTime: new Date(deliveryTime),
    status: "Pending",
    loggedBy: userId,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("deliveries").insertOne(newDelivery);

    // Send notification to the resident at the door number
    const resident = await db.collection("users").findOne({ door_no: recipientDoorNo });
    if (resident) {
      await sendNotification(resident._id.toString(), `You have received a delivery: ${itemDescription} from ${senderName}. Please collect from security.`, "delivery");
    }

    // Send notification email to the user at the door number
    const user = await db.collection("users").findOne({ door_no: recipientDoorNo });
    if (user && user.email) {
      const mailOptions = {
        from: 'Your Community App <YOUR_EMAIL@gmail.com>',
        to: user.email,
        subject: 'Delivery Notification - Community Management System',
        html: `
          <p>Dear ${user.firstname} ${user.lastname},</p>
          <p>You have received a delivery at the security gate.</p>
          <p><strong>Delivery Details:</strong></p>
          <ul>
            <li><strong>Sender:</strong> ${senderName}</li>
            <li><strong>Sender Contact:</strong> ${senderContact}</li>
            <li><strong>Item Description:</strong> ${itemDescription}</li>
            <li><strong>Delivery Time:</strong> ${new Date(deliveryTime).toLocaleString()}</li>
          </ul>
          <p>Please collect your delivery from the security office.</p>
          <p>Thank you,<br>Community Management System Security Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Delivery notification sent to ${user.email}`);
    }

    res.status(201).json({ ...newDelivery, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating delivery entry:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- ADMIN STATS APIs -----------------

// GET admin statistics for dashboard
app.get("/admin/stats", async (req, res) => {
  const adminUserId = req.headers["x-user-id"];

  if (!adminUserId || !ObjectId.isValid(adminUserId)) {
    return res.status(401).json({ error: "Unauthorized: Missing Admin ID" });
  }

  try {
    // 1. Authorization check
    const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Only admins can view stats" });
    }

    // 2. Fetch all approved users with family members
    const users = await db.collection("users").find({ status: "APPROVED" }).toArray();

    // 3. Calculate statistics
    let men = 0;
    let women = 0;
    let children = 0;

    users.forEach(user => {
      if (user.family_members && Array.isArray(user.family_members)) {
        user.family_members.forEach(member => {
          const age = parseInt(member.age);
          const gender = member.gender?.toLowerCase();

          if (age < 18) {
            children++;
          } else if (gender === 'male' || gender === 'm') {
            men++;
          } else if (gender === 'female' || gender === 'f') {
            women++;
          }
        });
      }
    });

    const total = men + women + children;

    // 4. Calculate house statistics
    const allDoorNos = await db.collection("users").distinct("door_no");
    const occupiedDoorNos = await db.collection("users").distinct("door_no", { status: "APPROVED" });
    const occupied = occupiedDoorNos.length;
    const empty = allDoorNos.length - occupied;

    res.json({
      men,
      women,
      children,
      total,
      occupied,
      empty,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- SECURITY DASHBOARD APIs -----------------

// 1. Log Visitor
app.post("/api/visitors", async (req, res) => {
  try {
    const { name, contact, purpose, vehicle_no, door_no } = req.body;
    if (!door_no) return res.status(400).json({ error: "Door number is required" });
    
    // validate door number against approved users
    const resident = await db.collection("users").findOne({ door_no: door_no, status: "APPROVED" });
    if (!resident) return res.status(400).json({ error: "Invalid door number. No resident found." });

    const newVisitor = {
      name, contact, purpose, vehicle_no, door_no,
      entry_time: new Date(),
      createdAt: new Date()
    };
    await db.collection("visitors").insertOne(newVisitor);
    res.status(201).json({ message: "Visitor logged successfully", visitor: newVisitor });
  } catch (err) {
    console.error("Error logging visitor:", err);
    res.status(500).json({ error: "Server error logging visitor" });
  }
});

// 2. Get Past Visitors
app.get("/api/visitors", async (req, res) => {
  try {
    const visitors = await db.collection("visitors").find({}).sort({ entry_time: -1 }).toArray();
    res.json(visitors);
  } catch (err) {
    console.error("Error fetching visitors:", err);
    res.status(500).json({ error: "Server error fetching visitors" });
  }
});

// 3. Log Delivery
app.post("/api/deliveries", async (req, res) => {
  try {
    const { sender_name, sender_contact, recipient_door_no, description, delivery_type } = req.body;
    if (!recipient_door_no) return res.status(400).json({ error: "Recipient door number is required" });
    
    const resident = await db.collection("users").findOne({ door_no: recipient_door_no, status: "APPROVED" });
    if (!resident) return res.status(400).json({ error: "Invalid door number. No resident found." });

    const newDelivery = {
      sender_name, sender_contact, recipient_door_no, description, delivery_type,
      delivery_time: new Date(),
      status: "Pending",
      createdAt: new Date()
    };
    await db.collection("deliveries").insertOne(newDelivery);
    res.status(201).json({ message: "Delivery logged successfully", delivery: newDelivery });
  } catch (err) {
    console.error("Error logging delivery:", err);
    res.status(500).json({ error: "Server error logging delivery" });
  }
});

// 4. Get Delivery Log
app.get("/api/deliveries", async (req, res) => {
  try {
    const deliveries = await db.collection("deliveries").find({}).sort({ delivery_time: -1 }).toArray();
    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching deliveries:", err);
    res.status(500).json({ error: "Server error fetching deliveries" });
  }
});

// 5. Update Delivery Status
app.put("/api/deliveries/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid delivery ID" });

    const result = await db.collection("deliveries").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: "Received", updated_at: new Date() } },
      { returnDocument: "after" }
    );
    
    if (!result) return res.status(404).json({ error: "Delivery not found" });
    res.json({ message: "Delivery marked as received" });
  } catch (err) {
    console.error("Error updating delivery status:", err);
    res.status(500).json({ error: "Server error updating delivery status" });
  }
});

// ----------------- ANNOUNCEMENTS APIs -----------------

// GET all announcements
app.get("/announcements", async (req, res) => {
  try {
    const announcements = await db.collection("announcements").find({}).sort({ createdAt: -1 }).toArray();
    res.json(announcements);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new announcement
app.post("/announcements", async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newAnnouncement = {
    title,
    content: content || "",
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("announcements").insertOne(newAnnouncement);
    res.status(201).json({ ...newAnnouncement, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE an announcement
app.delete("/announcements/:id", async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.headers["x-user-id"];
  
  const { ObjectId } = require('mongodb');

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid announcement ID" });
  if (!adminUserId || !ObjectId.isValid(adminUserId)) return res.status(401).json({ error: "Unauthorized" });

  try {
    const adminUser = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await db.collection("announcements").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Announcement not found" });

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET notifications for a user
app.get("/api/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user ID" });

  try {
    const notifications = await db.collection("notifications").find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  const { ObjectId } = require('mongodb');
  
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid notification ID" });

  try {
    const result = await db.collection("notifications").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isRead: true } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error updating notification:", err);
  }
});

// ----------------- COMPLAINTS APIs -----------------

// GET all complaints
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await db.collection("complaints").find({}).sort({ createdAt: -1 }).toArray();
    res.json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create a new complaint
app.post("/api/complaints", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { title, type, description } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: "Issue title and category are required" });
  }

  try {
    // Generate next ID
    const lastComplaint = await db.collection("complaints")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    let nextNum = 1;
    if (lastComplaint.length > 0) {
      const lastId = lastComplaint[0].id;
      const match = lastId.match(/#CMP-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const nextId = `#CMP-${String(nextNum).padStart(3, '0')}`;

    // Format current date: e.g. "Jun 24, 2026"
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    const formattedDate = new Date().toLocaleDateString('en-US', options);

    const newComplaint = {
      id: nextId,
      title,
      type,
      description: description || "",
      status: "Pending",
      date: formattedDate,
      userId: userId,
      createdAt: new Date()
    };

    const result = await db.collection("complaints").insertOne(newComplaint);
    res.status(201).json({ ...newComplaint, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update complaint status (Admin only)
app.put("/api/complaints/:id/status", async (req, res) => {
  const adminUserId = req.headers["x-user-id"];
  if (!adminUserId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    // Check if requester is admin
    const requester = await db.collection("users").findOne({ _id: new ObjectId(adminUserId) });
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Only admins can update complaint status" });
    }

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }

    const result = await db.collection("complaints").updateOne(
      query,
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({ message: `Complaint status updated to ${status}` });
  } catch (err) {
    console.error("Error updating complaint status:", err);
  }
});

// ----------------- SECURITY STATS & CHECKOUT APIs -----------------

// GET security statistics
app.get("/api/security/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's Visitors (total entered today)
    const todayVisitors = await db.collection("visitors").countDocuments({
      $or: [
        { entry_time: { $gte: today } },
        { entryTime: { $gte: today } },
        { createdAt: { $gte: today } }
      ]
    });

    // Visitors Inside (entered today, but no exit_time or exitTime recorded)
    const visitorsInside = await db.collection("visitors").countDocuments({
      $or: [
        { entry_time: { $gte: today } },
        { entryTime: { $gte: today } },
        { createdAt: { $gte: today } }
      ],
      exit_time: { $exists: false },
      exitTime: { $exists: false }
    });

    // Deliveries Today
    const todayDeliveries = await db.collection("deliveries").countDocuments({
      $or: [
        { delivery_time: { $gte: today } },
        { createdAt: { $gte: today } }
      ]
    });

    // Pending Approvals (users count pending)
    const pendingApprovals = await db.collection("users").countDocuments({
      status: "PENDING"
    });

    res.json({
      todayVisitors,
      visitorsInside,
      todayDeliveries,
      pendingApprovals
    });
  } catch (err) {
    console.error("Error fetching security stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT checkout a visitor
app.put("/api/visitors/:id/checkout", async (req, res) => {
  const { id } = req.params;
  try {
    let query = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }

    const result = await db.collection("visitors").updateOne(
      query,
      { $set: { exit_time: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    res.json({ message: "Visitor checked out successfully" });
  } catch (err) {
    console.error("Error checking out visitor:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- SERVER START -----------------
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
