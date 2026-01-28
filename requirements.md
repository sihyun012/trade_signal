ver1	로그인 페이지	진입로직	로그인 화면 노출	[진입] 진입 시 JWT/세션 체크 후 미인증 시 로그인 화면 강제 노출. 인증 시 홈페이지 이동. [예외] 토큰 만료/변조 시 토큰 폐기 후 로그인 이동. "로그인을 먼저 진행해 주세요." [이벤트] auth_check, auth_invalid	P0
ver1	로그인 페이지	로그인	구글 로그인	[기능] OAuth 2.0 연동. 최초 로그인 시 신규 계정 생성 및 인증 전환. user 테이블 업데이트(user_id, password, email) [예외] 인증 취소/실패 시 에러 안내 및 재시도 제공. "로그인이 취소되었습니다. 다시 진행해 주세요." [이벤트] google_login_click, google_oauth_success, google_oauth_fail	P0
ver1	로그인 페이지	회원가입	이메일 가입	[기능] 이메일+PW 가입. 형식 검증 수행. 성공 시 인증 전환 및 온보딩 이동. user 테이블 업데이트(user_id, password, email) [예외] 형식 오류/필수값 누락 시 인라인 에러 노출. "이메일 또는 비밀번호 형식을 확인해 주세요." [이벤트] signup_submit, signup_success, signup_fail	P0
ver1	로그인 페이지	보안정책	PW 암호화	[보안] bcrypt/argon2 단방향 해시 처리. 평문 저장 금지. [예외] 해시 실패 시 가입 실패 처리 및 서버 에러 로그 기록. "일시적인 오류입니다. 고객 센터로 문의해 주세요." [이벤트] password_hash_success, password_hash_fail	P0
ver1	로그인 페이지	가입정책	중복 체크	[검증] 이메일 유니크 키 사용. 소셜/일반 중복 확인 및 차단 안내. [예외] 경합 발생 시 DB 유니크 제약으로 1건 생성 보장. "이미 가입된 이메일입니다. 로그인을 먼저 진행해 주세요." [이벤트] email_dup_check, email_dup_found	P0
ver1	로그인 페이지	가입정책	약관 동의	[필수] 이용약관/개인정보 처리방침 동의 필수. 동의 시각 및 버전 저장. [예외] 링크 로드 실패 시 재시도 안내. "가입을 위해 필수 약관 동의가 먼저 필요합니다." [이벤트] Term_view, terms_agree_submit, terms_agree_success	P0
ver1	로그인 페이지	세션관리	JWT 발급	[관리] 자체 JWT 발급 및 클라이언트 저장(exp 포함). [예외] 저장 실패 시 안내 및 재로그인 유도. "인증 정보를 저장하지 못했습니다. 다시 로그인해 주세요." [이벤트] jwt_issued, jwt_store_success, jwt_store_fail	P0
ver1	로그인 페이지	접근제어	Auth Guard	[차단] 인증 필요 페이지 접근 시 토큰 검사. 미유효 시 차단 및 로그인 리다이렉트. [예외] 무한 리다이렉트 방지용 return_to TTL 설정. "로그인이 필요한 서비스입니다." [이벤트] auth_guard_blocked, auth_guard_redirect	P0
ver1	로그인 페이지	초기설정	자동 이동	[시퀀스] 가입 직후 자동 이동. 완료 전 홈페이지 진입 제어 또는 스킵 제공. [예외] 저장 실패 시 재시도 안내. "정보를 불러오지 못했습니다. 다시 로그인해 주세요." [이벤트] onboarding_start, onboarding_complete, onboarding_fail	P1
ver1	로그인 페이지	가입정책	계정 연결/안내	[안내] 동일 이메일 존재 시 가입 차단 및 기존 계정 로그인 안내. [로직] 구글 로그인 시 기존 계정 존재 시 연결 여부 선택 혹은 차단 안내. "이미 구글 계정으로 가입되어 있습니다. 구글로 로그인을 진행해 주세요." [이벤트] account_exists_alert_view, account_link_prompt_view	P1

