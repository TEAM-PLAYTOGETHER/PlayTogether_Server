const nicknameVerify = (nickname) => {
  const regex = /[^a-zA-z0-9]/;

  return regex.test(nickname);
};

module.exports = {
  nicknameVerify,
};
