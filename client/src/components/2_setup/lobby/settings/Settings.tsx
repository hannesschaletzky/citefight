//import React, { useRef, useEffect } from 'react';
import st from './Settings.module.scss';

import {didUserExceedLimit} from 'components/Logic'

import {NotType} from 'components/Interfaces'
import {Settings_Roundtime} from 'components/Interfaces'
import {Settings_DrinkingMode} from 'components/Interfaces'
import {Settings_Pictures} from 'components/Interfaces'

import {SettingsProps} from 'components/Functional_Interfaces'

enum Type {
    rounds,
    roundtime,
    drinking,
    autoContinue,
    pictures
}

let messageTimestamps:string[] = []

export default function Settings(props:SettingsProps) {

    //input field refs to update
    /*
    const roundsRef = useRef<null | HTMLInputElement>(null)
    useEffect(() => {
        if (roundsRef.current !== null) {
            roundsRef.current.value = '' + props.settings.rounds 
        }
    })
    */


    const newSettings = (type:Type, value:any) => {

        //check actions (excluded: rounds, customgamespeed)
        if (didUserExceedLimit(messageTimestamps, 15) ) {
            props.newNotification('Too many actions, small cooldown', NotType.Warning)
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

    const getRoundsClass = (current:number) => {
        if (current === props.settings.rounds) {
            return st.Button_Rounds_Active
        }
        return st.Button_Rounds
    }

    const getRoundTimeClass = (btn:Settings_Roundtime) => {
        if (btn === props.settings.roundtime) {
            return st.Button_Speed_Active
        }
        return st.Button_Speed
    }

    const getAutoContinueClass = (btnPurpose:boolean) => {
        if (btnPurpose === props.settings.autoContinue) {
            return st.Button_AutoContinue_Active
        }
        return st.Button_AutoContinue
    }

    const getPicturesClass = (type:Settings_Pictures) => {
        if (type === props.settings.pictures) {
            return st.Button_Pictures_Active
        }
        return st.Button_Pictures
    }

    const getDrinkingClass = (type:Settings_DrinkingMode) => {
        if (type === props.settings.drinking) {
            return st.Button_Drinking_Active
        }
        return st.Button_Drinking
    }

    //-> cast event!
    //onMouseOut={(e) => newSettings(Type.rounds, (e.target as HTMLInputElement).value)}

    return (
        <div className={props.isAdmin ? st.Con : st.Con_NoAdmin}>

            {/*ROUNDS*/}
            <div className={st.ItemHeader}>
                Rounds
            </div>
            <div className={st.Rounds_Con}>
                <button className={getRoundsClass(5)} onClick={() => {newSettings(Type.rounds, 5)}}>5</button>
                <button className={getRoundsClass(10)} onClick={() => {newSettings(Type.rounds, 10)}}>10</button>
                <button className={getRoundsClass(25)} onClick={() => {newSettings(Type.rounds, 25)}}>25</button>
                <button className={getRoundsClass(50)} onClick={() => {newSettings(Type.rounds, 50)}}>50</button>
                <button className={getRoundsClass(100)} onClick={() => {newSettings(Type.rounds, 100)}}>100</button>
            </div>

            {/*ROUNDTIME*/}
            <div className={st.ItemHeader}>
                Roundtime
            </div>
            <div className={st.Speed_Con}>
                <button className={getRoundTimeClass(Settings_Roundtime.Little)} onClick={() => {newSettings(Type.roundtime, Settings_Roundtime.Little)}}>Low</button>
                <button className={getRoundTimeClass(Settings_Roundtime.Normal)} onClick={() => {newSettings(Type.roundtime, Settings_Roundtime.Normal)}}>Normal</button>
                <button className={getRoundTimeClass(Settings_Roundtime.Much)} onClick={() => {newSettings(Type.roundtime, Settings_Roundtime.Much)}}>High</button>
            </div>
            
            {/*AUTO CONTINUE*/}
            <div className={st.ItemHeader}>
                Automatically continue rounds
            </div>
            <div className={st.AutoContinue_Con}>
                <button className={getAutoContinueClass(false)} onClick={() => {newSettings(Type.autoContinue, false)}}>Off</button>
                <button className={getAutoContinueClass(true)} onClick={() => {newSettings(Type.autoContinue, true)}}>On</button>
            </div>

            {/*DRINKING*/}
            <div className={st.ItemHeader}>
                Show Tweet Pictures
            </div>
            <div className={st.Pictures_Con}>
                <button className={getPicturesClass(Settings_Pictures.Off)} onClick={() => {newSettings(Type.pictures, Settings_Pictures.Off)}}>Off</button>
                <button className={getPicturesClass(Settings_Pictures.Instantly)} onClick={() => {newSettings(Type.pictures, Settings_Pictures.Instantly)}}>Instantly</button>
                <button className={getPicturesClass(Settings_Pictures.AtHalftime)} onClick={() => {newSettings(Type.pictures, Settings_Pictures.AtHalftime)}}>Half-Roundtime</button>
            </div>
            
            {/*DRINKING*/}
            <div className={st.ItemHeader}>
                Drinking Mode
            </div>
            <div className={st.DrinkingMode_Con}>
                <button className={getDrinkingClass(Settings_DrinkingMode.Off)} onClick={() => {newSettings(Type.drinking, Settings_DrinkingMode.Off)}}>Off</button>
                <button className={getDrinkingClass(Settings_DrinkingMode.Lightweight)} onClick={() => {newSettings(Type.drinking, Settings_DrinkingMode.Lightweight)}}>Lightweight</button>
                <button className={getDrinkingClass(Settings_DrinkingMode.Regular)} onClick={() => {newSettings(Type.drinking, Settings_DrinkingMode.Regular)}}>Regular</button>
                <button className={getDrinkingClass(Settings_DrinkingMode.Beast)} onClick={() => {newSettings(Type.drinking, Settings_DrinkingMode.Beast)}}>Beast</button>
            </div>
        </div>
    );
}


