
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../store/ref';
import useUIStore from '../store/uiStore';
import '../css/common.css'

// 이미지 파일 경로 리스트
const imagePaths = [
    '/images/artboard1.png',
    '/images/artboard2.png',
    '/images/artboard3.png',
    '/images/artboard4.png',
    '/images/artboard5.png',
    '/images/artboard6.png',
    '/images/artboard7.png',
    '/images/artboard8.png',
    '/images/artboard9.png',
];

// 각 챕터의 이름(면)을 순서대로 정의
const CHAPTER_PLANES = ['front', 'left', 'back', 'right'];
const CHAPTER_DURATION = 10000; // 각 챕터 지속 시간 (10000ms = 10초)


const CanvasDisplay = () => {
    const cursorSize = useUIStore((state) => state.cursorSize);

    const canvasRef = useRef(null); // canvas DOM 참조용
    const [userName, setUserName] = useState([]);
    const [images, setImages] = useState([]); // 로드된 이미지 객체 배열
    const [currentIndex, setCurrentIndex] = useState(0); // 현재 보이는 이미지 인덱스
    const [isDragging, setIsDragging] = useState(false); //마우스를 드래그 중인지 
    const lastPosRef = useRef({ x: null, y: null }); // 드래그 시 마지막 마우스 위치를 저장하기 위한 ref


    const [currentChapter, setCurrentChapter] = useState(1); // 1, 2, 3, 4 챕터
    const [timeLeft, setTimeLeft] = useState(CHAPTER_DURATION / 1000); // 남은 시간 (초 단위)

    const [cutouts, setCutouts] = useState({
        front: [],
        back: [],
        left: [],
        right: []
    }); // 잘라낸 이미지 조각들 저장

    const currentPlane = CHAPTER_PLANES[currentChapter - 1];// 현재 면의 이름을 가져옴




    ////
    // 저장 로직을 별도의 함수로 만들고, useCallback으로 감싸서 최적화합니다.
    // useCallback은 의존성 배열(여기서는 [cutouts, userName])의 값이 바뀔 때만 함수를 새로 만듭니다.
    // 이렇게 하지 않으면, 매 렌더링마다 함수가 새로 생성되어 useEffect 등에서 문제를 일으킬 수 있습니다.
    const handleSaveCutouts = useCallback(async () => {

        // 4개의 면을 모두 확인하여 저장할 데이터가 하나라도 있는지 검사
        const totalCutouts = Object.values(cutouts).flat().length;
        if (totalCutouts === 0) {
            alert("저장할 cutouts 없음. 결과 페이지로 바로 이동");
            window.location.href = "/total";
            return;
        } else {
            console.log("------");
            console.log("챕터 완료! 자동 저장을 시작");
            console.log(cutouts);
            console.log("------");
        }

        // 서버에는 이미지 객체(img)를 보낼 수 없으므로, 각 조각에서 img 속성을 제외한 나머지만 추출
        const processedCutouts = Object.fromEntries(
            Object.entries(cutouts).map(([plane, pieces]) => [
                plane,
                pieces.map(({ img, ...rest }) => rest)
            ])
        );

        // 서버에 보낼 최종 데이터(payload)를 구성 (img객체 제거된)
        const payload = {
            // userName: userName,
            userName: "임시",
            timestamp: new Date().toISOString(),
            cutouts: processedCutouts // img만 제거한 가공된 데이터
        };

        try {
            const res = await fetch(`${API_BASE}/api/saveCutouts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json(); //json화 함
            console.log("✅ res.json 저장 성공 응답:", data);
            alert("✅ res.json 결과물 저장 성공")

            // 저장이 끝나면 사용했던 사용자 이름을 localStorage에서 제거.
            localStorage.removeItem("userName");
            window.location.href = "/total";

        } catch (err) {
            console.error("❌ 저장 실패:", err);
            alert("저장 중 오류가 발생했습니다.");
        }
    }, [cutouts, userName]); // cutouts나 userName이 바뀔 때만 이 함수를 새로 만듦



    //이미지 객체 로딩 : 이미지 미리 로딩. 렌더 전 준비용
    useEffect(() => {
        const storedUserName = localStorage.getItem("userName");
        if (storedUserName) {
            setUserName(storedUserName);
        }

        const loaded = imagePaths.map((src) => {
            const img = new Image(); //JavaScript에서 DOM 없이도 이미지 객체를 생성할 수 있는 내장 클래스
            img.src = src;//브라우저는 즉시 비동기로 이미지 로딩을 시작. (캐싱됨)
            return img;
        })
        setImages(loaded);//loaded는 Image 객체들의 배열
        // console.log('로드된 배열:', loaded);
    }, []);


    // ?초마다 이미지 인덱스 currentIndex 자동 순환
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % imagePaths.length)
            //인덱스를 하나 올리되, imagePaths 배열 길이 나눈 나머지를 취해, 0 ~ 마지막 인덱스까지 반복
        }, 2000);
        return () => clearInterval(interval);
        //컴포넌트가 언마운트되거나 리렌더링될 때 interval 제거
        //setInterval을 사용하면 브라우저 메모리에 타이머가 남아 있기 때문에, 
        //clearInterval로 꼭 제거해야 메모리 누수/중복 실행 방지됨
    }, [])



    // 챕터 자동 전환, 자동 저장 로직
    useEffect(() => {
        // 현재 챕터가 4를 초과했다면 (즉, 5가 되었다면) 모든 과정이 끝난 것이므로,
        // 저장 함수를 호출하고 이 useEffect의 나머지 로직은 실행하지 않습니다.
        if (currentChapter > 4) {
            handleSaveCutouts();
            return;
        }

        // 10초(CHAPTER_DURATION) 후에 다음 챕터로 넘어가도록 타이머를 설정
        const chapterTimer = setTimeout(() => {
            setCurrentChapter(prevChater => prevChater + 1); // 현재 챕터 번호 + 1.
            setTimeLeft(CHAPTER_DURATION / 1000); // 다음 챕터가 시작될 때 남은 시간을 다시 10초로 초기화
        }, CHAPTER_DURATION);


        //화면에 남은 시간을 1초마다 업데이트 하기 위한 인터벌(반복 실행) 설정
        const countdownInterval = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        // 이 useEffect의 '정리(cleanup)' 함수입니다.
        // 컴포넌트가 사라지거나, 의존성 배열([currentChapter, handleSaveCutouts])의 값이 바뀌어
        // useEffect가 다시 실행되기 직전에 호출됩니다.
        // 기존에 설정된 타이머와 인터벌을 제거하여 메모리 누수나 중복 실행을 방지하는 매우 중요한 부분입니다.
        return () => {
            clearTimeout(chapterTimer);
            clearInterval(countdownInterval);
        };
    }, [currentChapter]); // currentChapter가 바뀔 때마다 이 로직을 다시 실행
    // }, [currentChapter, handleSaveCutouts]); // currentChapter가 바뀔 때마다 이 로직을 다시 실행






    // 이미지 & 조각 그리기
    useEffect(() => {
        // 1. canvas DOM 요소 가져오기
        const canvas = canvasRef.current;

        // 2. canvas가 아직 준비되지 않았거나 이미지 배열이 비어 있으면 종료
        if (!canvas || images.length === 0) return;

        // 3. canvas에서 2D 그리기 컨텍스트 가져오기
        const ctx = canvas.getContext('2d');

        // 4. 현재 인덱스에 해당하는 이미지 객체 선택
        const img = images[currentIndex];


        // 5. 이미지가 로드되었을 때 실행할 콜백 함수 정의
        const draw = () => {

            // 이미지가 로딩 실패 상태인지 체크
            if (!img.complete || img.naturalWidth === 0) {
                console.error("❌ 이미지가 손상되었거나 로딩되지 않음:", img.src);
                return;
            }

            // console.log("🎨 draw 실행!!!!")

            // 6. 캔버스 전체를 지워서 이전 그림 제거
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // 7. 현재 이미지 객체를 캔버스에 전체 크기로 그리기
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            /// 이전에 클릭해 저장한 이미지 조각들 그리기
            // currentPlane이 유효하고(예: 'front'), cutouts 객체 안에 해당 키가 존재하면 그 배열을 순회하며 그립니다.
            if (currentPlane && cutouts[currentPlane]) {
                cutouts[currentPlane].forEach((c) => {
                    ctx.drawImage(c.img, c.sx, c.sy, c.size, c.size, c.dx, c.dy, c.size, c.size);
                    //drawImage(그리고자 하는 이미지 객체, 원본 이미지에서 잘라낼 시작 x좌표, y좌표, 원본 이미지에서 잘라낼 너비, 높이, 캔버스에서 그릴 위치의 x좌표, y좌표, 캔버스에서 그려질 너비, 높이)
                });
            }
        }

        if (img.complete) {  // 배경 이미지가 이미 로드되어 있으면 
            draw();//즉시 실행
        } else {
            img.onload = draw; // 아직 로딩 중이면 onload로 대기
            img.onerror = () => console.error("이미지 로딩 실패:", img.src);
        }
    }, [images, currentIndex, cutouts, currentPlane]);


    ///// 마우스 핸들러
    // 마우스 누를 때
    const handleMouseDown = (e) => {
        setIsDragging(true);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        handleCrop(e.clientX, e.clientY); //첫 지점도 저장
    };

    // 마우스 움직일 때
    const handleMouseMove = (e) => {
        if (!isDragging) {
            return;
        }

        // 마지막 저장된 위치를 가져옴 (드래그 도중 이전 위치)
        const { x: lastX, y: lastY } = lastPosRef.current;

        // 현재 마우스 위치에서 마지막 위치까지의 x, y 차이 계산
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        // 두 지점 사이의 실제 거리(피타고라스 정리)를 계산
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 만약 이전 위치에서 cursorSize/2 이상 떨어졌다면 → 새로 저장
        if (distance >= (cursorSize)) {
            // 현재 위치를 새로운 기준점으로 갱신
            lastPosRef.current = { x: e.clientX, y: e.clientY };

            // 현재 위치를 기준으로 crop(잘라내기) 처리 실행
            handleCrop(e.clientX, e.clientY);
        }
    };

    //마우스 떼면 드래그 종료

    const handleMouseUp = () => {
        setIsDragging(false);
        lastPosRef.current = { x: null, y: null };
    };

    const handleCrop = (x, y) => {
        const canvas = canvasRef.current;

        //► canvas의 화면 내 위치,크기 구하기
        const rect = canvas.getBoundingClientRect(); //캔버스 요소의 브라우저 화면 내 위치와 크기를 알려주는 함수

        //► 클릭한 위치를 캔버스 기준으로 보정
        //우리가 마우스로 클릭한 좌표 x,y는 화면 전체 기준 좌표
        const clickX = x - rect.left;
        const clickY = y - rect.top;


        // ► 잘라낼 사각형의 시작점 좌표 (좌상단 기준)
        const cropX = clickX - (cursorSize / 2);
        const cropY = clickY - (cursorSize / 2);


        const currentImg = images[currentIndex];

        console.log("클릭좌표>>>", clickX, clickY);


        //► 잘라낼 정보 저장
        setCutouts((prev) => ({
            ...prev,  // 기존의 front, back, left, right는 그대로 두고
            [currentPlane]: [ // currentPlane 변수의 값만 덮어쓰기
                ...prev[currentPlane], // 해당 면의 기존 조각들을 모두 복사한
                {
                    img: currentImg,// 렌더링용 (Image 객체, 프론트에서만 사용)
                    imgSrc: currentImg.src, //서버 저장용 (문자열)
                    sx: cropX, // 원본 이미지에서 자를 좌표
                    sy: cropY,
                    dx: cropX,// 화면에 붙일 위치 
                    dy: cropY,
                    size: cursorSize, // ✅ 클릭 당시 커서 크기 저장
                }
            ],
        }));
        console.log("사각시작점>>", cropX, cropY);
    };






    return (
        <div>
            <h1 style={{ fontSize: 50 }}>{userName}</h1>
            <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 10, color: 'white', fontSize: '2rem', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
                {currentChapter <= 4 ? (
                    <>
                        <h2>Chapter {currentChapter} / 4: "{currentPlane}" 면 조립 중</h2>
                        <p>남은 시간: {timeLeft}초</p>
                    </>
                ) : (
                    // 챕터가 끝나면 저장 중이라는 메시지를 보여줍니다.
                    <h3>모든 면 완성! 결과물을 저장합니다...</h3>
                )}
            </div>

            <canvas
                ref={canvasRef}
                width={2160}
                height={3840}
                style={{ /*cursor: 'none',*/ display: 'block', /*border: '10px solid blue' */ }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />

        </div >

    );
}

export default CanvasDisplay