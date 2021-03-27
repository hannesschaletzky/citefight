import { useState } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Landing.module.scss'
import {log, getRandomInt} from 'components/Logic'

import Intro_Tweet from 'assets/landing/Intro_Tweet.png'

enum State {
    init,
    findClicked,
    incorrectID,
    correctID,
    create, 
    find
}

export default function Landing() {

    const [state, setState] = useState(State.init)
    const [info, setInfo] = useState('')
    const [ID, setID] = useState('')

    const createMatchroom = () => {
        log('create matchroom')
        setState(State.create)
    }

    const findMatchroom = () => {
        if (state === State.init) {
            setState(State.findClicked)
        }
        else if (state === State.correctID) {
            log('finding matchroom')
            setState(State.find)
        }
    }

    const getRedirect = () => {
        if (state === State.create) {
            let dt = new Date()
            let matchID = `${dt.getHours()}${dt.getMinutes()}${dt.getSeconds()}`
            matchID += getRandomInt(10)
            log(matchID)
            let redirectURL = '/join/' + matchID
            return <Redirect to={redirectURL}/> 
        }
        else if (state === State.find) {
            let redirectURL = '/join/' + ID
            return <Redirect to={redirectURL}/>
        }
        return <div></div>
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    const IDChanged = (_id: string) => {

        //check ID constraints
        if (_id.length === 0) {
            setInfo('Please provide an ID')
            setState(State.incorrectID)
        }
        else if (!(/^[0-9_]+$/.test(_id))) {
            setInfo('ID must be numeric')
            setState(State.incorrectID)
        }
        else if (_id.length < 3) {
            setInfo('ID must be at least 3 digits long')
            setState(State.incorrectID)
        }
        else {
            setInfo('')
            setID(_id)
            setState(State.correctID)
        }
    }

    const keyPressed = (event: any) => {
        if (event.key === 'Enter' && state === State.correctID) {
            findMatchroom()
        }
    }

    return (
        <div className={st.Con}>
            <div className={st.Headline}>
                Citefight is a Twitter guessing game. Choose public Twitter profiles and invite your friends to play! <br></br>
                A random tweet will be displayed each round. Guess who tweeted! The player with the highest number of correct answers wins!!!
            </div>
            <div className={st.PicFlow_Con}>
                <div className={st.Tweet_Con}>
                    <img className={st.Tweet} src={Intro_Tweet} alt="Intro" title="Guess who tweeted this"/>
                </div>
            </div>
            <div className={st.Bottom_Con}>
                {state === State.init && 
                    <button className={st.Button_Ready} onClick={() => createMatchroom()}>
                        Create Matchroom 🎉
                    </button>
                }
                {state !== State.init && 
                    <input  className={st.ID_Input} 
                            autoFocus={true}
                            type="text" 
                            placeholder="Enter ID"
                            onChange={e => IDChanged(e.target.value)} 
                            onKeyUp={e => keyPressed(e)}/>
                }
                {(state === State.correctID || state === State.init) && 
                    <button className={st.Button_Find} onClick={() => findMatchroom()}>
                        Find Matchroom 🔎
                    </button>
                }
                <div className={st.Info}>
                    {info}
                </div>

            </div>
            {getRedirect()}
        </div>
    )
}













