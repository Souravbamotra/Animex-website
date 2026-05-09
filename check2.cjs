const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      getFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const allFiles = getFiles('./src');
let hasError = false;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match any import like `import something from './path'` or `import './path'`
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  const importRegex2 = /import\s+['"](.*?)['"]/g;
  
  const checkMatch = (match) => {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(file);
      const resolvedPath = path.resolve(dir, importPath);
      
      const parsed = path.parse(resolvedPath);
      // If it has an extension, check exactly that. Otherwise, check .js, .jsx, etc.
      let exts = [];
      if (parsed.ext) {
         exts = [''];
      } else {
         exts = ['.js', '.jsx', '.css', '.module.css', '/index.js', '/index.jsx'];
      }
      
      let found = false;
      
      for (const ext of exts) {
        if (fs.existsSync(resolvedPath + ext)) {
           const targetDir = path.dirname(resolvedPath + ext);
           const targetFile = path.basename(resolvedPath + ext);
           if (fs.existsSync(targetDir)) {
             const actualFiles = fs.readdirSync(targetDir);
             if (actualFiles.includes(targetFile)) {
               found = true;
               break;
             }
           }
        }
      }
      if (!found) {
         console.error('Case mismatch or missing file:', importPath, 'in file:', file);
         hasError = true;
      }
    }
  };

  let match;
  while ((match = importRegex.exec(content)) !== null) checkMatch(match);
  while ((match = importRegex2.exec(content)) !== null) checkMatch(match);
});
if (!hasError) console.log('All imports are case-correct!');
