import st from './Profiles.module.scss';

import {Twitter_Profile} from 'components/Interfaces'
import {ProfilesUsage} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'

import TwitterProfileList from '../search/TwitterProfileList'

export default function Profiles(profiles:Twitter_Profile[],
                                 onRemoveProfile:(deletedUser: Twitter_Profile) => void) {
    


    const onRemoveClick = (deletedUser: Twitter_Profile) => {
        onRemoveProfile(deletedUser)
    }

    return (
        <div className={st.Con}>
            {profiles.length === 0 &&
                <div className={st.Empty_Con}>
                    The Twitter profiles you selected from the search will appear here
                </div>
            }
            {profiles.length > 0 &&
                <div className={st.Caption}>
                    Total: {profiles.length} 
                </div>
            }
            <TwitterProfileList
                parentType={ProfilesUsage.Added}
                data={profiles}
                addedUsers={profiles}
                onAddUser={() => {}}
                onRemoveUser={onRemoveClick}
                twitterStatus = {TwitterStatus.none}
            />
        </div>
    );
}


