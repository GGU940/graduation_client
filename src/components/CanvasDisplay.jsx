
import React, { useRef, useEffect, useState } from 'react';
import { API_BASE } from '../store/ref';
import useUIStore from '../store/uiStore';
import '../css/common.css'
// 이미지 파일 경로 리스트
const imagePaths = [
    '/images/test001.png',
    '/images/test002.png',
    '/images/test003.png',
    // '/images/building001.jpg',
    // '/images/building002.jpg',
    // '/images/building003.jpg',
    // '/images/building004.jpg',
];


const CanvasDisplay = () => {
    const cursorSize = useUIStore((state) => state.cursorSize);

    const canvasRef = useRef(null); // canvas DOM 참조용
    const [userName, setUserName] = useState([]);
    const [images, setImages] = useState([]); // 로드된 이미지 객체 배열
    const [currentIndex, setCurrentIndex] = useState(0); // 현재 보이는 이미지 인덱스

    const [cutouts, setCutouts] = useState({
        front: [],
        back: [],
        left: [],
        right: []
    }); // 잘라낸 이미지 조각들 저장

    const [currentPlane, setCurrentPlane] = useState('front');// 현재 면

    const [isDragging, setIsDragging] = useState(false);
    const lastPosRef = useRef({ x: null, y: null });



    //이미지 객체 로딩 : 이미지 미리 로딩. 렌더 전 준비용
    useEffect(() => {
        console.log("***Start****")

        setUserName(localStorage.getItem("userName"));

        const loaded = imagePaths.map((src) => {
            const img = new Image(); //JavaScript에서 DOM 없이도 이미지 객체를 생성할 수 있는 내장 클래스
            img.src = src;//브라우저는 즉시 비동기로 이미지 로딩을 시작. (캐싱됨)
            return img;
        })
        setImages(loaded);//loaded는 Image 객체들의 배열
        console.log('로드된 배열:', loaded);
    }, []);


    // 5초마다 이미지 인덱스 currentIndex 자동 순환
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

            console.log("🎨 draw 실행!!!!")

            // 6. 캔버스 전체를 지워서 이전 그림 제거
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // 7. 현재 이미지 객체를 캔버스에 전체 크기로 그리기
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            /// 이전에 클릭해 저장한 이미지 조각들 그리기
            cutouts[currentPlane].forEach((c) => {
                ctx.drawImage(c.img, c.sx, c.sy, c.size, c.size, c.dx, c.dy, c.size, c.size);
                //drawImage(그리고자 하는 이미지 객체, 원본 이미지에서 잘라낼 시작 x좌표, y좌표, 원본 이미지에서 잘라낼 너비, 높이, 캔버스에서 그릴 위치의 x좌표, y좌표, 캔버스에서 그려질 너비, 높이)
            });
        }

        if (img.complete) {  // 배경 이미지가 이미 로드되어 있으면 
            draw();//즉시 실행
        } else {
            img.onload = draw; // 아직 로딩 중이면 onload로 대기
            img.onerror = () => console.error("이미지 로딩 실패:", img.src);
        }
    }, [images, currentIndex, cutouts, currentPlane])


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



    //저장 핸들러
    const handleSaveCutouts = async () => {
        if (cutouts.length === 0) {
            alert("저장할 cutouts 없음");
            return;
        } else {
            console.log("***cutpout들:::", cutouts)
        }


        const processedCutouts = Object.fromEntries(
            Object.entries(cutouts).map(([plane, pieces]) => [
                plane,
                pieces.map(({ img, ...rest }) => rest)
            ])
        );


        //전송할 데이터 만들기 (img객체 제거)
        const payload = {
            userName: userName,
            timestamp: new Date().toISOString(),
            cutouts: processedCutouts // img만 제거한 나머지를 저장
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
            console.log("✅ res.json 저장 성공:", data);
            alert("✅ res.json 저장 성공")

            //초기화
            localStorage.clear();
            window.location.href = "/";

        } catch (err) {
            console.error("❌ 저장 실패:", err);
            alert("저장 중 오류가 발생했습니다.");
        }
    };



    return (
        <div>
            <h1 style={{ fontSize: 50 }}>{userName}</h1>
            <canvas
                ref={canvasRef}
                width={2160}
                height={3840}
                style={{ /*cursor: 'none',*/ display: 'block', border: '10px solid blue' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
            <button
                onClick={handleSaveCutouts}
                className="btn"
            >저장</button>
        </div >

    );
}

export default CanvasDisplay