import st from './Info.module.scss';

//interfaces
import {Profile} from 'components/Interfaces'
import {ProfilesUsage} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'
//components
import TwitterProfileList from '../search/TwitterProfileList'

export default function Info(profiles:Profile[],
                            addUserFunc:(par1: Profile) => void) {

    return (
        <div className={st.Con}>
            <div className={st.Caption}>
                Popular Profiles
            </div>
            <TwitterProfileList
                parentType={ProfilesUsage.Search}
                data={profiles}
                addedUsers={profiles}
                onAddUser={addUserFunc}
                onRemoveUser={() => {}}
                twitterStatus = {TwitterStatus.none}
            />
        </div>
    )
}


