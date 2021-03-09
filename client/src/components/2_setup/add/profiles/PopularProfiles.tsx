import st from './PopularProfiles.module.scss';

//interfaces
import {ProfilesUsage} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'
//functional-interfaces
import {PopularProfilesProps} from 'components/Functional_Interfaces'
//components
import TwitterProfileList from '../../search/TwitterProfileList'

export default function PopularProfiles(props:PopularProfilesProps) {

    return (
        <div className={st.Con}>
            <TwitterProfileList
                parentType={ProfilesUsage.Search}
                data={props.popularProfiles}
                addedUsers={props.popularProfiles}
                onAddUser={props.addProfile}
                onRemoveUser={() => {}}
                twitterStatus = {TwitterStatus.none}
            />
        </div>
    )
}


