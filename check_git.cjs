const fs = require('fs');
const path = require('path');
const gitFiles = fs.readFileSync('git_files.txt', 'utf16le').split(/\r?\n/).map(f => f.trim()).filter(Boolean);
const gitFilesSet = new Set(gitFiles.map(f => f.replace(/\\/g, '/')));

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
let errors = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  const importRegex2 = /import\s+['"](.*?)['"]/g;
  
  const checkMatch = (match) => {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(file).split(path.sep).join('/');
      let resolvedPath = path.posix.join(dir, importPath);
      if (resolvedPath.startsWith('./')) resolvedPath = resolvedPath.substring(2);
      
      const parsed = path.posix.parse(resolvedPath);
      let exts = [];
      if (parsed.ext) {
         exts = [''];
      } else {
         exts = ['.js', '.jsx', '.css', '.module.css', '/index.js', '/index.jsx'];
      }
      
      let foundInGit = false;
      for (const ext of exts) {
        if (gitFilesSet.has(resolvedPath + ext)) {
           foundInGit = true;
           break;
        }
      }
      if (!foundInGit) {
         errors.push(`Missing in Git or Case mismatch: ${importPath} in file: ${file} (resolved to: ${resolvedPath})`);
      }
    }
  };

  let match;
  while ((match = importRegex.exec(content)) !== null) checkMatch(match);
  while ((match = importRegex2.exec(content)) !== null) checkMatch(match);
});

fs.writeFileSync('errors.json', JSON.stringify(errors, null, 2));
