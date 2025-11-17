import React, { useEffect, useMemo } from 'react';
import potpack from 'potpack'; // 2D 패킹 라이브러리
import style from '../css/NewPlayPage.module.css';

// useMemo: **"값"을 기억(캐싱)**하기 위해 사용합니다. (렌더링) 과정 자체에 필요한 "값"**을 재사용하여 요리 속도를 올립니다.
// 렌더링 중에 실행
// 주요 용도 : 무거운 계산 결과 캐싱,객체/배열의 참조 고정

// useEffect: "행동"을 실행하기 위해 사용합니다. (Side Effect 처리)
// 렌더링 후에 (그리고 DOM이 브라우저에 그려진 후에) 실행
// 주요 용도 : API 호출 (Data Fetching),DOM 직접 조작




const UserCanvas = ({ columns, GAP }) => {

    const HALF_GAP = GAP / 2; // 👈 5px (중앙 정렬용 오프셋)

    const { imagesToRender, columnBorders } = useMemo(() => {  // useMemo: images prop이 바뀔 때만 2D 패킹을 다시 계산
        if (columns.length === 0) {
            return { imagesToRender: [], columnBorders: [] };
        }

        const allImages = [];
        const allColumnBorders = []; // 렌더링할 모든 테두리 배열
        let currentXOffset = 0; // 👈 0에서 시작하는 X좌표 추적기

        for (const [index, column] of columns.entries()) {

            // 1. potpack 형식 {w, h, ...}로 변환
            const boxes = column.images.map((img) => ({
                w: Number(img.width) + GAP,
                h: Number(img.height) + GAP,
                ...img, // id, webpackSrc 등 원본 데이터 보존
            }));

            potpack(boxes); // potpack이 '가짜' 크기 기준으로 x, y 계산

            for (const box of boxes) {
                allImages.push({
                    ...box,
                    // 3. 렌더링 좌표 계산 (가운데 정렬)
                    // (potpack x/y) + (칼럼위치) + (갭의 절반)
                    finalX: currentXOffset + box.x + HALF_GAP,
                    finalY: box.y + HALF_GAP,
                    // 4. 렌더링 크기는 "진짜" 크기 사용
                    renderWidth: box.width,  // 👈 'w'가 아님!
                    renderHeight: box.height, // 👈 'h'가 아님!
                });
            }
            // 4. 렌더링할 테두리 정보 생성
            allColumnBorders.push({
                key: `col-border-${index}`,
                x: currentXOffset,
                width: column.width, // state에 저장된 칼럼 너비
            });

            // 5. [핵심] 다음 칼럼을 위해 X좌표 추적기를 "현재 칼럼의 너비"만큼 이동
            currentXOffset += column.width;
        }

        return { imagesToRender: allImages, columnBorders: allColumnBorders };

    }, [columns, GAP]); //배열이 바뀔 때마다 실행


    useEffect(() => {
        console.log('###########', columns);

    }, [columns])
    return (
        <div className={style.userCanvas}>
            {/* 2. 👇 [추가] 칼럼 테두리(Border) 렌더링 */}
            {columnBorders.map((border) => (
                <div
                    key={border.key}
                    style={{
                        // 캔버스(userCanvas) 기준으로 절대 위치
                        position: 'absolute',
                        top: 0,
                        left: `${border.x}px`, // 👈 실시간 계산된 X좌표
                        width: `${border.width}px`, // 👈 실시간 계산된 너비
                        height: '100%',
                        // border: '1px solid rgba(255, 0, 0, 0.5)', // (빨간색)
                        backgroundColor: 'grey', // (빨간색)
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                        transition: 'width 0.3s',
                    }}
                />
            ))}



            {
                imagesToRender.map((img) => (
                    <img
                        key={img.id}
                        src={img.webpackSrc}
                        alt="packed"
                        style={{
                            position: 'absolute',
                            top: `${img.finalY}px`,  // 👈 갭 적용된 Y
                            left: `${img.finalX}px`, // 👈 갭 적용된 X
                            width: `${img.renderWidth}px`,  // 👈 '진짜' 너비
                            height: `${img.renderHeight}px`, // 👈 '진짜' 높이
                            transition: 'left 0.3s, top 0.3s',
                        }}
                    />
                ))
            }

        </div>
    )
}

export default UserCanvas