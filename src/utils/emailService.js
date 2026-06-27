import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, SITE_BASE_URL } from '../config/emailConfig';

/**
 * Generates a secure random verification token.
 */
export const generateVerificationToken = () => {
  const array = new Uint8Array(24);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Sends a verification email to the student.
 * @param {string} toEmail - Student's email address
 * @param {string} toName  - Student's full name
 * @param {string} token   - The verification token
 */
export const sendVerificationEmail = async (toEmail, toName, token) => {
  const encodedEmail = encodeURIComponent(toEmail);
  const verifyUrl = `${SITE_BASE_URL}/#/verify?email=${encodedEmail}&token=${token}`;

  const templateParams = {
    to_email:   toEmail,
    to_name:    toName,
    verify_url: verifyUrl,
    from_name:  'BSL Academy Skardu',
  };

  return emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID,
    templateParams,
    EMAILJS_CONFIG.PUBLIC_KEY
  );
};
