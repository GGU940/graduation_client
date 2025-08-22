import * as THREE from 'three';

// 원본 콜라주 작업 캔버스의 크기 (가장 중요!)
const ORIGINAL_CANVAS_SIZE = {
    width: 2160,
    height: 3840,
};

// 이미지 URL을 받아 실제 이미지 객체로 로딩하는 Promise 기반 함수.
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // CORS 보안 정책 문제를 피하기 위해 필요
        img.onload = () => resolve(img); // 로딩 성공 시 이미지 객체 반환
        img.onerror = (err) => reject(err); // 로딩 실패 시 에러 반환
        img.src = src;
    });
};


// 이 함수의 최종 목표: 콜라주 데이터(pieces)를 받아 Three.js 텍스처를 만들어 반환하는 것.
export const createCollageTexture = async (pieces, width = 450, height = 800) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 50% 투명도의 색으로 설정
    ctx.fillStyle = 'rgba(255, 255,255, 0.2)';   // 스케치북 기본색. (이미지가 없는 빈 공간을 위함)
    ctx.fillRect(0, 0, width, height);

    // 원본 캔버스(2160x3840)와 이 스케치북(450x800)의 크기 비율을 계산
    const scaleX = width / ORIGINAL_CANVAS_SIZE.width;   // 450 / 2160
    const scaleY = height / ORIGINAL_CANVAS_SIZE.height; // 800 / 3840

    // 콜라주 조각들에 사용된 모든 이미지 URL을 중복 없이 추출합니다.
    const imageSources = [...new Set(pieces.map(p => p.imgSrc))];

    // 모든 이미지가 로딩될 때까지 기다립니다.
    const loadedImages = await Promise.all(
        imageSources.map(src => loadImage(src).catch(e => null))
    );

    // URL을 키로, 로드된 이미지 객체를 값으로 하는 맵을 만들어 쉽게 이미지를 찾을 수 있게 합니다.

    const imageMap = Object.fromEntries(
        imageSources.map((src, i) => [src, loadedImages[i]])
    );

    // 모든 콜라주 조각을 순회하며 스케치북에 그림을 그립니다.
    pieces.forEach(piece => {
        const img = imageMap[piece.imgSrc];
        if (img) {
            // ✅ 2. 그릴 위치(dx, dy)와 크기(size)에 축소 비율을 곱해줍니다.
            ctx.drawImage(
                img,
                piece.sx, piece.sy, piece.size, piece.size, // 원본에서 잘라오는 부분은 그대로
                piece.dx * scaleX,        // 작은 캔버스에 그릴 위치 X (축소됨)
                piece.dy * scaleY,        // 작은 캔버스에 그릴 위치 Y (축소됨)
                piece.size * scaleX,      // 작은 캔버스에 그릴 너비 (축소됨)
                piece.size * scaleY       // 작은 캔버스에 그릴 높이 (축소됨)
            );
        }
    });
    // 최종적으로 완성된 스케치북(canvas)을 Three.js가 사용할 수 있는 '텍스처' 형태로 변환하여 반환합니다.
    return new THREE.CanvasTexture(canvas);
};