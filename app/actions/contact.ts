"use server";

export async function sendContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // You can integrate nodemailer here to send actual emails
  console.log("Contact Message Received:", { name, email, message });

  try {
    // In a real scenario, you might save this to DB or send email
    return { success: true, message: "Your message has been sent successfully!" };
  } catch (error) {
    console.error("Contact error:", error);
    return { success: false, message: "Failed to send message. Please try again." };
  }
}
