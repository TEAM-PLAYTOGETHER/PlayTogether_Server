module.exports = {
  success: (status, message, data) => {
    return {
      status,
      success: true,
      message,
      data,
    };
  },
  fail: (status, message) => {
    return {
      status,
      success: false,
      message,
    };
  },
  serviceReturn: (status, message, data = null) => {
    return {
      status,
      message,
      data,
    };
  },
};