ver1	홈페이지	데이터 수집/가공	의원 목록 로드	[기본] 최근 10개년 의원의 종합 수익률 데이터 분석 후 내림차순 정렬. 매일 00:00 스냅샷 가공 데이터 사용. [예외] 데이터 로드 실패 시 '정보를 불러오지 못했습니다. 다시 시도해 주세요.' [이벤트] list_view, list_load_fail	P0
ver1	홈페이지	데이터 수집/가공	무한 스크롤	[로직] 커서 기반 페이징 처리 및 추가 데이터 분석/매핑. [예외] 네트워크 단절 시 '연결이 불안정합니다. 하단 버튼을 눌러 다시 불러오세요.' [이벤트] list_load_more, list_retry_click	P0
ver1	홈페이지	데이터 수집/가공	주식 종목 목록 로드	[기본] 종목 보기 탭 진입 시 종목 리스트 화면 노출, 상단에 실시간 반영 여부 및 마지막 반영 시각 표시,현재가, 일일 변동, 의원의 거래 건수, 최근 거래, 팔로우 토글, 검색창, 정렬 방식 토글	P0
ver1	홈페이지	정렬/필터/검색	조회 분기	[로직] 이름/투자액/거래일 기준 데이터 재분석 및 필터링. (해당 부분은 UI에서 드롭다운 메뉴로 보여줌) [예외] 결과 0건 시 '찾으시는 결과가 없습니다. 조건을 변경해 보세요.' [이벤트] sort_changed, filter_changed, search_submitted	P0
ver1	홈페이지	팔로우	팔로우 토글	[로직] 유저-의원 매핑 데이터 실시간 처리. 팝업으로 팔로우 시 원하는 정보 알림 선택적으로 선택 가능 (팝업 메뉴) [예외] 한도 초과 시 '멤버십 업그레이드가 필요합니다.', 통신 실패 시 롤백 및 '잠시 후 다시 시도해 주세요.' [이벤트] follow_toggle, follow_limit_hit	P0
ver1	홈페이지	신뢰/근거	의원 정보	[로직] 10년치 거래 이력 기반 평균 보유일 및 수익률 지표 가공. [예외] 특정 필드 누락 시 '정보 업데이트 중' 표기 및 클릭 비활성화. [이벤트] politician_card_view, data_missing_log	P0
ver1	홈페이지	오류/상태	대응 로직	[UI] 초기 로딩 시 스켈레톤 적용. [예외] 연속 API 실패 시 '로그인을 다시 하거나 고객 센터로 문의해 주세요.' (서킷 브레이커). [이벤트] skeleton_view, api_error_critical	P1
ver1	홈페이지	데이터 수집/가공	데이터 스냅샷	[로직] 매일 00:00 전날 종가 기준 10년 누적 수익률 배치 분석 및 저장. [예외] 배치 작업 중단 시 직전 snapshot 유지 및 관리자 알림. [처리] 기준 시각 데이터 응답에 포함.	P0
ver1	홈페이지	데이터 수집/가공 	종목 목록 로드	[기본] 최근 3개년 종목의 거래 빈도 높은 순으로 내림차는 정렬.  매일 00:00 스냅샷 가공 데이터 사용. [예외] 데이터 로드 실패 시 '정보를 불러오지 못했습니다. 다시 시도해 주세요.' [이벤트] list_view, list_load_fail	P0

