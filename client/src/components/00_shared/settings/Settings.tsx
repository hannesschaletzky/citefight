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
    Little,
    Normal,
    Much
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
}
//INIT
export const initSettings_Lobby:Settings_Lobby = {
    rounds: 25,
    roundtime: Roundtime.Normal,
    autoContinue: true,
    pictures: Pictures.AtHalftime,
    drinking: DrinkingMode.Off
}
export const initSettings_Match:Settings_Match = {
    autoready: true
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
    rounds,
    roundtime,
    drinking,
    autoContinue,
    pictures
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
        if (type === Type.rounds) {
            props.settings.rounds = value
        }
        else if (type === Type.roundtime) {
            props.settings.roundtime = value
        }
        else if (type === Type.drinking) {
            props.settings.drinking = value
        }
        else if (type === Type.autoContinue) {
            props.settings.autoContinue = value
        }
        else if (type === Type.pictures) {
            props.settings.pictures = value
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
        
        if (type === Type.rounds) {
            if (value === props.settings.rounds) {
                return act
            }
        }
        else if (type === Type.roundtime) {
            if (value === props.settings.roundtime) {
                return act
            }
        }
        else if (type === Type.autoContinue) {
            if (value === props.settings.autoContinue) {
                return act
            }
        }
        else if (type === Type.pictures) {
            if (value === props.settings.pictures) {
                return act
            }
        }
        else if (type === Type.drinking) {
            if (value === props.settings.drinking) {
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
                    <button className={getClass(Type.rounds, 5)} onClick={() => {newSettings(Type.rounds, 5)}}>5</button>
                    <button className={getClass(Type.rounds, 10)} onClick={() => {newSettings(Type.rounds, 10)}}>10</button>
                    <button className={getClass(Type.rounds, 25)} onClick={() => {newSettings(Type.rounds, 25)}}>25</button>
                    <button className={getClass(Type.rounds, 50)} onClick={() => {newSettings(Type.rounds, 50)}}>50</button>
                    <button className={getClass(Type.rounds, 100)} onClick={() => {newSettings(Type.rounds, 100)}}>100</button>
                </div>

                {/*ROUNDTIME*/}
                <div className={st.Header}>
                    Roundtime
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.roundtime, Roundtime.Little)} onClick={() => {newSettings(Type.roundtime, Roundtime.Little)}}>Low</button>
                    <button className={getClass(Type.roundtime, Roundtime.Normal)} onClick={() => {newSettings(Type.roundtime, Roundtime.Normal)}}>Normal</button>
                    <button className={getClass(Type.roundtime, Roundtime.Much)} onClick={() => {newSettings(Type.roundtime, Roundtime.Much)}}>High</button>
                </div>
                
                {/*AUTO CONTINUE*/}
                <div className={st.Header}>
                    Automatically continue rounds
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.autoContinue, false)} onClick={() => {newSettings(Type.autoContinue, false)}}>Off</button>
                    <button className={getClass(Type.autoContinue, true)} onClick={() => {newSettings(Type.autoContinue, true)}}>On</button>
                </div>

                {/*DRINKING*/}
                <div className={st.Header}>
                    Show Tweet Pictures
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.pictures, Pictures.Off)} onClick={() => {newSettings(Type.pictures, Pictures.Off)}}>Off</button>
                    <button className={getClass(Type.pictures, Pictures.Instantly)} onClick={() => {newSettings(Type.pictures, Pictures.Instantly)}}>Instantly</button>
                    <button className={getClass(Type.pictures, Pictures.AtHalftime)} onClick={() => {newSettings(Type.pictures, Pictures.AtHalftime)}}>Half-Roundtime</button>
                </div>
                
                {/*DRINKING*/}
                <div className={st.Header}>
                    Drinking Mode
                </div>
                <div className={st.Row}>
                    <button className={getClass(Type.drinking, DrinkingMode.Off)} onClick={() => {newSettings(Type.drinking, DrinkingMode.Off)}}>Off</button>
                    <button className={getClass(Type.drinking, DrinkingMode.Lightweight)} onClick={() => {newSettings(Type.drinking, DrinkingMode.Lightweight)}}>Lightweight</button>
                    <button className={getClass(Type.drinking, DrinkingMode.Regular)} onClick={() => {newSettings(Type.drinking, DrinkingMode.Regular)}}>Regular</button>
                    <button className={getClass(Type.drinking, DrinkingMode.Beast)} onClick={() => {newSettings(Type.drinking, DrinkingMode.Beast)}}>Beast</button>
                </div>
                
            </div>
        }
        else if (props.usage === Usage.Match) {
            rtn = 
            <div>
                Match Settings come HERE!
            </div>
        }

        return rtn
    }

    return (
        getContent()
    )
}


