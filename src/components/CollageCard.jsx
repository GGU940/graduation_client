import React, { useEffect, useRef } from "react";
import style from "../css/TotalPage.module.css";

const CollageCard = ({ collage }) => {
    const canvasRef = useRef(null);

    const previewWidth = 450;
    const previewHeight = 800;

    const originalWidth = 2160;
    const originalHeight = 3840;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, previewWidth, previewHeight);

        const scaleX = previewWidth / originalWidth;
        const scaleY = previewHeight / originalHeight;

        collage.cutouts.forEach((cut) => {
            const img = new Image();
            img.src = cut.imgSrc;

            img.onload = () => {
                ctx.drawImage(
                    img,
                    cut.sx, cut.sy,           // 잘라낼 위치와 크기 (원본 기준)
                    cut.size, cut.size,
                    cut.dx * scaleX,          // 그릴 위치 (축소된 canvas 기준)
                    cut.dy * scaleY,
                    cut.size * scaleX,        // 그릴 크기 (축소된 canvas 기준)
                    cut.size * scaleY
                );
            };
        });
    }, [collage]);

    return (
        <li className={style.card}>
            <p>{collage.userName}</p>
            <p>{collage.title}</p>
            <canvas ref={canvasRef} width={previewWidth} height={previewHeight} />
        </li>
    );
};

export default CollageCard;