ver1	의원 클릭	의원 프로필	프로필 로드	[진입] /politician/{id} 이동. 요약 정보 + 수익 그래프 + 매매 리스트 섹션 포함.[예외] ID 유효하지 않을 시 진입 차단 및 오류 안내. 로드 실패 시 재시도 및 홈 이동 CTA 제공.[이벤트] view_politician_profile, politician_profile_load_fail	P0
ver1	의원 클릭	의원 프로필	프로필 요약 정보	[요약] 의원 상세 화면 상단에 핵심 요약 정보 카드 노출 / 요약 정보에는 의원명, 소속(상·하원 및 지역구), 활동 상태, 순자산(현재 기준), 의정 활동 기간 중 자산 변동 금액 및 변동률, 전체 매매 건수, 전체 거래 규모, 평균 보유 기간(일 단위), 최근 매매일, 승률, 평균 거래 금액, 거래당 평균 수익, 시장 지수 대비 성과 포함 / 모든 수치는 공시 데이터를 기반으로 산출되며 실시간 정보는 아님 / 일부 항목에 데이터가 없을 경우 해당 항목은 "정보 없음"으로 표기하고 카드 자체는 유지	P1
ver1	의원 클릭	수익 그래프	의원 vs S&P500	[비교] 의원 vs S&P500 10년 수익률 비교. 거래일 기준/공시일 기준 성과 구분 시각화(탭/토글).[데이터] 일 1회(00:00) 스냅샷 갱신. 일부 데이터 누락 시 가용 구간만 표기 후 안내.[이벤트] view_compare_chart, compare_chart_load_fail	P0
ver1	의원 클릭	매매 내역	매매 리스트	[구성] 거래일, 공시일, 티커, 매매유형, 금액구간, 출처 링크 포함. 공시일 최신순 정렬.[로직] 무한스크롤 또는 페이지네이션 적용. 내역 0건 시 Empty 상태 노출.[이벤트] view_trade_list, trade_list_load_more, click_trade_row	P0
ver1	의원 클릭	신뢰/근거	원문 출처 노출	[근거] 모든 데이터에 SEC/STOCK Act 공시 원문 URL 및 데이터 수집 타임스탬프 명시. source_id 매핑.[예외] 출처 부재 시 "출처 미확인" 문구 및 배지 없이 노출.[이벤트] view_source_stamp	P0
ver1	의원 클릭	매매 내역 상세	오류 처리 및 복귀	[이동] 행 클릭 시 /trade/{id} 이동. 오류 시 이전 화면 복귀 CTA 제공.[UX] 'X' 버튼 및 뒤로가기 시 리스트 섹션 복귀. 스택 없을 시 프로필 섹션으로 강제 이동.[이벤트] trade_detail_view, trade_detail_load_fail, trade_detail_back_clicked	P0

ver1	매매 내역 클릭	주식 그래프	그래프 로드/성과	[그래프] 종목의 가격 추이 매매일부터 현재가까지 그래프 표현, 가격 $표현, 데이터 지연/누락 가능성 안내, 주식의 그래프는 실시간 [예외] 데이터 지연 시 기준 시각 노출.[이벤트] view_stock_chart, chart_load_success, chart_load_fail	P0
ver1	매매 내역 클릭	주식 그래프	매매/공시 마커	[시각화] 그래프 내 '거래일'과 '공시일'을 구분된 마커로 표시.[예외] 마커 데이터 누락 시 해당 마커만 숨김 처리.[이벤트] view_trade_marker, click_trade_marker	P0
ver1	매매 내역 클릭	요약카드	요약/근거 정보	[정보] 공시 PDF 링크 제공. 지연 일수(Lag = 공시일 - 거래일) 계산 및 표시. 의원명, 단가/수량, 매매유형,소유자, 매매일, 업로드일,공시일,의원명, 정당, 지역[예외] 추정 단가는 거래일의 매물대분석, 거래량 기반 추정 또는 '미제공' 중 선택 적용.[이벤트] view_source_stamp	P0
ver1	매매 내역 클릭	매매 히스토리	종목별 거래 내역	[목록] 해당 의원의 동일 종목 매매 히스토리 제공. 공시일 최신순 정렬, 종목이름 , 공시일, 매매일, 공시일과 매매일 차이,매매유형, 거래규모,추정단가,예상 수익률  [예외] 히스토리 0건 시 Empty 상태 노출.[이벤트] view_stock_trade_history, click_stock_trade_history_row	P0
ver1	매매 내역 클릭	오류/상태	로딩/오류 처리	[UI] 로딩 시 원형 모양의 로딩 화면 제공 [예외] 네트워크 오류 시 재시도 버튼 노출.[이벤트] empty_state_view, api_error, retry_clicked	P0

