const passport = require('passport');
const { authService } = require('../service');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/google/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const existUser = await authService.isSnsUser(profile.id, 'google');

          if (existUser.data) {
            done(null, existUser.data);
          } else {
            const newUser = await authService.createSnsUser(profile.id, profile.email, 'google', profile.displayName, profile.picture);
            done(null, newUser.data);
          }
        } catch (error) {
          console.log('googleStrategy에서 error 발생: ' + error);
        }
      },
    ),
  );
};
