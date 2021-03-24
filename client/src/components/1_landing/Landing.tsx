//import React, { useState } from 'react';
import st from './Landing.module.scss'
import {log} from 'components/Logic'

import Intro_Search from 'assets/landing/Intro_Search.png'
import Intro_Tweet from 'assets/landing/Intro_Tweet.png'
import Intro_Answers from 'assets/landing/Intro_Answers.png'

export default function Landing() {

    const createMatchroom = () => {
        log('create matchroom')
    }

    return (
        
        <div className={st.Con}>
            <div className={st.Headline}>
                Citefight is a Twitter guessing game. Choose public Twitter profiles and invite your friends to play! <br></br>
                A random tweet will be displayed each round. Guess who tweeted! The player with the highest number of correct answers wins!!!
            </div>
            <div className={st.PicFlow_Con}>
                <div className={st.Search_Con}>
                    <img className={st.Search} src={Intro_Search} alt="Search" title="Search for public Twitter profiles!"/>
                </div>
                <div className={st.Tweet_Con}>
                    <img className={st.Tweet} src={Intro_Tweet} alt="Intro" title="Guess who tweeted this"/>
                </div>
                <div className={st.Answers_Con}>
                    <img className={st.Answers} src={Intro_Answers} alt="Answers" title="Choose your answer"/>
                </div>
            </div>
            <div className={st.Bottom_Con}>
                <button className={st.Button_Ready} onClick={() => createMatchroom()}>
                    Create Matchroom 🎉
                </button>
            </div>
        </div>
    )
}













