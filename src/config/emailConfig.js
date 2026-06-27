// ============================================================
// EmailJS Configuration
// ============================================================
// 1. Go to https://www.emailjs.com/ and create a FREE account
// 2. Add an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with these variables:
//      {{to_email}}   - recipient email
//      {{to_name}}    - recipient name
//      {{verify_url}} - the verification link
// 4. Copy your Service ID, Template ID, and Public Key below:
// ============================================================

export const EMAILJS_CONFIG = {
  SERVICE_ID:  'service_htfs646',
  TEMPLATE_ID: 'template_bslverify', // Make sure this matches your Template ID in EmailJS
  PUBLIC_KEY:  's1iUZV79r8auxu182'
};

// The base URL of your deployed site (used to build verification links)
// During development this is localhost:3000
export const SITE_BASE_URL = window.location.origin;
