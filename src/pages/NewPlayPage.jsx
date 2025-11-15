import React, { useEffect, useState } from 'react';
import style from '../css/NewPlayPage.module.css';

import UserCanvas from '../components/UserCanvas';
import { allImages } from '../store/outputImagesInfo.js';

import potpack from 'potpack';
const GAP = 20; // 👈 10px 여백
const CANVAS_WIDTH = 1800;
const CANVAS_HEIGHT = 800;
// const CANVAS_HEIGHT = 600;

const NewPlayPage = () => {

    const [imgLoadNum, setImgLoadNum] = useState(12);

    const [signboardImages, setSignboardImages] = useState([]); // 12개 (가게)
    const [imageBank, setImageBank] = useState([]); // 나머지 대기 (창고)

    // const [canvasImages, setCanvasImages] = useState([]); // 클릭된 것들 (캔버스)
    const [columns, setColumns] = useState([]); //canvasImages 대신 사용. 각 요소는 { xOffset, width, images } 형태의 객체

    useEffect(() => {
        console.log("~~~~~~~columns 변화~~\n", columns);
    }, [columns])


    useEffect(() => {

        //1. Webpack이../ outputImages 폴더에서 실제 파일들을 찾습니다.
        // 이미지 경로를 실제 require 경로로 변환하는 함수
        const imageContext = require.context(
            // 파일 목록 제공: imageContext.keys()를 호출하면, Webpack이 빌드 시점에 ../outputImages 폴더에서 찾은 모든 이미지 파일의 경로 목록을 배열로 줍니다. (예: ['./img1.jpg', './img2.jpg'])
            // 실제 경로 반환: 이 함수에 목록에 있던 키(경로)를 넣어 실행하면(예: imageContext('./img1.jpg')), Webpack이 최종적으로 변환한 실제 이미지 주소(예: /static/media/img1.a8b4c2.jpg)를 반환해 줍니다.
            '../outputImages', //찾을 위치
            false, //하위폴더 찾기 여부
            /\.(jpe?g)$/i // 가져올 파일 확장자
        );

        // [원본 키 목록 (NFD)] 예: ['./ㄱㅏㅂㅏㅇ.jpg']
        // 이 키(key)들은 imageContext()를 실행할 수 있는 유일한 원본
        const webpackNfdKeys = imageContext.keys();

        //2. 비교를 위해 Webpack 목록을 'NFC' (완성형) 방식으로 변환./ 예: ['./가방.jpg']
        const webpackNfcKeys = webpackNfdKeys.map(key => key.normalize('NFC'));


        //3. 우리가 만든 JS Store 목록(NFC)과 Webpack 목록(NFC)을 비교합니다.
        const processedImages = allImages.map((imageInfo, index) => {
            // allImages (JS Store)에서 가져온 파일명도 NFC로 통일!  예: './가방.jpg'
            const storeNfcPath = `./${imageInfo.src}`.normalize('NFC');

            // 4. [비교] Webpack NFC 목록에 Store의 NFC 경로가 있는지 확인
            if (!webpackNfcKeys.includes(storeNfcPath)) {
                // (이제 이 오류는 거의 발생하지 않아야 합니다)
                console.error(`
                    🚨 데이터 불일치 오류 🚨
                    JS Store 파일: '${storeNfcPath}'
                    이 파일을 Webpack이 찾지 못했습니다! (폴더를 확인하세요)
                `);
                return null;
            }

            // 5. [원본 키 찾기] (가장 중요!)
            // 비교용 NFC 목록에서 현재 이미지의 인덱스를 찾습니다.
            const webpackKeyIndex = webpackNfcKeys.indexOf(storeNfcPath);

            // 그 인덱스를 사용해 "원본 NFD 키 목록"에서
            // imageContext()가 요구하는 "원본 NFD 키"를 꺼냅니다.
            const originalNfdKey = webpackNfdKeys[webpackKeyIndex];

            // 6. [최종 처리]
            // imageContext()는 반드시 "원본 NFD 키"로 호출해야 합니다.
            return {
                id: `${imageInfo.src.slice(0, 5)}-${index}`,
                ...imageInfo, // width, height, src 원본 정보
                webpackSrc: imageContext(originalNfdKey), // Webpack이 변환한 실제 이미지 경로
            };
        }).filter(Boolean);// null 값(오류 난 이미지) 제거


        // ////초기화
        const shuffledImages = processedImages.sort(() => 0.5 - Math.random());
        setImageBank(shuffledImages); // 모든 나머지 이미지들
        setSignboardImages(shuffledImages.slice(0, 12)); // 처음 12개
        setColumns([]); // 캔버스는 비움

    }, [])



    // click 핸들러
    const handleImgClicked = (clickedImage) => {
        // console.log('클릭!!!', clickedImage);
        let foundSpot = false; // 이미지를 배치할 자리를 찾았는지 여부

        //state 불변성 위해 깊은 복사본 생성
        const newColumns = columns.map(col => ({
            ...col,
            images: [...col.images],
        }));

        /// 가상 테스트 1 (기존 칼럼에 넣어보기)
        for (const column of newColumns) {
            //  "만약" 이 칼럼에 'clickedImage'를 추가한다면?
            const hypotheticalImages = [...column.images, clickedImage]; //hypotheticalImages: 가상이미지 



            // 👇 potpack에 넣기 직전의 데이터 확인 (디버깅용)
            console.log("--- potpack 가상 테스트 데이터 ---");

            //potpack에게 갭(GAP)을 포함한 "가짜" 크기 목록 전달
            const boxes = hypotheticalImages.map((img, idx) => {
                const boxData = {

                    w: Number(img.width) + GAP,
                    h: Number(img.height) + GAP,
                };

                // 여기서 width나 height가 NaN인지 바로 확인
                if (isNaN(boxData.w) || isNaN(boxData.h)) {
                    console.error(`🚨 BAD DATA! [${idx}]`, img);
                    // 🚨 img.width가 undefined이면 여기서 걸립니다.
                }

                return boxData;
            });
            console.log("---------------------------------");

            // 가상 테스트 실행: potpack이 계산한 이 칼럼의 "최종 모양"
            const stats = potpack(boxes);
            // 👇 potpack이 반환한 값 확인
            console.log("Potpack이 반환한 stats:", stats);

            if (stats.h <= CANVAS_HEIGHT) {
                // 성공~!~!~!
                column.images = hypotheticalImages;// 이미지 목록 업데이트
                column.width = stats.w; //potpack이 계산한 새 너비로 칼럼 너비 업데이트
                foundSpot = true;// 자리를 찾았다고 표시
                break;
            }

        }

        /// 가상 테스트 2(새 칼럼 생성하기)
        if (!foundSpot) { // 'foundSpot'이 여전히 false라면, 새 칼럼을 만들어야 함

            // [수정] 새 칼럼을 추가하기 전에 "현재 총 너비"를 계산합니다.
            const totalCurrentWidth = newColumns.reduce((sum, col) => sum + col.width, 0);

            // 새 칼럼 시작될 X좌표 계산
            // const lastColumn = newColumns[newColumns.length - 1];
            // const newXOffset = lastColumn ? (lastColumn.xOffset + lastColumn.width) : 0;// 첫 칼럼이면 0

            //새 칼럼에 필요한 '가상'크기
            const newWidthWithGap = Number(clickedImage.width) + GAP;
            const newHeightWithGap = Number(clickedImage.height) + GAP;

            // console.log('&&&&&&&&', newXOffset + newWidthWithGap)

            //새 칼럼이 캔버스 너비 1800을 넘는가?
            // if (newXOffset + newWidthWithGap > CANVAS_WIDTH) {
            //     alert("가로 공간 부족!!");
            //     return;
            // }
            // [수정] newXOffset 대신 "총 너비 + 새 너비"로 1800을 검사합니다.
            if (totalCurrentWidth + newWidthWithGap > CANVAS_WIDTH) {
                alert("가로 공간 부족!!");
                return;
            }
            if (newHeightWithGap > CANVAS_HEIGHT) {
                alert("이미지가 너무 커서 캔버스에 들어갈 수 없습니다.");
            }
            // 성공 ㅠㅠ
            newColumns.push({
                // xOffset: newXOffset,        // 계산된 X좌표
                width: newWidthWithGap,   // potpack이 계산한 너비 (갭 포함)
                images: [clickedImage],     // 이 이미지 하나만 담음
            });
        }

        // 1번 또는 2번의 가상 테스트를 통과한 'newColumns'로 state 업데이트
        setColumns(newColumns);

        //뱅크에서 클릭한 이미지 제거
        setImageBank((prevBank) => {
            const newBank = prevBank.filter(img => img.id !== clickedImage.id);

            const shuffledNewBank = [...newBank].sort(() => 0.5 - Math.random());
            const newImageFromBank = shuffledNewBank.slice(0, 12); //창고에서 새 이미지12개 가져오기
            setSignboardImages(newImageFromBank);

            return newBank;
        });


    };



    return (
        <div className={style.newPlayPageCompo}>
            <div className={style.orderDiv}>
                <p className={style.orderText}>
                    지시어가 들어갈 곳입니다.
                </p>
                <p className={style.countNum}>
                    9
                </p>
            </div>
            <div className={style.signboardDiv}>

                {signboardImages.map((img) => {
                    // console.log(img);
                    const originalFilename = img.src.split('.')[0];
                    return (
                        <div
                            className={style.imgBox}
                            key={img.id}
                            onClick={() => { handleImgClicked(img); }}>
                            <img
                                src={img.webpackSrc}
                                alt={originalFilename} // alt 텍스트는 파일명으로
                            />
                            <span>[ {originalFilename} ]</span>
                        </div>
                    )
                })}

            </div>
            <div className={style.playboardDiv}>
                {/* <div className={style.userCanvas}> */}
                <UserCanvas columns={columns} GAP={GAP} />
                {/* </div> */}
            </div>

        </div >
    )
}

export default NewPlayPage