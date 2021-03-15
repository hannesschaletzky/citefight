import React, { useState } from 'react'
import st from './Ranking.module.scss'
import {log} from 'components/Logic'
//ui-elements
import Clock from 'assets/nav/Clock.png'
import Tick from 'assets/nav/Tick.png'
//functional-interface
import {RankingProps} from 'components/Functional_Interfaces'

export default function Ranking(props:RankingProps) {
    
    const getCards = () => {
        return <div>CARDS COME HERE</div>
    }


    return (
        <div className={st.Con}>
            <div className={st.Headline_Con}>
                <div className={st.Headline_Place}>

                </div>
                <div className={st.Headline_Name}>
                    
                </div>
                <div className={st.Headline_Points}>
                    <img className={st.Icon} src={Tick} alt="Correct" title="Correct answers"/>
                </div>
                <div className={st.Headline_TotalTime}>
                    <img className={st.Icon} src={Clock} alt="Time" title="Total time"/>
                </div>
            </div>
            {getCards()}
        </div>
    );
}







