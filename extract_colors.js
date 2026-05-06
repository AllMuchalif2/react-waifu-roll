const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const resultFile = path.join(__dirname, 'components_colors.md');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

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

const files = getAllFiles(componentsDir);
const colors = new Set();

const regex = /(?:hover:|focus:|active:|group-hover:)?(?:bg|text|border|ring|shadow|fill|stroke)-[a-zA-Z0-9\[\]\#\-]+/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    colors.add(match[0]);
  }
});

const sortedColors = Array.from(colors).sort();

const categorized = {
  Backgrounds: sortedColors.filter(c => c.includes('bg-') && !c.includes('hover:') && !c.includes('active:')),
  Text: sortedColors.filter(c => c.includes('text-') && !c.includes('hover:') && !c.includes('active:')),
  Borders: sortedColors.filter(c => c.includes('border-') && !c.includes('hover:') && !c.includes('active:')),
  Hovers: sortedColors.filter(c => c.includes('hover:')),
  Others: sortedColors.filter(c => !c.includes('bg-') && !c.includes('text-') && !c.includes('border-') && !c.includes('hover:'))
};

let md = '# Daftar Warna Komponen (src/components)\n\n';
for (const [cat, list] of Object.entries(categorized)) {
  if (list.length > 0) {
    md += `## ${cat}\n`;
    list.forEach(c => {
      md += `- \`${c}\`\n`;
    });
    md += '\n';
  }
}

fs.writeFileSync(resultFile, md);
console.log('Done!');
