/**
 * Validasi email menggunakan regex standar
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validasi password: minimal 6 karakter
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validasi username: minimal 3 karakter, alfanumerik dan underscore saja
 */
export const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9_]{3,15}$/;
  return re.test(username);
};

/**
 * Helper untuk memvalidasi seluruh form object
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  if (rules.email && !validateEmail(data.email)) {
    errors.email = 'Format email tidak valid';
  }
  
  if (rules.password && !validatePassword(data.password)) {
    errors.password = 'Password minimal 6 karakter';
  }
  
  if (rules.username && !validateUsername(data.username)) {
    errors.username = 'Username 3-15 karakter (huruf, angka, _)';
  }
  
  if (rules.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
