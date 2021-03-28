/* eslint-disable react-hooks/exhaustive-deps */
//import React from 'react';
import st from './Matrix.module.scss'
//functional interfaces
import {MatrixProps} from 'components/Functional_Interfaces'

export default function Matrix(props:MatrixProps) {

    const keys = Object.keys(props.matrix)

    const onCloseClick = () => {
        props.onCloseClick()
    }

    const getProfilePicURLFor = (screen_name:string) => {
        for(let i=0;i<props.profiles.length;i++) {
            let profile = props.profiles[i]
            if (screen_name === profile.screen_name) {
                return profile.profile_image_url_https
            }
        }
        return ''
    }

    const getHeadlineItems = () => {
        let items: JSX.Element[] = []
        let count = 1
        props.matrix[keys[0]].forEach((point) => {
            items.push(
                <div className={st.Headline_Item} key={count}>
                    {count++}<br></br>
                    <img className={st.Pic} src={getProfilePicURLFor(point.goal)} alt="Correct Answer"/><br></br>
                    <div className={st.Headline_Name}>{point.goal}</div> 
                </div>
            )
        })
        return items
    }

    const getRows = () => {
        let rows: JSX.Element[] = []
        let row: JSX.Element[] = []
        keys.forEach((player) => {
            row = []
            //row-items
            props.matrix[player].forEach((point, index) => {
                row.push(
                    <div className={st.Row_Item} key={index}>
                        <img className={st.Pic} src={getProfilePicURLFor(point.answer)} alt="Correct Answer"/><br></br>
                        <div className={st.Row_Name}>{point.answer}</div> 
                    </div>)
            })
            //add row
            rows.push(
                <div className={st.Row_Con}>
                    {row}
                </div>)
        })
        return rows
    }

	return (
		<div className={st.Con} onClick={() => onCloseClick()}>
            <div className={st.Headline_Con}>
                {getHeadlineItems()}
            </div>
            {getRows()}
        </div>
	)
}
