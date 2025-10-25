import { useEffect, useRef, useState } from "react";



const FaceCheckerLive = ({
    /** props: **/

    onApproach, //'가까움' 조건을 만족했을 때 실행할 함수
    onLeave, // 감지되던 얼굴이 화면에서 사라졌을 때 실행할 함수

    // width, height: 내부 처리용 비디오 해상도 (낮을수록 가볍고 빠름)
    width = 60,
    height = 80,

    // approachThreshold: '얼굴 박스의 화면 가로비율' 임계값 (0~1). 클수록 더 가까워야 트리거
    approachThreshold = 0.08, //얼굴이 화면 너비/높이의 8% 이상을 차지하면 '가까움'으로 판단하겠다는 의미

    // smoothSamples: 최근 N프레임 평균으로 노이즈/흔들림 완화
    //// 값이 크면 더 부드럽지만 반응이 약간 느려짐
    smoothSamples = 3,

    // minStreak: N 프레임 '연속'으로 얼굴이 감지되어야 안정된 것으로 판단. 순간적인 오탐지를 방지
    minStreak = 3,
    isFace,
    setIsFace,
}) => {

    const videoRef = useRef(null);      // <video> DOM 참조 (브라우저 카메라(웹캠)에서 들어오는 영상을 <video>에 꽂아둬야 함. 화면에 안 보여도 '입력 소스'로 쓰임) 
    const streamRef = useRef(null);     // getUserMedia로 받은 MediaStream(실시간 영상/음성 데이터) 저장 (정리용). 왜 필요? 컴포넌트가 사라질 때 카메라를 반드시 꺼야 함

    const calledRef = useRef(false);    // 콜백(onApproach) 한 번만 호출하도록 잠금. true가 되면, 얼굴이 계속 가까이 있어도 onApproach가 중복 실행 ㄴㄴ
    const bufferRef = useRef([]);       // 최근 박스너비 값들 저장(평균 내서 흔들림 완화)

    const faceStreakRef = useRef(0); // "연속"으로 얼굴이 감지된 프레임 수를 셉니다. (minStreak와 비교용)
    const facePresentRef = useRef(false); // "현재 얼굴이 보이는 중인지" 상태를 저장하는 플래그입니다. 이 값의 '변화 시점'(false -> true 또는 true -> false)을 감지하기 위해 사용됩니다.

    const initedRef = useRef(false);//// 컴포넌트가 초기화되었는지 확인


    // 모듈 지문 (실제로 이 파일이 로드되는지 확인용)
    // console.log('[FaceChecker MODULE] LOADED');

    onApproach = () => {
        console.log("🍎🍎🍎🍎🍎🍎얼굴인식완_startPage");
        setIsFace(true);

    }
    onLeave = () => {
        console.log("💙💙💙💙💙💙💙얼굴 사라짐_startPage ");
        setIsFace(false);

    }

    useEffect(() => {

        if (initedRef.current) return;   // 중복 초기화 방지
        initedRef.current = true; //// 초기화 시작을 알림


        // 전역 객체(window)에 MediaPipe 스크립트가 로드되었는지 방어 코드
        if (!window.FaceDetection || !window.Camera) {
            console.error("MediaPipe scripts not loaded. Check index.html script tags.");
            return;// MediaPipe 없이는 실행 불가능하므로 중단
        }


        /** 1. MediaPipe FaceDetection 인스턴스 생성 */
        const faceDetection = new window.FaceDetection({
            // locateFile: MediaPipe가 필요로 하는 AI 모델 파일(.wasm 등)을 어디서 가져올지 알려줍니다.
            // 여기서는 CDN(콘텐츠 전송 네트워크) 주소를 사용하므로, 
            // 별도 파일을 프로젝트에 포함하지 않아도 됩니다.
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        });


        /** 2. FaceDetection 감지 옵션 설정 */
        faceDetection.setOptions({
            model: "short",
            //"short": 가까운 얼굴(전시처럼 모니터 앞에 서는 상황)에 최적화. 빠르고 가벼움.
            // "full": 더 넓은 거리/화각(최대 5m). 대신 리소스 조금 더 듦.

            minDetectionConfidence: 0.5, //감지 신뢰도 임계값 (0~1)
            //0.5는 "얼굴이라고 50% 이상 확신할 때만" 결과에 포함시키라는 의미
            // 낮으면 민감해지지만 오류가 많아지고, 높으면 깐깐해지지만 감지를 놓칠 수
        });





        /**
         * 3. 감지 결과 콜백 (가장 중요)
         * MediaPipe가 매 프레임 분석을 끝낼 때마다 이 함수(onResults)가 호출됩니다.
         * 'results' 객체에 감지 결과가 담겨 옵니다.
         */
        let lastTime = 0;
        // 목표 FPS 설정: 10 FPS (1000ms / 10 = 100ms)
        // 이 값을 늘리면 (예: 1000 / 5) 더 뚝뚝 끊깁니다.
        const targetInterval = 1000 / 2;

        faceDetection.onResults((results) => {

            /* 얼굴이 하나라도 감지되었는지 확인 */
            // results.detections: 감지된 모든 얼굴의 정보 배열.
            // 이 배열이 존재하고, 배열의 길이가 0보다 크면 '얼굴이 있다'고 봅니다.
            const hasFace = results?.detections && results.detections.length > 0;


            // ✅ "얼굴 상태의 변화"를 감지하여 로깅 및 onLeave 호출
            // [방금 얼굴이 나타났을 때]
            if (hasFace && !facePresentRef.current) {
                facePresentRef.current = true;
                console.log("✅ 얼굴 인식됨");
                onApproach();
            }
            // [방금 얼굴이 사라졌을 때]
            if (!hasFace && facePresentRef.current) {
                facePresentRef.current = false;
                console.log("❌ 얼굴 사라짐");


                // 얼굴이 사라졌으므로 onLeave prop으로 받은 함수를 실행
                if (typeof onLeave === "function") {
                    onLeave();
                }
            }


            // 연속 감지 프레임 수(streak)를 계산
            if (hasFace) faceStreakRef.current++; // 얼굴 있으면 1 증가
            else faceStreakRef.current = 0; // 얼굴 없으면 0으로 리셋


            // 얼굴이 완전히 사라지면, 다음 관람객을 위해 재무장
            if (!hasFace) {
                calledRef.current = false;   // ← // ← '1회 호출 잠금'을 해제. 재트리거 준비
                return;                      // 숫자 계산은 얼굴 있을 때만 하므로 여기서 종료
            }



            // --- 얼굴이 감지되었을 때만 아래 로직 실행 ---

            // 첫 번째 감지된 얼굴의 바운딩 박스(얼굴 영역 사각형) 정보를 가져옵니다.
            // (좌표는 0~1 사이의 상대값입니다)
            const box = results.detections[0].locationData?.relativeBoundingBox;
            if (!box) return; // 박스 정보가 없으면 계산 중지


            // 얼굴의 '근접도'를 계산합니다.
            // 얼굴 박스의 너비(w)와 높이(h) 중 더 큰 값을 사용합니다.
            // (카메라 왜곡이나 얼굴 각도에 따른 변동을 줄여줍니다)
            const w = Number.isFinite(Number(box.width)) ? Number(box.width) : 0;
            const h = Number.isFinite(Number(box.height)) ? Number(box.height) : 0;
            const dim = Math.max(0, Math.min(1, Math.max(w, h)));// 0~1 사이 값으로 고정


            // 'smoothSamples' 만큼의 최근 N개 샘플로 '평활화(Smoothing)' 작업을 합니다.
            // (얼굴이 미세하게 떨리거나 값이 튀는 것을 방지합니다)       
            const buf = bufferRef.current; // 최근 w 값들을 쌓아둠
            buf.push(dim); // 현재 프레임의 '근접도(dim)' 값을 버퍼에 추가

            if (buf.length > smoothSamples) buf.shift(); // 버퍼가 N개보다 길어지면 가장 오래된 값 제거

            // 버퍼에 쌓인 값들의 '평균'을 냅니다.
            const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
            if (!Number.isFinite(avg)) return;// 평균 계산이 실패하면(예: buf가 비어있음) 중지



            // 이미 콜백을 실행했다면 더 이상 처리하지 않음(한 번만 트리거)
            if (calledRef.current) return;


            // [조건 1] 연속 4프레임 이상 감지되고 (안정적)
            // [조건 2] 평균 근접도(avg)가 설정한 임계값(approachThreshold)보다 크면 (가까움)
            if (faceStreakRef.current >= 4 && avg >= approachThreshold) {
                calledRef.current = true;
                onApproach && onApproach();// onApproach 실행
            }
        });



        /** 4. 카메라 초기화 및 시작 */
        // MediaPipe가 제공하는 Camera 유틸리티를 사용합니다.
        // 이 유틸은 웹캠에서 프레임을 가져와서 
        // 지정된 콜백(onFrame)을 계속 호출해주는 루프를 만듭니다.
        const camera = new window.Camera(videoRef.current, {
            // onFrame: 카메라에서 새 프레임이 들어올 때마다 호출될 함수
            onFrame: async () => {
                // 현재 비디오 프레임(<video> 태그의 현재 이미지)을
                // faceDetection 인스턴스(MediaPipe 엔진)로 전송(send)합니다.
                // 이 'send'가 완료되면, 위에서 정의한 'onResults' 콜백이 트리거됩니다.
                const now = performance.now(); // 현재 시간


                // targetInterval 시간이 지나지 않았으면 AI 분석 요청을 건너뜜
                if (now - lastTime > targetInterval) {
                    lastTime = now; // 시간 업데이트

                    // AI 분석 요청 (onResults 트리거)
                    await faceDetection.send({ image: videoRef.current });
                }
            },
            width,// props로 받은 해상도
            height,
        });

        // 카메라를 시작하는 비동기 함수
        const startCamera = async () => {
            try {
                // getUserMedia로 브라우저 카메라 접근 (권한 허용 필요)
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width, height },
                    audio: false,
                });

                // 나중에 카메라를 끄기 위해 stream 정보를 ref에 저장
                streamRef.current = stream;

                // <video> 요소의 'srcObject'에 받아온 stream을 연결합니다.
                // (이 순간부터 보이지 않는 <video>가 웹캠 영상을 재생하기 시작합니다)
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                camera.start(); // 루프 시작
            } catch (err) {
                // 사용자가 카메라 권한을 거부했거나, 카메라가 없는 경우
                console.error("getUserMedia error:", err);
            }
        };

        startCamera();



        /** 5. 컴포넌트 정리 (Cleanup) 함수 */
        return () => {
            try {
                // 카메라 루프 정지
                camera && camera.stop && camera.stop();
            } catch (_) { }// 이미 정지된 경우 등 오류 무시
            // 미디어 스트림 정지 (카메라 LED 꺼짐)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }

        };
    }, [onApproach, width, height, approachThreshold, smoothSamples, minStreak]);





    return (



        <div
            style={{
                width: `${isFace ? ' 70%' : '0%'}`, height: `${isFace ? ' 80%' : '0%'}`, overflow: 'hidden'
                // border: '2px solid green'
            }}
        >
            <h1 style={{ display: 'none' }}>FaceChecker</h1>
            <video
                ref={videoRef}
                style={{ width: ' 100%', height: '100%', filter: 'grayscale(100%)', transform: 'scale(1.5)', }}
                autoPlay
                muted
                playsInline
                controls={false}
            />
        </div >


    )
}

export default FaceCheckerLive 
