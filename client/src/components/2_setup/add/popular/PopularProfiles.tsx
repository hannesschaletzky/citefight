import st from './PopularProfiles.module.scss';

//interfaces
import {ProfilesUsage} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'
//functional-interfaces
import {PopularProfilesProps} from 'components/Functional_Interfaces'
//components
import TwitterProfileList from 'components/00_shared/profiles/TwitterProfileList'

export default function PopularProfiles(props:PopularProfilesProps) {

    return (
        <div className={st.Con}>
            <TwitterProfileList
                parentType={ProfilesUsage.Search}
                data={props.popularProfiles}
                onAddUser={props.addProfile}
            />
        </div>
    )
}


