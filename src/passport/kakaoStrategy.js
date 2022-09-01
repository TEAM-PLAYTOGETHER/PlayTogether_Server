const passport = require('passport');
const { authService } = require('../service');
const KakaoStrategy = require('passport-kakao').Strategy;

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_API_KEY,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/kakao/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existUser = await authService.isSnsUser(profile.id, 'kakao');
          console.log(accessToken);

          if (existUser.data) {
            return done(null, existUser.data);
          } else {
            const newUser = await authService.createSnsUser(profile.id, profile._json.kakao_account.email, 'kakao', profile.displayName, profile._json.properties.profile_image);
            return done(null, newUser.data);
          }
        } catch (error) {
          console.log('googleStrategy에서 error 발생: ' + error);
        }
      },
    ),
  );
};
