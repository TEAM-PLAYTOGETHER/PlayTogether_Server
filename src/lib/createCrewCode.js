const createCrewCode = () => {
  let code = '';
  // 알파벳 대문자 중에서 선택
  const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // 6개 문자 선택
  for (let i = 0; i < 6; i++) {
    code += charList.charAt(Math.floor(Math.random() * charList.length));
  }

  return code;
};

module.exports = {
  createCrewCode,
};
