import bcrypt from 'bcryptjs';

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Check user role
export const checkUserRole = async (userId, db) => {
  const userDoc = await db.collection('Users').doc(userId).get();
  return userDoc.exists ? userDoc.data().role : null;
};