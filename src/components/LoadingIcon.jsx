import React from 'react'
import style from "../css/Loading.module.css"

const LoadingIcon = ({ color }) => {
    return (
        <svg className={style.loadingSymbol} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="1" stroke-linecap="butt" stroke-linejoin="round" >
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
    )
}

export default LoadingIcon