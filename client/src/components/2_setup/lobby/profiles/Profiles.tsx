import st from './Profiles.module.scss';

//interfaces
import {Profile} from 'components/Interfaces'
import {ProfilesUsage} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'
//components
import TwitterProfileList from 'components/00_shared/profiles/TwitterProfileList'

export default function Profiles(profiles:Profile[],
                                 onRemoveProfile:(deletedUser: Profile) => void) {
    
    const onRemoveClick = (deletedUser: Profile) => {
        onRemoveProfile(deletedUser)
    }

    const getContent = () => {
        if (profiles.length === 0) {
            return  <div className={st.Empty_Con}>
                        Add profiles to play from the search or the popular profiles section on the left
                    </div>
        }
        return <TwitterProfileList
                    parentType={ProfilesUsage.Added}
                    data={profiles}
                    onRemoveUser={onRemoveClick}
                />
    }

    return (
        getContent()
    );
}


