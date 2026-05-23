const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'assets', 'logo.png');
const destLogoPath = path.join(__dirname, 'public', 'logo.png');
const destFaviconPath = path.join(__dirname, 'public', 'favicon.ico');

console.log('--- Copying Company Logo ---');
console.log('Source:', srcPath);

try {
  // Ensure public directory exists
  if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
  }

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destLogoPath);
    console.log('Successfully copied logo.png to public/');
    
    fs.copyFileSync(srcPath, destFaviconPath);
    console.log('Successfully copied favicon.ico to public/');
  } else {
    console.error('Source company logo not found at:', srcPath);
  }
} catch (err) {
  console.error('Error during copy operations:', err.message);
}
console.log('--- Copy Finished ---');
