import st from './Profiles.module.scss';

import {Twitter_Profile} from 'components/Interfaces'
import {ProfilesUsage} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'

import TwitterProfileList from '../../search/TwitterProfileList'

export default function Profiles(profiles:Twitter_Profile[],
                                 onRemoveProfile:(deletedUser: Twitter_Profile) => void) {
    


    const onRemoveClick = (deletedUser: Twitter_Profile) => {
        onRemoveProfile(deletedUser)
    }

    const getContent = () => {
        if (profiles.length === 0) {
            return  <div className={st.Empty_Con}>
                        The Twitter profiles you selected from the search will appear here
                    </div>
        }
        return <TwitterProfileList
                    parentType={ProfilesUsage.Added}
                    data={profiles}
                    addedUsers={profiles}
                    onAddUser={() => {}}
                    onRemoveUser={onRemoveClick}
                    twitterStatus = {TwitterStatus.none}
                />
    }

    return (
        getContent()
    );
}