ver1	알림/소비	메일 알림	구독 토글	[설정] 알림 ON/OFF(기본 ON). OFF 시 큐 적재 전 필터링.[예외] 기적재된 건은 발송될 수 있음을 UI 안내.[이벤트] email_subscribe, email_unsubscribe (source=inapp)	P0
ver1	알림/소비	메일 알림	발송 트리거/대상	[트리거] 신규 trade_id 적재 시(정정 제외). 구독자 대상 (user, trade) 중복 방지.[예외] 미등록/형식오류/Bounce 상태 시 제외 및 상태 기록.[이벤트] alert_sent, alert_delivery_fail, alert_skipped	P0
ver1	알림/소비	메일 알림	메일 템플릿/필드	[구성] 제목: "{의원명} 신규 매매: {티커}". 본문: 의원, 티커, 거래일/공시일, 시각, 출처 URL.[예외] 데이터 누락 시 "정보 없음" 표기 및 출처 링크 가변 노출.[이벤트] email_render_fail	P1
ver1	알림/소비	메일 알림	발송 정책/재시도	[정책] 실패 시 10분 간격 최대 3회 재시도. 10분 내 동일 의원·티커 묶음 발송.[예외] 1시간 내 과다 발송(Rate Limit) 시 제한(이월/드랍).[이벤트] alert_sent (policy=bundled), alert_rate_limited	P1
ver1	알림/소비	메일 알림	클릭 리다이렉트/로그인	[이동] 추적 URL(/r/alert) 사용. 세션 체크 후 상세(/trade/{tid}) 이동. 미인증 시 로그인 후 return_to 리다이렉트.[예외] return_to 만료/실패 시 홈 이동 및 안내.[이벤트] alert_clicked, open_from_alert, open_from_alert_fail	P0

