import { useState } from 'react';
import st from './Lobby.module.scss';

import {Twitter_Profile} from 'components/Interfaces'

import AddedProfile_Icon from 'assets/setup/AddedProfile_Icon.png'
import Settings_Icon from 'assets/setup/Settings_Icon.png'

import Settings from './settings/Settings'
import Profiles from './profiles/Profiles'

export default function Lobby(profiles:Twitter_Profile[],
                              onRemoveProfile:(profile:Twitter_Profile) => void) {
    const [lobbyIndex, setLobbyIndex] = useState(0)

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
            content = 
                Settings()
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
                {getLobbyContent()}
            </div>
        </div>
    );
}


