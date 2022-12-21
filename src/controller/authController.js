const axios = require('axios');
const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const util = require('../lib/util');
const jwt_decode = require('jwt-decode');
const jwt = require('jsonwebtoken');
const { jwksClient, JwksClient } = require('jwks-rsa');
const { authService } = require('../service');

const googleLogin = async (req, res, next) => {
  const accessToken = req.headers.accesstoken;
  const fcmToken = req.headers.fcmtoken;

  if (!accessToken || !fcmToken) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  try {
    const profile = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
    });

    const snsLogin = await authService.snsLogin(profile.data.id, profile.data.email, 'google', profile.data.name, profile.data.picture);
    if (!snsLogin) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.LOGIN_FAIL));
    }

    await authService.updateFcmToken(profile.data.id, fcmToken);

    return res.status(snsLogin.status).json(snsLogin);
  } catch (error) {
    return next(new Error('AuthController googleLogin error 발생: \n' + error));
  }
};

const kakaoLogin = async (req, res, next) => {
  const accessToken = req.headers.accesstoken;
  const fcmToken = req.headers.fcmtoken;

  if (!accessToken || !fcmToken) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  try {
    const profile = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
    });

    const snsLogin = await authService.snsLogin(profile.data.id, profile.data.kakao_account.email, 'kakao', profile.data.properties.nickname, profile.data.properties.profile_image);
    if (!snsLogin) {
      return res.status(statusCode.UNAUTHORIZED).json(util.fail(statusCode.UNAUTHORIZED, responseMessage.LOGIN_FAIL));
    }

    await authService.updateFcmToken(profile.data.id, fcmToken);

    return res.status(snsLogin.status).json(snsLogin);
  } catch (error) {
    return next(new Error('AuthController kakaoLogin error 발생: \n' + error));
  }
};

const appleLogin = async (req, res, next) => {
  const accessToken = req.headers.accesstoken;
  const fcmToken = req.headers.fcmtoken;

  if (!accessToken || !fcmToken) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  try {
    const decodedToken = jwt.decode(accessToken, { complete: true });
    const keyIdFromToken = decodedToken.header.kid;
    // apple 공개 키
    const applePublicKeyUrl = 'https://appleid.apple.com/auth/keys';

    const jwksClient = new JwksClient({ jwksUri: applePublicKeyUrl });

    const key = await jwksClient.getSigningKey(keyIdFromToken);
    const publicKey = key.getPublicKey();

    const verifiedDecodedToken = jwt.verify(accessToken, publicKey, {
      algorithms: [decodedToken.header.alg],
    });

    const username = verifiedDecodedToken.email.split('@');
    const snsLogin = await authService.createSnsUser(verifiedDecodedToken.sub, verifiedDecodedToken.email, 'apple', username, null);

    return res.status(statusCode.OK).json(verifiedDecodedToken);
  } catch (error) {
    return next(new Error('AuthController appleLogin error 발생: \n' + error));
  }
};

const refresh = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;
    const refreshToken = req.headers.refresh;

    const refresh = await authService.refresh(authToken, refreshToken);

    return res.status(refresh.status).json(refresh);
  } catch (error) {
    return next(new Error('AuthController refresh error 발생: \n' + error));
  }
};

const withDraw = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const withDraw = await authService.withDraw(userId);

    return res.status(withDraw.status).json(withDraw);
  } catch (error) {
    return next(new Error('AuthController withDraw error 발생: \n' + error));
  }
};

module.exports = {
  kakaoLogin,
  googleLogin,
  appleLogin,
  refresh,
  withDraw,
};