ver1	재방문/확장	뉴스레터	구독 설정	[기능] 뉴스레터 구독 ON/OFF 및 수신 이메일 관리. 이메일 형식 검증 및 개인정보 동의 필수.[예외] 미인증 계정 시 이메일 입력 강제. 저장 실패 시 재시도 CTA 제공.[이벤트] newsletter_subscribe, newsletter_unsubscribe, newsletter_settings_save_fail	P1
ver1	재방문	뉴스레터	주 1회 발송	[발송] 매주 토요일 10:00(KST) 자동 발송. 수신자 단위 성공/실패 로그 적재.[예외] 분산 락을 통한 중복 발송 방지. (recipient, week_id) 기준 중복 제거 보장.[이벤트] newsletter_job_start, newsletter_sent, newsletter_fail (reason_code 포함)	P1
ver1	재방문	뉴스레터	메일 콘텐츠/해지	[구성] 팔로우 의원/주식/경제 이슈 요약 본문. 팔로우 부재 시 '주목 의원 TOP 3' 대체.[링크] 토큰 기반 원클릭 해지 링크 포함. 토큰 만료/변조 시 인앱 설정 이동 안내.[이벤트] newsletter_content_render_fail, newsletter_unsubscribe (source=email)	P1
ver1	알림/소비	뉴스레터	뉴스레터 템플릿/필드	[구성] 제목: "[Trade Signal] 주간 요약 ({YYYY.MM.DD}~{YYYY.MM.DD})" \n본문(섹션): ① 헤더(기간) ② 핵심 요약 카드 3줄(Top 섹터/Top 의원/Top 이슈) ③ 팔로우 의원 소식(최대 3명): {의원명, 당/주, 요약 1줄, 링크} ④ 관련 종목/티커(최대 5개): {티커, 종목명, 주간 변동(옵션), 요약 1줄, 링크} ⑤ 경제 이슈(최대 3개): {제목, 카테고리, 요약 1줄, 출처URL} ⑥ 섹터 자금 흐름(Top 유입/유출 각 3): {섹터명, 지표값(옵션), 요약 1줄} ⑦ 푸터: {웹에서 보기 URL, 구독 해지 URL(토큰), 면책문구} \n**[필드]** period_start, period_end, member_id, email, topics(sectorFlow/followedPoliticians/macroIssues), followed_politician_list, top_tickers, macro_news_list, sector_flow_list, web_view_url, unsubscribe_url \n**[예외]** 1) 팔로우 의원 0명 → "팔로우한 의원이 없어요" 카드 + 팔로우 설정 링크 노출, 대신 "주목 의원 TOP3" 대체 섹션(옵션) 2) 섹터/종목/이슈 데이터 일부 누락 → 해당 필드는 "정보 없음" 표기 3) 링크(출처URL) 누락 → 링크 버튼 숨김(가변 노출) 4) period 계산 실패 → 제목에 날짜 없이 "[Trade Signal] 주간 요약"으로 폴백 \n**[이벤트]** newsletter_render_fail (템플릿 렌더 실패), newsletter_content_missing(필수 섹션 데이터 50% 이상 누락 시)	P1
ver1	알림/소비	뉴스레터	뉴스레터 템플릿/필드	"[구성 - 팔로우 여부 분기] 팔로우 여부에 따라 뉴스레터 본문을 분기 구성한다.
- 팔로우 1명 이상: 팔로우 의원 관련 경제 이슈(최대3) + 관련 종목(최대5) + 관련 섹터 자금 흐름(유입/유출 각3) + 팔로우 의원 소식(최대3) 제공.
-팔로우 0명: 주요 의원(주목 의원 TOP3) + 인기 경제 이슈(최대3) + 전체 섹터 자금 흐름(유입/유출 각3) 제공. 토큰 기반 원클릭 해지 링크 포함, 토큰 만료/변조 시 인앱 설정 이동 안내.
이벤트: newsletter_content_render_fail, newsletter_unsubscribe(source=email)"
ver1	재방문/확장	유료 전환	페이월/트래킹	"[전환] 제한 기능 클릭 시 페이월 노출. 무료 vs 유료 혜택 비교 및 플랜 선택 CTA, 하단에 구독해지 기능 [로직] 구독자에게는 미노출. 페이월 로드 실패 시 재시도 및 기본 안내 문구 제공. 구독 테이블 업데이트(user_id, subscription_check,
subscription_active,subscription_expired)
 [이벤트] paywall_view, click_unlock_range, click_paywall (source, feature 정보 포함)"	P0
ver1	재방문/확장	유료 전환	결제 정보 입력/주문요약	[기능] 결제 단계(플랜선택→결제정보→완료) 중 '결제정보' 화면 제공. 카드번호/유효기간/MMYY/CVV/카드소유자명/청구이메일/국가·지역 입력. 우측에 주문요약(플랜, 결제주기, 원가, 할인, 총 결제금액) 실시간 표시.[검증] 필수값 누락/형식 오류 시 결제 버튼 비활성 또는 에러 표기.[동의] 서비스 이용약관/개인정보 처리방침 동의(필수), 자동갱신 동의(필수) 체크 없으면 결제 진행 불가.[예외] 네트워크 오류/결제창 닫힘/중복 클릭 시 재시도 CTA 및 버튼 disable 처리.[이벤트] checkout_view, checkout_input_error(field), checkout_submit, checkout_submit_fail(reason_code)
ver1	재방문/확장	유료 전환	결제 처리(구독 생성)	[로직] 결제하기 클릭 시 결제 요청 생성→결제 승인/실패 결과를 서버가 확정 저장. 요청은 idempotency_key(예: member_id+order_id)로 중복 결제 방지. 로딩 과정 포함[예외] 타임아웃/5xx 발생 시 결제 상태 UNKNOWN 처리 후 '결제 결과 확인 중' 안내 및 재조회/재시도 제공.[로그] 주문/결제 로그에 order_id, member_id, plan_id, amount, discount, status, provider_tx_id, fail_reason 저장.[이벤트] payment_start, payment_success, payment_fail(reason_code)
ver1	재방문/확장	유료 전환	결제 성공 화면	[화면] 결제 성공 시 '결제가 완료되었습니다!' 화면 노출. 결제정보(주문번호, 플랜, 결제금액, 결제수단 일부마스킹, 다음 결제일) 표시. 이용가능 프리미엄 기능 리스트(예: 무제한 팔로우/실시간 알림/주간 뉴스레터/전기간 그래프/리포트) 노출.[CTA] '프리미엄 기능 사용하기'(메인/대시보드 이동), '영수증 보기' 제공.[이벤트] payment_success_view, click_use_premium, click_receipt_view
ver1	재방문/확장	유료 전환	결제 실패 화면	[화면] 결제 실패 시 '결제를 완료하지 못했습니다' 화면 노출. 오류내용(사유 문구) + 주요 원인 리스트(한도초과/정보오류/일시적 네트워크 등) + 도움말 영역 제공.[CTA] '다시 시도하기', '다른 결제 수단 사용', '플랜 선택으로 돌아가기' 제공.[예외] 실패 사유 미수신 시 기본 문구 "일시적인 오류로 결제에 실패했어요. 잠시 후 다시 시도해 주세요." 노출.[이벤트] payment_fail_view, click_retry_payment, click_change_method, click_back_to_plan
ver1	재방문/확장	유료 전환	유료 버전 구독 관리/해지	[기능] '구독 관리' 화면에서 현재 플랜(연간/월간), 결제금액, 다음 결제일, 구독 시작일, 결제수단(마스킹), 결제 내역(최근 결제 1건+영수증 보기) 조회 제공. 프리미엄 기능 리스트 표시.[CTA] '다른 플랜 보기', '영수증 보기', '구독 해지' 제공.[예외] 결제/구독 정보 조회 실패 시 재시도 CTA 및 기본 안내 문구 제공.[이벤트] subscription_manage_view, click_view_plans, click_receipt_view, subscription_info_load_fail




