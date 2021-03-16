import {Profile} from 'components/Interfaces'
import {ChatMsg} from 'components/Interfaces'
import * as Not from 'components/00_shared/notification/Notification'
import * as Settings from 'components/00_shared/settings/Settings'


export interface PopularProfilesProps {
    popularProfiles:Profile[]
    addProfile:(profile:Profile) => void
}
export interface SearchProps {
    profiles:Profile[]
    addProfile:(profile:Profile) => void
    newNotification:(msg:string, notType:Not.Type) => void
}
export interface JoinProps {
    pusherClient:any
    onNewClient:(newClient:any) => void
}
export interface SetupProps {
    pusherClient:any
}
export interface MatchProps {
    pusherClient:any
}
export interface NextRoundCountdownProps {
    targetDate: Date
    onFinished:() => void
}

/*
    NAVIGATION PANEL IN MATCH
*/
export interface RankingProps {
    test: string
}
export interface ChatProps {
    messages: ChatMsg[]
    onNewMessage: (newMsg:ChatMsg) => void
}