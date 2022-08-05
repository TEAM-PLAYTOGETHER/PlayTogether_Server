const nicknameVerify = (nickname) => {
  if (nickname.length > 20 || nickname.length < 5) {
    return true;
  }

  const regex = /[^a-z0-9]/;
  return regex.test(nickname);
};

module.exports = {
  nicknameVerify,
};
