import dotenv from "dotenv";

dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        clientId: process.env.GOOGLE_CLIENT_ID
    }
})


console.log("GOOGLE_USER:", process.env.GOOGLE_USER);
console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Present" : "Missing");
console.log("CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Present" : "Missing");
console.log("REFRESH_TOKEN:", process.env.GOOGLE_REFRESH_TOKEN ? "Present" : "Missing");


transporter.verify()
    .then(() => { console.log("Email transporter is ready to send emails"); })
    .catch((err) => { console.error("Email transporter verification failed:", err); });


export async function sendEmail({ to, subject, html, text }) {

    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };

    const details = await transporter.sendMail(mailOptions);
    console.log("Email sent:", details);
}