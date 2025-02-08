const fs = require('fs');
const path = require('path');

// Base schema content
const baseSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

// Function to read directory contents
const readDirContents = (dir) => {
  const files = fs.readdirSync(dir);
  let content = '';
  
  files.forEach(file => {
    if (file.endsWith('.prisma')) {
      const filePath = path.join(dir, file);
      content += fs.readFileSync(filePath, 'utf8') + '\n\n';
    }
  });
  
  return content;
};

// Combine all schema files
const enumsContent = readDirContents('./enums');
const modelsContent = readDirContents('./models');

// Write the combined schema
const combinedSchema = baseSchema + enumsContent + modelsContent;
fs.writeFileSync('./schema.prisma', combinedSchema);

console.log('Schema files combined successfully!');