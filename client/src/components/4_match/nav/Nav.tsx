/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
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
import {Matrix} from 'components/Interfaces'
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
    matrix: Matrix
    userName: string
    roundUntil: number
    readyEnabled: boolean
    onNotfication: (msg:string, notType:Not.Type) => void
}

enum ChatStatus {
    init,
    newMsg,
    MsgSeen
}

export default function Nav(props:NavProps) {
    const [lobbyIndex, setLobbyIndex] = useState(0) //default to answers
    //vars for displaying content depending on flow
    const [lastRound, setLastRound] = useState(-1) 
    const [showSolution, setShowSolution] = useState(false)
    //handle new chat messages
    const [chatMsgCount, setChatMsgCount] = useState(-1)
    const [chatStatus, setChatStatus] = useState(ChatStatus.init)

    useEffect(() => {
        //jump to answers once the round started
        if (props.roundActive && lastRound !== props.roundUntil) {
            setLastRound(props.roundUntil)
            setShowSolution(false)
            setLobbyIndex(0)
        }
        //jump to solution once the round ended
        else if (!props.roundActive && !showSolution && props.roundUntil > 0) {
            setShowSolution(true)
            setLobbyIndex(1)
        }

        //check if new messages have arrived
        if (props.chatmessages.length > chatMsgCount) {
            setChatMsgCount(props.chatmessages.length)
            if (lobbyIndex === 2) {
                setChatStatus(ChatStatus.MsgSeen)
            }
            else {
                //only indicate new messages when other chat is not open
                setChatStatus(ChatStatus.newMsg)
            }
        }   
    })

    const onSelectAnswer = (profile:Profile) => {
        //jump to ranking when answer selected
        if (props.settings.jumpToRankingAfterSelecting) {
            setLobbyIndex(1)
        }
        props.onSelectAnswer(profile)
    }

    const getLobbyContent = () => {
        
        let content = <div></div>
        //ANSWER
        if (lobbyIndex === 0) {
            content = 
                <TwitterProfileList
                    parentType={ProfilesUsage.Answer}
                    roundActive={props.roundActive}
                    data={props.profiles}
                    onSelectAnswer={onSelectAnswer}
                />
        }
        //RANKING
        else if (lobbyIndex === 1) {
            let props_:RankingProps = {
                matrix: props.matrix,
                userName: props.userName,
                roundUntil: props.roundUntil,
                readyEnabled: props.readyEnabled
            }
            const comp = React.createElement(Ranking, props_)
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
        //display new messages colour, but only when user is not in chat
        if (navItemIndex === 2 && chatStatus === ChatStatus.newMsg && lobbyIndex !== 2) {
            return st.NavItem_Con_Alert
        }
        //default
        if (navItemIndex === lobbyIndex) {
            return st.NavItem_Con_Active
        }
        return st.NavItem_Con
    }

    const onNavItemClick = (index:number) => {
        if (index === 2 && chatStatus === ChatStatus.newMsg) {
            setChatStatus(ChatStatus.MsgSeen)
        }   
        setLobbyIndex(index)
    }

    return (
        <div className={st.Con}>
            <div className={st.NavBar}>
                <div className={getLobbyNavClass(0)} onClick={() => {onNavItemClick(0)}}>
                    <img className={st.Icon} src={Answer_Icon} alt="Answer" title="Your answer"/>
                </div>
                <div className={getLobbyNavClass(1)} onClick={() => {onNavItemClick(1)}}>
                    <img className={st.Icon} src={Ranking_Icon} alt="Ranking" title="Ranking"/>
                </div>
                <div className={getLobbyNavClass(2)} onClick={() => {onNavItemClick(2)}}>
                    <img className={st.Icon} src={Chat_Icon} alt="Chat" title="Chat"/>
                </div>
                <div className={getLobbyNavClass(3)} onClick={() => {onNavItemClick(3)}}>
                    <img className={st.Icon} src={Settings_Icon} alt="Settings" title="Settings"/>
                </div>
            </div>
            <div className={st.Content}>
                {getLobbyContent()}
            </div>
        </div>
    );
}







