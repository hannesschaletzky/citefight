import React, { useState } from 'react';
import st from './Lobby.module.scss';

import {Profile} from 'components/Interfaces'
import {Settings} from 'components/Interfaces'
import {NotType} from 'components/Interfaces'

import {SettingsProps} from 'components/Functional_Interface'

import AddedProfile_Icon from 'assets/setup/AddedProfile_Icon.png'
import Settings_Icon from 'assets/setup/Settings_Icon.png'

import SettingsComp from './settings/Settings'
import Profiles from './profiles/Profiles'

export default function Lobby(isAdmin:boolean, //first user is admin
                              profiles:Profile[],
                              onRemoveProfile:(profile:Profile) => void,
                              settings:Settings,
                              onSettingsChanged:(newSettings:Settings) => void,
                              newNotification:(msg:string, notType:NotType) => void) {
    const [lobbyIndex, setLobbyIndex] = useState(0) //default to profiles

    const getLobbyContent = () => {
        //PROFILES
        let content = <div></div>
        if (lobbyIndex === 0) {
            content = 
                Profiles(
                    profiles,
                    onRemoveProfile
                )
        }
        //SETTINGS
        else if (lobbyIndex === 1) {

            //create react component from functional 
            let settingsProps:SettingsProps = {
                settings: settings,
                isAdmin: isAdmin,
                onSettingsChanged:onSettingsChanged, 
                newNotification:newNotification
            }
            const comp = React.createElement(SettingsComp, settingsProps)
            content = comp
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
                    <img className={st.Icon} src={AddedProfile_Icon} alt="Answer" title="Profiles to play"/>
                    {profiles.length > 0 &&
                        profiles.length
                    }
                </div>
                <div className={getLobbyNavClass(1)} onClick={() => {setLobbyIndex(1)}}>
                    <img className={st.Icon} src={Settings_Icon} alt="Settings" title="Lobby-Settings"/>
                </div>
            </div>
            <div className={st.Content}>
                {!isAdmin && lobbyIndex === 1 &&
                    <div className={st.No_Admin_Caption}>
                        Only first player can edit settings
                    </div>
                }
                {getLobbyContent()}
            </div>
        </div>
    );
}


