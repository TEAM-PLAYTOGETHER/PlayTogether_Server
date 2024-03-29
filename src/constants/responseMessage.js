module.exports = {
  NULL_VALUE: '필요한 값이 없습니다',
  OUT_OF_VALUE: '파라미터 값이 잘못되었습니다',
  NO_SORT_VALUE: '정렬 조건이 없습니다.',
  NO_AUTHENTICATED: '접근 권한이 없습니다',
  DB_ERROR: '데이터베이스에서 오류가 발생했습니다',

  // 회원가입
  CREATED_USER: '회원 가입 성공',
  DELETE_USER: '회원 탈퇴 성공',
  ALREADY_ID: '이미 사용중인 아이디입니다.',
  ALREADY_EMAIL: '이미 사용중인 이메일입니다.',
  ALREADY_NICKNAME: '이미 사용중인 닉네임입니다.',
  USEABLE_ID: '중복되는 아이디가 없습니다.',
  USEABLE_NICKNAME: '사용 가능한 닉네임입니다.',
  ALREADY_USER_ID: '이미 사용중인 아이디입니다.',
  AVAILABLE_PASSWORD: '사용 가능한 비밀번호 입니다.',
  NOT_AVAILABLE_PASSWORD: '사용 불가능한 비밀번호 형식입니다.',

  // 로그인
  LOGIN_SUCCESS: '로그인 성공',
  LOGIN_FAIL: '로그인 실패',
  NO_USER: '존재하지 않는 회원입니다.',
  MISS_MATCH_PW: '비밀번호가 맞지 않습니다.',
  LOGIN_RETRY: '재로그인이 필요합니다',

  // 유저
  GET_USER_SUCCESS: '사용자 조회 성공',
  UPDATE_USER_SUCCESS: '사용자 업데이트 성공',
  UPDATE_USER_FAIL: '사용자 업데이트 실패',
  UNUSABLE_NICKNAME: '사용불가능한 닉네임입니다.',
  UPDATE_PROFILE_SUCCESS: '사용자 프로필 업데이트 성공',
  UPDATE_DEVICE_TOKEN_SUCCESS: '사용자 디바이스 토큰 저장 성공',
  BLOCK_USER_SUCCESS: '유저 차단 성공',
  UNBLOCK_USER_SUCCESS: '유저 차단해제 성공',
  GET_BLOCKLIST_SUCCESS: '유저 차단목록 조회 성공',
  CANNOT_BLOCK_SELF: '본인을 차단할 수 없습니다.',
  CANNOT_UNBLOCK_SELF: '본인을 차단해제할 수 없습니다.',
  ALREADY_BLOCK_USER: '이미 차단된 유저입니다.',
  NO_BLOCK_USER: '차단되지 않은 유저입니다.',
  CANNOT_READ_PROFILE: '확인할 수 없는 프로필입니다.',
  NO_REFRESH_TOKEN_USER: '해당 토큰을 소유한 유저가 없습니다',

  // 서버 내 오류
  INTERNAL_SERVER_ERROR: '서버 내 오류',

  // 토큰
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  TOKEN_UNEXPIRED: '토큰이 만료되지 않았습니다.',
  TOKEN_INVALID: '토큰이 유효하지 않습니다.',
  TOKEN_EMPTY: '토큰이 없습니다.',
  CREATED_TOKEN: '새로운 토큰이 발급되었습니다.',

  // 메시지
  MESSAGE_SEND_SUCCESS: '메시지 전송에 성공했습니다.',
  MESSAGE_SEND_FAIL: '메시지 전송에 실패했습니다.',
  NO_MESSAGE: '메시지 내용이 없습니다.',
  NO_ROOM: '채팅방이 없습니다.',
  MESSAGE_READ_SUCCESS: '메시지 불러오기 성공',
  MESSAGE_READ_FAIL: '메시지 불러오기 실패',
  ROOM_SUCCESS: '방 불러오기 성공',
  SELF_CHAT: '자신에게 메시지를 보낼 수 없습니다.',

  // 동아리
  CREW_CREATE_SUCCESS: '동아리 만들기 성공',
  CREW_REGISTER_SUCCESS: '동아리 가입 성공',
  CREW_REGISTER_AVAILABLE: '가입 가능 동아리입니다.',
  CREW_DELETE_SUCCESS: '동아리 삭제 성공',
  CREW_PUT_SUCCESS: '동아리 수정 성공',
  CREW_WITHDRAW_SUCCESS: '동아리 탈퇴 성공',
  NO_CREW: '존재하지 않는 동아리입니다.',
  ALREADY_REGISTERED: '이미 가입한 동아리입니다.',
  READ_REGISTER_INFO_SUCCESS: '동아리 가입정보 가져오기 성공',
  NO_MASTER_USER: '동아리장이 아닙니다.',
  LIMIT_EXCEED: '갯수 제한을 초과했습니다.',
  NO_CREW_USER: '해당 동아리원이 아닙니다.',
  ADMIN_CANNOT_WITHDRAW: '동아리장은 탈퇴할 수 없습니다.',

  // 번개
  LIGHT_ADD_SUCCESS: '번개 생성이 완료되었습니다.',
  LIGHT_PUT_SUCCESS: '번개 수정이 완료되었습니다.',
  LIGHT_ENTER_SUCCESS: '번개 참여가 완료되었습니다.',
  LIGHT_CANCEL_SUCCESS: '번개 참여 취소가 완료되었습니다.',
  LIGHT_DELETE_SUCCESS: '번개 삭제가 완료되었습니다.',
  LIGHT_GET_ORGANIZER_SUCCESS: '내가 만든 번개 리스트 조회 성공',
  LIGHT_GET_ENTER_SUCCESS: '내가 참여한 번개 리스트 조회 성공',
  LIGHT_GET_SCRAP_SUCCESS: '내가 찜한 번개 리스트 조회 성공',
  LIGHT_GET_CATEGORY_SUCCESS: '카테고리별 번개 리스트 조회 성공',
  LIGHT_GET_DETAIL_SUCCESS: '번개 상세 조회 성공',
  LIGHT_GET_NEW_SUCCESS: 'New 번개 조회 성공',
  LIGHT_GET_HOT_SUCCESS: 'Hot 번개 조회 성공',
  LIGHT_GET_SEARCH_SUCCESS: 'Search 번개 조회 성공',
  NOT_LIGHT_ORGANIZER: '번개 소유자가 아닙니다.',
  EXIST_LIGHT_USER: '해당 번개에 참여중 입니다.',
  EXIST_NOT_LIGHT_USER: '해당 번개에 참여중이 아닙니다.',
  NO_CATEGORY: '카테고리를 확인해주세요',
  NO_LIGHT: '없는 번개입니다.',
  NO_LIGHT_MEMBER: '번개에 참여한 사람이 아닙니다.',
  NO_TWO_SEARCH_QUERY: '두글자 이상 입력해주세요.',
  NO_REPORT: '신고할 내용이 없습니다.',
  REPORT_LIGHT: '신고되었습니다.',
  BLOCK_LIGHT: '번개는 닫혀있습니다.',
  OPEN_LIGHT: '번개는 열려있습니다.',

  // 스크랩
  SCRAP_SUCCESS: '찜하기가 완료되었습니다.',
  SCRAP_DELETE_SUCCESS: '찜하기가 취소되었습니다.',
  NO_SCRAP: '스크랩 한적이 없습니다.',
  EXIST_SCRAP_LIGHT: '해당 번개를 찜하는 중입니다.',
  EXIST_NOT_SCRAP_LIGHT: '해당 번개를 찜하는 중이 아닙니다.',

  //번개 테스트 시 주의사항
  ERROR_LIGHT: '해당 번개 생성자이신데 번개를 나가셨군요! 다시 테스트 해주세요!',
};
