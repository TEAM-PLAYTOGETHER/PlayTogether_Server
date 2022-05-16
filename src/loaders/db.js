const { Pool, Query } = require('pg');
const dayjs = require('dayjs');
const dotenv = require('dotenv');

dotenv.config();

// db config 로딩
const dbConfig = require('../config/dbConfig')[process.env.NODE_ENV];

// process.env의 상태에 따라 로깅 여부 결정
let devMode = process.env.NODE_ENV === 'development';
const sqlDebug = true;

// pq 라이브러리의 prototype 중 submit을 재정의 -> 쿼리를 로그에 남김
const submit = Query.prototype.submit;
Query.prototype.submit = function () {
  const text = this.text;
  const values = this.values || [];
  const query = text.replace(/\$([0-9]+)/g, (m, v) => JSON.stringify(values[parseInt(v) - 1]));
  devMode && sqlDebug && console.log(`\n\n[👻 SQL STATEMENT]\n${query}\n_________\n`);
  submit.apply(this, arguments);
};

console.log(`[🔥DB] ${process.env.NODE_ENV}`);

// 커넥션 풀 생성
const pool = new Pool({
  ...dbConfig,
  connectionTimeoutMillis: 60 * 1000,
  idleTimeoutMillis: 60 * 1000,
});

/**
 * connect
 * 커넥션 풀에서 하나의 커넥션을 가져옴
 * @param {*} log - 어디에서 온 요청인지 확인하기 위한 로그 문자열
 */
const connect = async (log) => {
  const now = dayjs();
  const callStack = new Error().stack;
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // 릴리즈 되지 않은 쿼리 체크
  const releaseChecker = setTimeout(() => {
    devMode
      ? console.error('[ERROR] client connection이 15초 동안 릴리즈되지 않았습니다.', { callStack })
      : // : functions.logger.error('[ERROR] client connection이 15초 동안 릴리즈되지 않았습니다.', { callStack });
        '';
    devMode
      ? console.error(`마지막으로 실행된 쿼리문입니다. ${client.lastQuery}`)
      : // : functions.logger.error(`마지막으로 실행된 쿼리문입니다. ${client.lastQuery}`);
        '';
  }, 15 * 1000);

  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(releaseChecker);
    const time = dayjs().diff(now, 'millisecond');
    const message = `[RELEASE] in ${time}ms | ${log}`;

    // devMode일 때는 모든 쿼리 출력
    devMode && console.log(message);

    // production일 경우에는 4초 이상 지속된 슬로우쿼리만 출력
    !devMode && time > 4000 && console.log(message);

    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  return client;
};

module.exports = {
  connect,
};