ver1	온보딩	진입로직	온보딩 가드	[진입] 최초 로그인(onboarding_status=NOT_STARTED) 시 온보딩 페이지로 강제 리다이렉트. 완료 전에는 타 페이지 접근 차단.[예외] 상태 조회 실패 시 재시도 안내 및 로그아웃 버튼 제공.[이벤트] onboarding_gate_check, onboarding_gate_blocked
ver1	온보딩	진행관리	단계 구성	[구성] Step 1: 관심 의원 팔로우(1명 필수) → Step 2: 관심 종목 담기(선택/다중). 상단에 진행률(1/2, 2/2) 표시.[로직] Step 1 완료 전 Step 2 진입 불가. 새로고침 시 진행 중이던 단계 유지.[이벤트] onboarding_start, onboarding_step_view
ver1	온보딩	Step 1	의원 팔로우	[데이터] 수익률 내림차순 후보 리스트 제공. 이름, 정당, 상·하원, 10년 수익률 정보 노출.[제약] 반드시 1명의 의원을 팔로우해야 다음 단계 이동 가능. 선택 시 기존 선택 해제 후 교체.[예외] 데이터 로드 또는 저장 실패 시 재시도 안내.[이벤트] onboarding_politician_list_view, onboarding_follow_select
ver1	온보딩	Step 2	종목 검색	[검색] 상단 검색창에서 티커(Ticker) 또는 종목명 검색 지원.[검증] 중복 티커 추가 시 인라인 에러 노출 ("이미 추가된 종목입니다").[예외] 검색 결과가 없을 경우 '직접 입력해서 추가' 옵션 제공.[이벤트] onboarding_ticker_search_submit, onboarding_ticker_add
ver1	온보딩	Step 2	종목 리스트 선택	[UI] 이미지 방식의 리스트 제공: 티커 아이콘, 기업명, 섹터, 최근 거래 의원 정보(예: Nancy Pelosi 외 N명), 현재가, 일일 변동률, 거래 건수, 최근 거래일.[기능] 리스트 우측의 '담기(북마크)' 버튼 클릭 시 관심 종목으로 즉시 추가.[상태] 담기 완료 시 버튼 활성화 상태(색상 채움)로 변경.[이벤트] onboarding_stock_list_view, onboarding_ticker_select
