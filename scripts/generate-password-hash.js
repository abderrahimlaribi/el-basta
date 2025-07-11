const bcrypt = require('bcryptjs');

// The password you want to use for admin access
const password = 'ElBasta2024!';

// Generate hash
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  // Convert to base64 for environment variable
  const base64Hash = Buffer.from(hash).toString('base64');
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Base64 Hash (for env):', base64Hash);
  console.log('\nAdd this to your .env.local file:');
  console.log(`NEXT_PUBLIC_ADMIN_HASHED_PASSWORD_BASE64=${base64Hash}`);
}); 