import React, { useState } from 'react';
import st from './Nav.module.scss';
import {log} from 'components/Logic'
//ui-elements
import Answer_Icon from 'assets/nav/Answer.png'
import Ranking_Icon from 'assets/nav/Ranking.png'
import Chat_Icon from 'assets/nav/Chat.png'
import Settings_Icon from 'assets/nav/Settings.png'
//functional-interface
import {NavProps} from 'components/Functional_Interfaces'

export default function Nav(props:NavProps) {
    const [lobbyIndex, setLobbyIndex] = useState(0) //default to search
    
    const getLobbyContent = () => {
        
        let content = <div></div>
        //ANSWER
        if (lobbyIndex === 0) {
            content = 
                <div>
                    ANSWER
                </div>
        }
        //RANKING
        else if (lobbyIndex === 1) {
            content = 
                <div>
                    RANKING
                </div>
        }
        //CHAT
        else if (lobbyIndex === 2) {
            content = 
                <div>
                    CHAT
                </div>
        }
        //SETTINGS
        else if (lobbyIndex === 3) {
            /*
                SET ME AUTOREADY
                
            */


            content = 
                <div>
                    SETTINGS
                </div>
        }
        return content
    }

    const getLobbyNavClass = (navItemIndex:number) => {
        if (navItemIndex === lobbyIndex) {
            return st.NavItem_Con_Active
        }
        return st.NavItem_Con
    }

    return (
        <div className={st.Con}>
            <div className={st.NavBar}>
                <div className={getLobbyNavClass(0)} onClick={() => {setLobbyIndex(0)}}>
                    <img className={st.Icon} src={Answer_Icon} alt="Answer" title="Your answer"/>
                </div>
                <div className={getLobbyNavClass(1)} onClick={() => {setLobbyIndex(1)}}>
                    <img className={st.Icon} src={Ranking_Icon} alt="Ranking" title="Ranking"/>
                </div>
                <div className={getLobbyNavClass(2)} onClick={() => {setLobbyIndex(2)}}>
                    <img className={st.Icon} src={Chat_Icon} alt="Chat" title="Chat"/>
                </div>
                <div className={getLobbyNavClass(3)} onClick={() => {setLobbyIndex(3)}}>
                    <img className={st.Icon} src={Settings_Icon} alt="Settings" title="Settings"/>
                </div>
            </div>
            <div className={st.Content}>
                {getLobbyContent()}
            </div>
        </div>
    );
}







