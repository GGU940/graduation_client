import style from "../css/CanvasCon.module.css";
import CanvasDisplay from "./CanvasDisplay";

import React, { useState } from 'react';
import Login from "./Login";

import useUIStore from '../store/uiStore';

const CanvasCon = () => {
    const cursorSize = useUIStore((state) => state.cursorSize);

    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 }); // 화면 밖으로 초기화

    // 마우스 움직일 때 위치 추적
    const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <>
            <div className={style.CanvasCon}
                onMouseMove={handleMouseMove} // ✅ 여기서 마우스 위치 추적
            >
                <CanvasDisplay />
                {/* ✅ 정사각형 커서 */}
            </div>
            <div
                className={style.customCursor}
                style={{
                    '--cursor-size': `${cursorSize}px`,
                    left: mousePos.x - cursorSize / 2,
                    top: mousePos.y - cursorSize / 2,
                }}
            />
        </>
    )
}

export default CanvasCon