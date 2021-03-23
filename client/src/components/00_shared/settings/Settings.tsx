import React from 'react';
import st from './Settings.module.scss';

import {didUserExceedLimit} from 'components/Logic'

import * as Not from 'components/00_shared/notification/Notification'

/*
##################################
            TYPES
##################################
*/
export enum Roundtime {
    Fast = 3,
    Regular = 5,
    Slow = 10 
}
export enum DrinkingMode {
    Off,
    Lightweight,
    Regular,
    Beast,
}
export enum Pictures {
    Off,
    Instantly,
    AtHalftime
}
export interface Settings_Lobby {
    rounds: number
    roundtime: Roundtime
    drinking: DrinkingMode
    autoContinue: boolean
    pictures: Pictures
}
export interface Settings_Match {
    autoready: boolean
    jumpToRankingAfterSelecting: boolean
}
//INIT
export const initSettings_Lobby:Settings_Lobby = {
    rounds: 25,
    roundtime: Roundtime.Regular,
    autoContinue: false,
    pictures: Pictures.Instantly,
    drinking: DrinkingMode.Off
}
export const initSettings_Match:Settings_Match = {
    autoready: false,
    jumpToRankingAfterSelecting: true
}


/*
##################################
            EXPORT
##################################
*/
export enum Usage {
    Lobby,
    Match
}
interface Props {
    usage: Usage
    settings: any
    isAdmin:boolean
    onSettingsChanged:(newSettings:any) => void
    newNotification:(msg:string, notType:Not.Type) => void
}
export const getComponent = (usage: Usage,
                            settings: any,
                            isAdmin:boolean,
                            onSettingsChanged:(newSettings:any) => void,
                            newNotification:(msg:string, notType:Not.Type) => void) => {
    let props:Props = {
        usage: usage,
        settings: settings,
        isAdmin:isAdmin,
        onSettingsChanged: onSettingsChanged,
        newNotification: newNotification
    }
    return React.createElement(SettingsLogic, props)
}

/*
##################################
            LOGIC
##################################
*/
enum Type {
    //LOBBY
    l_rounds,
    l_roundtime,
    l_drinking,
    l_autoContinue,
    l_pictures,
    //MATCH
    m_autoready,
    m_jumpToRankingAfterSelecting
}

let messageTimestamps:string[] = []

