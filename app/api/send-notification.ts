import type { NextApiRequest, NextApiResponse } from "next";

const WHATSAPP_API_URL = `https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { notificationType, contactNumber, email, name } = req.body;

    try {
      if (notificationType === "whatsapp") {
        // Send WhatsApp notification
        const response = await fetch(WHATSAPP_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: contactNumber,
            type: "template",
            template: {
              name: "hello_world",
              language: { code: "en_US" },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`WhatsApp API error: ${await response.text()}`);
        }

        res.status(200).json({ success: true, message: "WhatsApp notification sent successfully." });
      } else if (notificationType === "email") {
        // Placeholder for email notifications
        console.log(`Email sent to ${email} for ${name}`);
        res.status(200).json({ success: true, message: "Email notification sent successfully." });
      }
    } catch (error) {
      console.error("Notification Error:", error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
