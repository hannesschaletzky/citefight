/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import st from './Matrix.module.scss'
//functional interfaces
import {MatrixProps} from 'components/Functional_Interfaces'
//components
import * as Sorting from '../nav/pages/Ranking_Sorting'

export default function Matrix(props:MatrixProps) {

    const keys = Object.keys(props.matrix)

    const onCloseClick = () => {
        props.onCloseClick()
    }

    //get random key
    let key = 0
    function grk():string {
        return '' + key++
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
        props.matrix[keys[0]].forEach((point, index) => {
            if (index < props.roundUntil) {
                items.push(
                    <div className={st.Headline_Item} key={grk()}>
                        {count++}
                        <img className={st.Pic} src={getProfilePicURLFor(point.goal)} alt="Correct Answer"/>
                        <div className={st.Headline_Name}>{point.goal}</div> 
                    </div>)
            }
            else {
                items.push(
                    <div className={st.Headline_Item} key={grk()}>
                        {count++}
                    </div>)
            }
        })
        return items
    }

    const getRows = () => {

        //get sorted array from matrix
        let calcArr = Sorting.getSortedArray(props.matrix, props.roundUntil)

        //COMPOSE ROWS
        let rows: JSX.Element[] = []
        calcArr.forEach((item) => {
            let player = item.name
            //first item is player name
            rows.push(
                    <div className={st.Row_PlayerName} key={grk()}>
                        {player}
                    </div>)
            //rounds
            props.matrix[player].forEach((point, index) => {

                //calc correct/false/noAnswer
                let text = "No Answer was given"
                let symbol = ""
                if (point.answer === '') {
                    symbol = "⚫"
                }
                else {
                    text = (index + 1) + '. - Solution: ' + point.goal + ', Answer: ' + point.answer
                    if (point.correct) {
                        symbol = "✅"
                    }
                    else {
                        symbol = "❌"
                    }
                }

                if (index < props.roundUntil) {
                    rows.push(
                        <div className={st.Row_Item} title={text} key={grk()}>
                            {(point.answer !== '') && 
                                <img className={st.Pic} src={getProfilePicURLFor(point.answer)} alt="Correct Answer"/> 
                            }
                            <div className={st.Row_Name}>{point.answer}</div> 
                            <div>{symbol}</div>
                        </div>)
                }
                else {
                    rows.push(<div className={st.Row_Item} title={text} key={grk()}></div>)
                }
            })
        })
        return rows
    }
    
    const getContent = () => {

        //calc columns
        let colLength = 110
        let cssColumns = `${colLength}px ` //incl. name
        props.matrix[keys[0]].forEach(() => {
            cssColumns += `${colLength}px `
        }) 

        //calc rows
        let rowLength = 90
        let cssRows = `${rowLength}px ` //incl headline
        keys.forEach(() => {
            cssRows += `${rowLength}px `
        })

        const style = {
            position: "absolute",
            "top": "55px",
            "right": 0,
            "bottom": "60px",
            "left": 0,
            margin: "10px",

            cursor: "pointer",
            overflow: "auto",
            backgroundColor: "rgba(255, 255, 255, 0.95)",

            display: "grid",
            gridColumnGap: "10px",
            gridRowGap: "10px",
            gridTemplateColumns: cssColumns,
            gridTemplateRows: cssRows
        } as React.CSSProperties

        let rtn = 
            <div style={style} onClick={() => onCloseClick()}>
                <div className={st.TopLeftPlaceholder}>Solution: </div>
                {getHeadlineItems()}
                {getRows()}
            </div>
        return rtn
    }

	return (
		getContent()
	)
}


/*

{getHeadlineItems()}
            {getRows()}
*/
