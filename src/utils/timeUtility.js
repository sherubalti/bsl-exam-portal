/**
 * Utility functions for handling time, specifically Pakistan Standard Time (PKT)
 */

/**
 * Fetches or calculates the current time in Pakistan (UTC+5).
 * Using a simple local clock calculation for now.
 */
export const getCurrentPKTTime = async () => {
    const now = new Date();
    // Get UTC time in ms
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Add 5 hours for PKT
    const pkt = new Date(utc + (3600000 * 5));
    return pkt;
};

/**
 * Formats a Date object to 'YYYY-MM-DDTHH:mm' for datetime-local inputs
 */
export const formatForDateTimeInput = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
