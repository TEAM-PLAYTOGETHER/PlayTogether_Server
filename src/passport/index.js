const passport = require('passport');
const google = require('./googleStrategy');
const kakao = require('./kakaoStrategy');
const { userService } = require('../service');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.getUserById(id);

      done(null, user);
    } catch (error) {
      console.log('passport.deserializeUser에서 에러 발생: ' + error);
    }
  });

  google();
  kakao();
};
