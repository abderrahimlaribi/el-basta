// hash.js
const bcrypt = require("bcryptjs");

const plainPassword = "dz.elbasta.store.1962"; // 🔒 Replace this with your actual admin password
const hash = bcrypt.hashSync(plainPassword, 10);

console.log("Hashed password:", hash);
