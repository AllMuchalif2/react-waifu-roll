const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace class names
  content = content.replace(/primary-blue/g, 'primary');
  content = content.replace(/secondary-yellow/g, 'secondary');
  content = content.replace(/\[#10b981\]/g, 'success');
  content = content.replace(/\[#9333ea\]/g, 'purple');
  content = content.replace(/\[#3d5afe\]/g, 'primary');
  content = content.replace(/\[#ffea00\]/g, 'secondary');
  content = content.replace(/bg-\[#1a1a1a\]/g, 'bg-text-main');
  content = content.replace(/text-\[#1a1a1a\]/g, 'text-text-main');
  content = content.replace(/border-\[#1a1a1a\]/g, 'border-border-main');
  
  // also replace in arbitrary shadow definitions if there's #1a1a1a 
  // shadow-[1px_1px_0px_#1a1a1a] -> shadow-[1px_1px_0px_var(--border)]
  content = content.replace(/#1a1a1a/g, 'var(--border)'); 

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});

console.log('Replaced successfully.');
