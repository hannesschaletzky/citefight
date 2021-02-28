import React, { useRef, useEffect } from 'react';
import st from './Settings.module.scss';

import {didUserExceedLimit} from 'components/Logic'

import {NotificationType} from 'components/Interfaces'

import {SettingsProps} from 'components/Functional_Interface'

enum Type {
    rounds,
    gamespeed,
    drinking,
}

let messageTimestamps:string[] = []

/*
export default function Settings(settings:Setup_Settings,
                                isAdmin:boolean,
                                onSettingsChanged:(newSettings:Setup_Settings) => void,
                                newNotification:(msg:string, notType:NotificationType) => void) {
*/

export default function Settings(props:SettingsProps) {

    //ref for rounds to update
    const roundsRef = useRef<null | HTMLInputElement>(null)
    useEffect(() => {
        if (roundsRef.current !== null) {
            roundsRef.current.value = '' + props.settings.rounds
        }
    })



    const newSettings = (type:Type, value:any) => {

        //check actions (editing rounds excluded)
        if (didUserExceedLimit(messageTimestamps, 60) && type !== Type.rounds) {
            props.newNotification('Too many actions, small cooldown', NotificationType.Not_Warning)
            return
        }

        //determine value to change
        if (type === Type.rounds) {
            if (value <= 0 || value > 200) {
                props.newNotification('Valid rounds between 1 and 200', NotificationType.Not_Warning)
                return
            }
            props.settings.rounds = value
        }
        else if (type === Type.gamespeed) {
            props.settings.gamespeed = value
        }
        else if (type === Type.drinking) {
            props.settings.drinking = value
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

    const getSpeedClass = (btnIndex:number) => {
        if (btnIndex === props.settings.gamespeed) {
            return st.Button_Speed_Active
        }
        return st.Button_Speed
    }

    const getDrinkingClass = (btnIndex:number) => {
        if (btnIndex === props.settings.drinking) {
            return st.Button_Drinking_Active
        }
        return st.Button_Drinking
    }

    return (
        <div className={props.isAdmin ? st.Con : st.Con_NoAdmin}>
            <div className={st.ItemHeader}>
                Rounds
            </div>
            <div className={st.Rounds_Con}>
                <input  className={st.Rounds_Input}
                    ref={roundsRef}
                    type="number"
                    onChange={(e) => newSettings(Type.rounds, e.target.value)}
                />
            </div>

            <div className={st.ItemHeader}>
                Speed
            </div>
            <div className={st.Speed_Con}>
                <button className={getSpeedClass(0)} onClick={() => {newSettings(Type.gamespeed, 0)}}>Slow</button>
                <button className={getSpeedClass(1)} onClick={() => {newSettings(Type.gamespeed, 1)}}>Medium</button>
                <button className={getSpeedClass(2)} onClick={() => {newSettings(Type.gamespeed, 2)}}>Fast</button>
                <button className={getSpeedClass(3)} onClick={() => {newSettings(Type.gamespeed, 3)}}>Custom</button>
            </div>
            <div className={st.ItemHeader}>
                Drinking Mode
            </div>
            <div className={st.DrinkingMode_Con}>
                <button className={getDrinkingClass(0)} onClick={() => {newSettings(Type.drinking, 0)}}>Off</button>
                <button className={getDrinkingClass(1)} onClick={() => {newSettings(Type.drinking, 1)}}>On</button>
            </div>


            <div>Time per Round?</div>
            <div>Auto Continue?</div>
            <div>Pictures?</div>
            <div>Pictures after time?</div>
            <div>Drinking Mode Difficulty</div>
        </div>
    );
}


