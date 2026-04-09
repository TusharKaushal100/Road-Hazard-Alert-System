// backend/services/emailService.js
// Sends alert email to authority when a high-confidence hazard is detected.
// Set ALERT_EMAIL + EMAIL_USER + EMAIL_PASS in .env to enable.
// If env vars are not set, it just logs instead.

import nodemailer from "nodemailer";

const LABEL_LABELS = {
  pothole:     "Pothole",
  flood:       "Flood",
  accident:    "Accident",
  traffic:     "Traffic Jam",
  road_damage: "Road Damage",
  animal:      "Animal on Road",
};

export async function sendAlertToAuthority(post) {
  // Only alert for high confidence hazards
  if (post.confidence < 0.75) return;
  if (post.label === "none" || post.label === "unknown") return;

  const alertEmail = process.env.ALERT_EMAIL;
  const emailUser  = process.env.EMAIL_USER;
  const emailPass  = process.env.EMAIL_PASS;

  if (!alertEmail || !emailUser || !emailPass) {
    // Log instead of sending when env not configured
    console.log(`[ALERT] ${LABEL_LABELS[post.label] || post.label} detected at ${post.locationName} (${Math.round(post.confidence * 100)}% confidence)`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from:    emailUser,
      to:      alertEmail,
      subject: `⚠️ Road Hazard Alert: ${LABEL_LABELS[post.label]} in ${post.locationName}`,
      html: `
        <h2>Road Hazard Detected</h2>
        <p><strong>Type:</strong> ${LABEL_LABELS[post.label] || post.label}</p>
        <p><strong>Location:</strong> ${post.locationName}, ${post.state}</p>
        <p><strong>Confidence:</strong> ${Math.round(post.confidence * 100)}%</p>
        <p><strong>Source Text:</strong> ${post.text}</p>
        <p><strong>Detected at:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log(`Alert email sent for ${post.label} at ${post.locationName}`);
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}
