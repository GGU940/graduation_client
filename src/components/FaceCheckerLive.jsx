import { useEffect, useRef } from "react";


const FaceCheckerLive = ({
    /** props: **/

    // onApproach: 가까움 조건을 만족했을 때 실행할 함수 (예: 페이지 이동)
    onApproach,
    onLeave, // ✅ 추가
    // width, height: 내부 처리용 비디오 해상도 (낮을수록 가벼움)
    width = 640,
    height = 480,

    // approachThreshold: '얼굴 박스의 화면 가로비율' 임계값 (0~1). 클수록 더 가까워야 트리거
    // 대략 얼굴이 화면 너비의 42% 이상 차지하면 '가까움'
    approachThreshold = 0.08,

    // smoothSamples: 최근 N프레임 평균으로 노이즈 완화
    smoothSamples = 3,

    // 연속 감지 프레임
    minStreak = 3,
}) => {

    const videoRef = useRef(null);      // <video> DOM 참조 (브라우저 카메라(웹캠)에서 들어오는 영상을 <video>에 꽂아둬야 함. 화면에 안 보여도 '입력 소스'로 쓰임) 
    const streamRef = useRef(null);     // getUserMedia로 받은 MediaStream(실시간 영상/음성 데이터) 저장 (정리용). 왜 필요? 컴포넌트가 사라질 때 카메라를 반드시 꺼야 함

    const calledRef = useRef(false);    // 콜백(onApproach) 한 번만 호출하도록 잠금
    const bufferRef = useRef([]);       // 최근 박스너비 값들 저장(평균 내서 흔들림 완화)
    // const noFaceTimerRef = useRef(null);    // ✅ “현재 얼굴이 보이는 중인지” 상태 플래그 (변화 시점에만 콘솔 찍기 위함)
    const faceStreakRef = useRef(0);
    const facePresentRef = useRef(false);

    const initedRef = useRef(false);


    // 모듈 지문 (실제로 이 파일이 로드되는지 확인용)
    console.log('[FaceChecker MODULE] /src/components/FaceCheckerLive.jsx LOADED');



    useEffect(() => {
        if (initedRef.current) return;   // ✅ 중복 초기화 방지
        initedRef.current = true;

        console.log('FaceDetection typeof:', typeof window.FaceDetection); // function 이면 정상
        console.log('Camera typeof:', typeof window.Camera); // function 이면 정상


        // 전역 객체가 로드되었는지 방어
        if (!window.FaceDetection || !window.Camera) {
            console.error("MediaPipe scripts not loaded. Check index.html script tags.");
            return;
        }


        /** FaceDetection 인스턴스 생성 + 리소스 경로 */
        const faceDetection = new window.FaceDetection({ //FaceDetection: MediaPipe의 얼굴 감지 파이프라인.
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
            //locateFile: 모델/wasm 파일을 어디서 가져올지 알려줌.여기선 CDN을 쓰므로 따로 파일을 프로젝트에 넣지 않아도 됨.
        });

        /**  감지 옵션 */
        faceDetection.setOptions({
            model: "short",
            //"short": 가까운 얼굴(전시처럼 모니터 앞에 서는 상황)에 최적화. 빠르고 가벼움.
            // "full": 더 넓은 거리/화각. 대신 리소스 조금 더 듦.
            minDetectionConfidence: 0.5,
            //0~1. 값이 낮으면 민감, 높으면 깐깐.
            // 보통 0.5~0.7 사이에서 조절.
        });

        /**감지 결과 콜백: onResults - 감지 결과가 들어올 때마다 호출되는 핸들러 */

        faceDetection.onResults((results) => {
            ////////
            // console.log('---------[FC] onResults tick');


            /* 얼굴이 하나라도 감지되었는지 확인*/
            //   const hasFace = !!(results?.detections && results.detections.length > 0);
            const hasFace = results?.detections && results.detections.length > 0;
            //results.detections: 감지된 얼굴들의 배열.



            // ✅ 변화 시점 로깅
            if (hasFace && !facePresentRef.current) {
                facePresentRef.current = true;
                console.log("✅ 얼굴 인식됨");
            }
            if (!hasFace && facePresentRef.current) {
                facePresentRef.current = false;
                console.log("❌ 얼굴 사라짐");

                // 여기서 onLeave 호출
                if (typeof onLeave === "function") {
                    onLeave();
                }
            }

            // ✅ 테스트: 얼굴 보이는 즉시 한 번만 호출 (minStreak/avg 무시)
            if (hasFace && !calledRef.current) {
                calledRef.current = true;
                console.log('!!!!!!!!', '[FC] FORCED onApproach on first hasFace');
                onApproach?.();
            }


            // 연속 감지 카운트
            if (hasFace) faceStreakRef.current++;
            else faceStreakRef.current = 0;

            // 얼굴이 완전히 사라지면 다음 관람객을 위해 재무장
            if (!hasFace) {
                calledRef.current = false;   // ← 재트리거 준비
                return;                      // 숫자 계산은 얼굴 있을 때만
            }

            // // ✅ 얼굴 없으면: 버퍼 완화 + 리로드 타이머 (5초)
            // if (!hasFace) {
            //     if (bufferRef.current.length > 0) bufferRef.current.pop();
            //     console.log("🔆 곧 새로고침");
            //     if (!noFaceTimerRef.current) {
            //         noFaceTimerRef.current = setTimeout(() => {
            //             window.location.reload();
            //         }, 5000);
            //     }
            //     // 👇 여기서 reset
            //     calledRef.current = false;
            //     return;
            // }

            // // ✅ 얼굴 다시 보이면: 리로드 타이머 해제
            // if (noFaceTimerRef.current) {
            //     clearTimeout(noFaceTimerRef.current);
            //     noFaceTimerRef.current = null;
            // }



            // 첫 번째 얼굴의 bounding box (상대좌표: 0~1 범위)
            const box = results.detections[0].locationData?.relativeBoundingBox;
            if (!box) return;


            // 폭/높이 중 큰 쪽으로 근접성 평가 (카메라/화각별 안정화)
            const w = Number.isFinite(Number(box.width)) ? Number(box.width) : 0;
            const h = Number.isFinite(Number(box.height)) ? Number(box.height) : 0;
            const dim = Math.max(0, Math.min(1, Math.max(w, h)));


            // 최근 N개 샘플로 평활화 (갑작스런 변동/미세 흔들림 완화)
            const buf = bufferRef.current; // 최근 w 값들을 쌓아둠
            buf.push(dim);

            if (buf.length > smoothSamples) buf.shift();// 오래된 값 제거

            const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
            if (!Number.isFinite(avg)) return;


            // ✅ 디버그: 실제 숫자 확인
            console.log('[FC] dim=', dim.toFixed(3), 'avg=', avg.toFixed(3), 'thr=', approachThreshold, 'streak=', faceStreakRef.current);



            // // 충분히 안정적으로 들어왔고 임계값 통과 → onApproach (한 번)
            // if (!calledRef.current && faceStreakRef.current >= minStreak && avg >= approachThreshold) {
            //     calledRef.current = true;
            //     console.log("[FaceCheckerLive] onApproach fired");
            //     onApproach && onApproach();
            // }

            // 이미 콜백을 실행했다면 더 이상 처리하지 않음(한 번만 트리거)
            if (calledRef.current) return;

            // ✅ 1) 배선 확인: 임계값 무시하고 연속 N프레임 감지되면 "강제" onApproach
            if (faceStreakRef.current >= 4) { // 필요하면 3~5로 조정
                calledRef.current = true;
                console.log('✅ 1) 배선 확인:', '[FC] FORCED onApproach (bypass threshold)');
                onApproach && onApproach();
                return;
            }

            // ✅ 2) 원래 로직 (숫자 정상화 후 실사용)
            if (faceStreakRef.current >= 4 && avg >= approachThreshold) {
                calledRef.current = true;
                console.log('✅ 2) 원래 로직', '[FC] onApproach fired (avg>=thr)');
                onApproach && onApproach();
            }
        });

        /** 카메라 초기화 및 시작 */
        // MediaPipe Camera 유틸: 프레임마다 onFrame 콜백 호출
        const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
                // 현재 비디오 프레임을 FaceDetection으로 전달 (비동기)
                await faceDetection.send({ image: videoRef.current });
            },
            width,
            height,
        });

        const startCamera = async () => {
            try {
                // getUserMedia로 브라우저 카메라 접근 (권한 허용 필요)
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width, height },
                    audio: false,
                });
                streamRef.current = stream;

                // <video>에 스트림 연결
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                camera.start(); // 루프 시작
            } catch (err) {
                console.error("getUserMedia error:", err);
            }
        };

        startCamera();


        return () => {
            try {
                // 카메라 루프 정지
                camera && camera.stop && camera.stop();
            } catch (_) { }
            // 미디어 스트림 정지 (카메라 LED 꺼짐)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            // // ✅ 타이머 정리
            // if (noFaceTimerRef.current) {
            //     clearTimeout(noFaceTimerRef.current);
            //     noFaceTimerRef.current = null;
            // }
        };
        // }, []);
    }, [onApproach, width, height, approachThreshold, smoothSamples, minStreak]);





    return (
        <>
            <h1 style={{ display: 'none' }}>FaceChecker</h1>
            <video ref={videoRef} style={{ display: "none" }} autoPlay muted playsInline />
        </>
    )
}

export default FaceCheckerLive 