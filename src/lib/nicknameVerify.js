const nicknameVerify = (nickname) => {
  if (nickname.length > 10 || nickname.length < 2) {
    return true;
  }

  const regex = /[^가-힣a-zA-Z0-9_]/;
  return regex.test(nickname);
};

module.exports = {
  nicknameVerify,
};
