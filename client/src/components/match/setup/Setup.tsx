import { useState, useEffect } from 'react';
import st from './Setup.module.scss'

import { useParams } from 'react-router-dom';

import Search from './search/Search'
import Players from './players/Players'
import Chat from './chat/Chat'

import {Twitter_User} from 'components/Interfaces'

const stateInitArray:Twitter_User[] = []

export default function Setup() {
    //state hook
    const [addedUsers, setAddedUsers] = useState(stateInitArray);

    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        
    });

    const addUserFromSearch = (newUser: Twitter_User):void => {
        //you have to put a new object entirely
        //-> see https://stackoverflow.com/questions/59690934/react-hook-usestate-not-updating-ui
        let arr:Twitter_User[] = []
        for(let i = 0;i<addedUsers.length;i++) {
            arr.push(addedUsers[i])
        }
        arr.push(newUser)
        setAddedUsers(arr)
        /*
        setUserObjects(prev => {
            prev.push(newUser)
            return prev
        })
        */
    }

  return (
    <div className={st.Content_Con}>
        <div className={st.Left_Panel}>
            {Search(addUserFromSearch, addedUsers)}
        </div>
        <div className={st.Center_Panel}>
            {addedUsers.length}
        </div>
        <div className={st.Right_Panel}>
            {Players()}
            {Chat()}
        </div>
    </div>
  );
}










