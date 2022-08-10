const passport = require('passport');
const { authService } = require('../service');
const KakaoStrategy = require('passport-kakao').Strategy;

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_API_KEY,
        callbackURL: 'http://localhost:3000/api/auth/kakao/callback',
      },
      async (req, accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try {
          const existUser = await authService.isSnsUser(profile.id, 'kakao');

          if (existUser.data) {
            done(null, existUser.data);
          } else {
            const newUser = await authService.createSnsUser(profile.id, profile._json.kakao_account.email, 'kakao', profile.displayName);
            done(null, newUser.data);
          }
        } catch (error) {
          console.log('googleStrategy에서 error 발생: ' + error);
        }
      },
    ),
  );
};
