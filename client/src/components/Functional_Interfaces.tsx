import {Settings} from 'components/Interfaces'
import {NotType} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'

export interface SettingsProps {
    settings: Settings
    isAdmin:boolean
    onSettingsChanged:(newSettings:Settings) => void
    newNotification:(msg:string, notType:NotType) => void
}
export interface PopularProfilesProps {
    popularProfiles:Profile[]
    addProfile:(profile:Profile) => void
}
export interface SearchProps {
    profiles:Profile[]
    addProfile:(profile:Profile) => void
    newNotification:(msg:string, notType:NotType) => void
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
export interface NavProps {
    profiles: Profile[]
    onSelectAnswer: (profile:Profile) => void
}
export interface RankingProps {
    test: string
}