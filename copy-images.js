const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'public');

const filesToCopy = [
  { src: 'sher ali shahid.jpg', dest: 'sher ali shahid.jpg' },
  { src: 'sharafat.png', dest: 'sharafat.png' }
];

console.log('--- Starting Image Copy Script ---');
console.log('Source directory:', srcDir);
console.log('Destination directory:', destDir);

filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file.src);
  const destPath = path.join(destDir, file.dest);

  if (fs.existsSync(srcPath)) {
    try {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Successfully copied ${file.src} to public/`);
    } catch (err) {
      console.error(`Error copying ${file.src}:`, err.message);
    }
  } else {
    console.error(`Source file not found: ${srcPath}`);
  }
});
console.log('--- Image Copy Script Finished ---');
