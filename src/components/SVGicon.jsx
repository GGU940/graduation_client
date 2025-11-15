import React from 'react'
import style from "../css/Loading.module.css"
// complt = false, error = false, question = false
const SVGicon = ({ color, kind }) => {

    if (kind === 'arrow') {//화살표 기본값.
        return (<>

            <svg className={style.loadingSymbol} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" strokeLinecap="butt" strokeLinejoin="round" >
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>

            </svg>
        </>
        )
    } else if (kind === "question") {
        return (<>
            <svg
                className={style.questionSymbol}
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* 1. 동그라미 (circle) - 그대로 유지 */}
                <circle cx="12" cy="12" r="10"></circle>

                {/* 💡 2. 물음표 윗부분 (path) - 변경된 부분 */}
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3v1"></path>

                {/* 💡 3. 물음표 아랫점 (path) - 변경된 부분 */}
                <path d="M12 17.01h.01"></path>
            </svg>
        </>
        )
    } else if (kind === "complete") {
        return (
            <>
                <svg
                    className={style.compltSymbol}
                    width="60"
                    height="60"
                    viewBox="0 0 24 24" // 💡 viewBox는 그대로 유지하여 크기 비율 유지
                    fill="none"
                    stroke={color}
                    strokeWidth="1" // JSX에서는 stroke-width -> strokeWidth
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                >
                    {/* 💡 동그라미 (circle) */}
                    <circle cx="12" cy="12" r="10"></circle>

                    {/* 💡 체크 표시 (polyline) */}
                    <polyline points="16 8 10 16 8 14"></polyline>
                </svg>
            </>
        )
    } else if (kind === "error") {

        return (
            <svg className={style.errorSymbol} width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22H22L12 2Z" fill="#ff0000" stroke="#ff0000" stroke-width="2" />
                <path d="M12 8V13" stroke="black" stroke-width="2" stroke-linecap="butt" stroke-linejoin="round" />
                <circle cx="12" cy="17" r="1.5" fill="black" />
            </svg>
        )
    }



}

export default SVGicon