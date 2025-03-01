export const validateEmail = (email) => {
    const emailPattern = /^[^\s@]{6,55}@yash\.com$/;
    return emailPattern.test(email);
  };
  
  export const validatePassword = (password) => {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*,?&_ -])[A-Za-z\d@$!%*,?&_ -]{8,}$/;
    return passwordPattern.test(password);
  };
  