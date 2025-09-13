#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎤 Konnektaro Recorder - Development Setup');
console.log('==========================================\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

console.log('✅ Project structure verified');

// Create .env.local if it doesn't exist
const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
  const envContent = `# Development environment variables
# Uncomment and set these for default values in development
# NEXT_PUBLIC_DEFAULT_API_URL=https://your-api.com
# NEXT_PUBLIC_DEFAULT_TOKEN=your-default-token

# Example API endpoint (replace with your actual endpoint)
# NEXT_PUBLIC_DEFAULT_API_URL=http://localhost:5050
# NEXT_PUBLIC_DEFAULT_TOKEN=dev-token-123
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local already exists');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('\n📦 Installing dependencies...');
  console.log('Run: npm install');
} else {
  console.log('✅ Dependencies already installed');
}

console.log('\n🚀 Next steps:');
console.log('1. Run: npm install (if not done already)');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('4. Open: examples/integration-example.html in your browser');
console.log('\n📚 For integration examples, see:');
console.log('   - examples/integration-example.html');
console.log('   - README.md');

console.log('\n✨ Setup complete! Happy coding!');

