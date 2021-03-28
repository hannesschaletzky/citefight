/* eslint-disable react-hooks/exhaustive-deps */
//import React from 'react';
import st from './Matrix.module.scss'
//functional interfaces
import {MatrixProps} from 'components/Functional_Interfaces'

export default function Matrix(props:MatrixProps) {

    const onCloseClick = () => {
        props.onCloseClick()
    }

	return (
		<div className={st.Con} onClick={() => onCloseClick()}>
            MATRIX
        </div>
	)
}
