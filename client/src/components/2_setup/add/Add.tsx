import React, { useState } from 'react';
import st from './Add.module.scss';
//import {log} from 'components/Logic'
//ui-elements
import Search_Icon from 'assets/setup/Search_Icon.png'
import Ranking_Icon from 'assets/setup/Ranking_Icon.png'
//interfaces
import {Profile} from 'components/Interfaces'
import {NotType} from 'components/Interfaces'
//functional-interfaces
import {PopularProfilesProps} from 'components/Functional_Interfaces'
import {SearchProps} from 'components/Functional_Interfaces'
//components
import Search from './search/Search'
import PopularProfiles from './profiles/PopularProfiles'

export default function Add(  profiles:Profile[],
                              popularProfiles:Profile[],
                              addProfile:(profile:Profile) => void,
                              newNotification:(msg:string, notType:NotType) => void) {
    const [lobbyIndex, setLobbyIndex] = useState(0) //default to search
    
    const getLobbyContent = () => {
        
        let content = <div></div>
        //SEARCH
        if (lobbyIndex === 0) {
            let props:SearchProps = {
                profiles: profiles,
                addProfile: addProfile,
                newNotification: newNotification
            }
            const comp = React.createElement(Search, props)
            content = comp
        }
        //POPULAR PROFILES
        else if (lobbyIndex === 1) {
            let props:PopularProfilesProps = {
                popularProfiles:popularProfiles,
                addProfile:addProfile
            }
            const comp = React.createElement(PopularProfiles, props)
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
                    <img className={st.Icon} src={Search_Icon} alt="Search" title="Search Twitter"/>
                </div>
                <div className={getLobbyNavClass(1)} onClick={() => {setLobbyIndex(1)}}>
                    <img className={st.Icon} src={Ranking_Icon} alt="Profiles" title="Popular Profiles"/>
                </div>
            </div>
            <div className={st.Content}>
                {getLobbyContent()}
            </div>
        </div>
    );
}


