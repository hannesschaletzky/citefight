import { useState, useEffect } from 'react';
import st from './Setup.module.scss'

import { useParams } from 'react-router-dom';

import Search from './search/Search'

import {Twitter_User} from 'components/Interfaces'

const stateInitArray:Twitter_User[] = []

export default function Setup() {
    //state hook
    const [userObjects, setUserObjects] = useState(stateInitArray);

    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        
    });

    const addUserFromSearch = (newUser: Twitter_User):void => {
        console.log('adding user in setup top screen: ' + newUser.screen_name)
        let _userObjects = userObjects
        _userObjects.push(newUser)
        setUserObjects(_userObjects)
    }

  return (

    <div className={st.Content_Con}>
        <div className={st.Left_Panel}>
            {Search(addUserFromSearch)}
        </div>
        <div className={st.Center_Panel}>
            {userObjects.length}
        </div>
        <div className={st.Right_Panel}>
            RIGHT PANEL
        </div>
    </div>
  );
}










