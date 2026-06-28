import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBfEDxZWkzLf2e8Fs-fFAD7I9XuCSQtXOs",
  authDomain: "navttc-exam-portal.firebaseapp.com",
  databaseURL: "https://navttc-exam-portal-default-rtdb.firebaseio.com",
  projectId: "navttc-exam-portal",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  // Verify Cron Request (Vercel sets a special header for cron jobs)
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  try {
    const studentsSnapshot = await get(ref(db, 'students'));
    if (!studentsSnapshot.exists()) {
      return res.status(200).json({ message: "No students found." });
    }

    const students = studentsSnapshot.val();
    const unpaidNumbers = [];

    // Assuming the admin dashboard adds 'feeStatus' to the student object
    for (const key in students) {
      const student = students[key];
      // Check if feeStatus is missing, unpaid, or late, AND they have a phone number
      if (
        student.whatsappNumber && 
        (!student.feeStatus || student.feeStatus === 'Unpaid' || student.feeStatus === 'Late')
      ) {
        unpaidNumbers.push(student.whatsappNumber);
      }
    }

    if (unpaidNumbers.length === 0) {
      return res.status(200).json({ message: "All students have paid their fees!" });
    }

    // Call our own send-whatsapp endpoint
    // Since we are inside the Vercel network, we can call it directly via full URL 
    // or just import the logic. For simplicity, we'll hit the UltraMsg API directly here too.

    const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
    const token = process.env.ULTRAMSG_TOKEN;

    if (!instanceId || !token) {
      return res.status(500).json({ error: 'WhatsApp API credentials not configured.' });
    }

    const message = "Reminder from BSL Academy: Your monthly fee is currently pending. Please pay your fee as soon as possible to avoid late charges. Ignore this message if you have already paid.";

    const promises = unpaidNumbers.map(async (num) => {
      const formattedNum = num.replace(/[^\d+]/g, '');
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: token,
          to: formattedNum,
          body: message,
        })
      });
      return await response.json();
    });

    const results = await Promise.all(promises);

    res.status(200).json({ success: true, notifiedCount: unpaidNumbers.length, results });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