function SettingsLogic(props:Props) {

    const newSettings = (type:Type, value:any) => {

        //check actions (excluded: rounds, customgamespeed)
        if (didUserExceedLimit(messageTimestamps, 15) ) {
            props.newNotification('Too many actions, small cooldown', Not.Type.Warning)
            return
        }

        //determine value to change
        //LOBBY
        if (type === Type.l_rounds) {
            props.settings.rounds = value
        }
        else if (type === Type.l_roundtime) {
            props.settings.roundtime = value
        }
        else if (type === Type.l_drinking) {
            props.settings.drinking = value
        }
        else if (type === Type.l_autoContinue) {
            props.settings.autoContinue = value
        }
        else if (type === Type.l_pictures) {
            props.settings.pictures = value
        }
        //MATCH
        else if (type === Type.m_autoready) {
            props.settings.autoready = value
        }
        else if (type === Type.m_jumpToRankingAfterSelecting) {
            props.settings.jumpToRankingAfterSelecting = value
        }

        //give to parent
        messageTimestamps.push(new Date().toISOString())
        props.onSettingsChanged(props.settings)
    }


    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */

    let act = st.Button_Active
    let inact = st.Button_InActive

    const getClass = (type:Type, value:any) => {
        
        //LOBBY
        if (type === Type.l_rounds) {
            if (value === props.settings.rounds) {
                return act
            }
        }
        else if (type === Type.l_roundtime) {
            if (value === props.settings.roundtime) {
                return act
            }
        }
        else if (type === Type.l_autoContinue) {
            if (value === props.settings.autoContinue) {
                return act
            }
        }
        else if (type === Type.l_pictures) {
            if (value === props.settings.pictures) {
                return act
            }
        }
        else if (type === Type.l_drinking) {
            if (value === props.settings.drinking) {
                return act
            }
        }
        //MATCH
        else if (type === Type.m_autoready) {
            if (value === props.settings.autoready) {
                return act
            }
        }
        else if (type === Type.m_jumpToRankingAfterSelecting) {
            if (value === props.settings.jumpToRankingAfterSelecting) {
                return act
            }
        }

        return inact
    }


    //-> cast event!
    //onMouseOut={(e) => newSettings(Type.rounds, (e.target as HTMLInputElement).value)}
    const getContent = () => {

        let rtn = <div></div>
        if (props.usage === Usage.Lobby) {
            rtn = 

            <div className={props.isAdmin ? st.Con : st.Con_NoAdmin}>

                {/*ROUNDS*/}
                <div className={st.Header}>
                    Rounds
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.l_rounds, 2)} onClick={() => {newSettings(Type.l_rounds, 2)}}>2</button>
                    <button className={getClass(Type.l_rounds, 10)} onClick={() => {newSettings(Type.l_rounds, 10)}}>10</button>
                    <button className={getClass(Type.l_rounds, 25)} onClick={() => {newSettings(Type.l_rounds, 25)}}>25</button>
                    <button className={getClass(Type.l_rounds, 50)} onClick={() => {newSettings(Type.l_rounds, 50)}}>50</button>
                    <button className={getClass(Type.l_rounds, 100)} onClick={() => {newSettings(Type.l_rounds, 100)}}>100</button>
                </div>

                {/*ROUNDTIME*/}
                <div className={st.Header}>
                    Roundtime
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.l_roundtime, Roundtime.Fast)} onClick={() => {newSettings(Type.l_roundtime, Roundtime.Fast)}}>Fast</button>
                    <button className={getClass(Type.l_roundtime, Roundtime.Regular)} onClick={() => {newSettings(Type.l_roundtime, Roundtime.Regular)}}>Regular</button>
                    <button className={getClass(Type.l_roundtime, Roundtime.Slow)} onClick={() => {newSettings(Type.l_roundtime, Roundtime.Slow)}}>Slow</button>
                </div>
                
                {/*AUTO CONTINUE*/}
                <div className={st.Header}>
                    Automatically continue rounds
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.l_autoContinue, false)} onClick={() => {newSettings(Type.l_autoContinue, false)}}>Off</button>
                    <button className={getClass(Type.l_autoContinue, true)} onClick={() => {newSettings(Type.l_autoContinue, true)}}>On</button>
                </div>

                {/*TWEET PICTURES*/}
                <div className={st.Header}>
                    Show Tweet Pictures
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.l_pictures, Pictures.Off)} onClick={() => {newSettings(Type.l_pictures, Pictures.Off)}}>Off</button>
                    <button className={getClass(Type.l_pictures, Pictures.Instantly)} onClick={() => {newSettings(Type.l_pictures, Pictures.Instantly)}}>Instantly</button>
                    <button className={getClass(Type.l_pictures, Pictures.AtHalftime)} onClick={() => {newSettings(Type.l_pictures, Pictures.AtHalftime)}}>Half-Roundtime</button>
                </div>
                
                {/*DRINKING*/}
                <div className={st.Header}>
                    Drinking Mode
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.l_drinking, DrinkingMode.Off)} onClick={() => {newSettings(Type.l_drinking, DrinkingMode.Off)}}>Off</button>
                    <button className={getClass(Type.l_drinking, DrinkingMode.Lightweight)} onClick={() => {newSettings(Type.l_drinking, DrinkingMode.Lightweight)}}>Lightweight</button>
                    <button className={getClass(Type.l_drinking, DrinkingMode.Regular)} onClick={() => {newSettings(Type.l_drinking, DrinkingMode.Regular)}}>Regular</button>
                    <button className={getClass(Type.l_drinking, DrinkingMode.Beast)} onClick={() => {newSettings(Type.l_drinking, DrinkingMode.Beast)}}>Beast</button>
                </div>
                
            </div>
        }
        else if (props.usage === Usage.Match) {
            rtn = 
            <div className={props.isAdmin ? st.Con : st.Con_NoAdmin}>

                {/*AUTOREADY*/}
                <div className={st.Header}>
                    Automatically set myself ready
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.m_autoready, false)} onClick={() => {newSettings(Type.m_autoready, false)}}>Off</button>
                    <button className={getClass(Type.m_autoready, true)} onClick={() => {newSettings(Type.m_autoready, true)}}>On</button>
                </div>
                
                {/*JUMP TO RANKING AFTER ANSWERING*/}
                <div className={st.Header}>
                    Jump to Ranking after answer was selected
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.m_jumpToRankingAfterSelecting, false)} onClick={() => {newSettings(Type.m_jumpToRankingAfterSelecting, false)}}>Off</button>
                    <button className={getClass(Type.m_jumpToRankingAfterSelecting, true)} onClick={() => {newSettings(Type.m_jumpToRankingAfterSelecting, true)}}>On</button>
                </div>
                
            </div>
        }

        return rtn
    }

    return (
        getContent()
    )
}


