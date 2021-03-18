import React, { useState } from 'react';
import st from './Nav.module.scss';
//ui-elements
import Answer_Icon from 'assets/nav/Answer.png'
import Ranking_Icon from 'assets/nav/Ranking.png'
import Chat_Icon from 'assets/nav/Chat.png'
import Settings_Icon from 'assets/nav/Settings.png'
//interface
import {ProfilesUsage} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'
import {ChatMsg} from 'components/Interfaces'
//functional-interface
import {RankingProps} from 'components/Functional_Interfaces'
//components
import TwitterProfileList from 'components/00_shared/profiles/TwitterProfileList'
import Ranking from './pages/Ranking'
import * as Chat from 'components/00_shared/chat/Chat'
import * as Not from 'components/00_shared/notification/Notification'
import * as Settings from 'components/00_shared/settings/Settings'

export interface NavProps {
    profiles: Profile[]
    onSelectAnswer: (profile:Profile) => void
    roundActive: boolean
    chatmessages: ChatMsg[]
    onNewMessage: (newMsg:ChatMsg) => void
    settings: Settings.Settings_Match
    onSettingsChanged: (newSettings:Settings.Settings_Match) => void
    onNotfication: (msg:string, notType:Not.Type) => void
}

export default function Nav(props:NavProps) {
    const [lobbyIndex, setLobbyIndex] = useState(0) //default to search
    
    const getLobbyContent = () => {
        
        let content = <div></div>
        //ANSWER
        if (lobbyIndex === 0) {
            content = 
                <TwitterProfileList
                    parentType={ProfilesUsage.Answer}
                    roundActive={props.roundActive}
                    data={props.profiles}
                    onSelectAnswer={props.onSelectAnswer}
                />
        }
        //RANKING
        else if (lobbyIndex === 1) {
            let newProps:RankingProps = {
                test: ''
            }
            const comp = React.createElement(Ranking, newProps)
            content = comp
        }
        //CHAT
        else if (lobbyIndex === 2) {
            return Chat.getComponent(props.chatmessages, props.onNewMessage)
        }
        //SETTINGS
        else if (lobbyIndex === 3) {
            content = Settings.getComponent(Settings.Usage.Match, props.settings, true, props.onSettingsChanged , props.onNotfication)
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







