"use client";
import vercel from "@/public/vercel.svg";

// Request notification permission on component mount
export const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }
  return false;
};

// Show notification function
export const showNotification = (
  title: string,
  body: string,
  senderName: string
) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: `${senderName}: ${body}`,
      icon: vercel, // Your app icon
      tag: "new-message", // Group similar notifications
    });
  }
};

// Play notification sound
export const playNotificationSound = () => {
  try {
    const audio = new Audio("/viber_message.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silent fail if audio can't play
    });
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};
