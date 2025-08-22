import React, { useState, useRef, useEffect } from 'react'
import FaceChecker from '../components/FaceCheckerLive'
import style from '../css/InitialPage.module.css'
import Hello from '../components/Hello'
import { createNoise3D } from 'simplex-noise';

const InitialPage = () => {

    const [init, setInit] = useState(true);

    const canvasRef = useRef(null);
    const noise3D = createNoise3D();

    // InitialPage.jsx 안 useEffect 대체
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // 해상도 세팅 (DPR 대응, 한 번만)
        const dpr = window.devicePixelRatio || 1;
        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // CSS 크기
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';

            // 실제 픽셀 크기
            // canvas.width = w * dpr;
            // canvas.height = h * dpr;
            canvas.width = w;
            canvas.height = h;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 고해상도 대응
        };
        resize();
        window.addEventListener('resize', resize);

        // 파라미터: 잘 보이게 조절
        const scale = 3;   // 숫자 작을수록 무늬 큼 (15~40 추천)
        const speed = 0.0008; // 시간 스케일 (크면 빨리 움직임)
        const alpha = 0;  // 0~255 (100~180 추천)

        // 성능 최적화: 샘플 스텝
        const step = 3; // 1이면 모든 픽셀, 2~3으로 올리면 빨라짐(약간 픽셀리 느낌)

        let rafId;
        const render = (t) => {
            // t는 ms (requestAnimationFrame이 넘겨줌)
            const time = t * speed; // z축에 시간 반영

            const w = Math.floor(canvas.clientWidth);
            const h = Math.floor(canvas.clientHeight);
            const imageData = ctx.createImageData(w, h);
            const px = imageData.data;

            // 샘플 스텝 적용 루프
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    const v = (noise3D(x / scale, y / scale, time) + 1) * 0.5; // 0~1
                    const shade = (v * 255) | 0;
                    // 작은 블록 채우기
                    for (let oy = 0; oy < step; oy++) {
                        const yy = y + oy;
                        if (yy >= h) break;
                        for (let ox = 0; ox < step; ox++) {
                            const xx = x + ox;
                            if (xx >= w) break;
                            const i = (yy * w + xx) * 4;
                            px[i] = shade;
                            px[i + 1] = shade;
                            px[i + 2] = shade;
                            px[i + 3] = alpha; // 불투명도
                        }
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
        };
    }, []);




    return (
        <article className={style.InitialPageCompo}>
            <h1 style={{ display: 'none' }}>StartPage</h1>

            <canvas
                ref={canvasRef}
                className={style.noiseCanvas}
            />


            {/* 얼굴 감지 컴포넌트 */}
            <FaceChecker
                onApproach={() => {
                    console.log("🍎🍎🍎🍎🍎🍎얼굴인식완_startPage");
                    setInit(false);// state 변경
                }}
                onLeave={() => {
                    console.log("💙💙💙💙💙💙💙얼굴 사라짐_startPage ");
                    setInit(true);
                }}
            />

            {/* state에 따라 컴포넌트 표시 */}
            {!(init) &&
                // <p style={{ position: 'relative', zIndex: 2, fontSize: 100, color: '#fff' }}>시작???</p>
                <div className={style.contentBox}>
                    < Hello />

                </div>
            }

        </article>)

}

export default InitialPage