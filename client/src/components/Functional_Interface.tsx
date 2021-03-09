import {Settings} from 'components/Interfaces'
import {NotType} from 'components/Interfaces'

export interface SettingsProps {
    settings: Settings;
    isAdmin:boolean;
    onSettingsChanged:(newSettings:Settings) => void;
    newNotification:(msg:string, notType:NotType) => void;
}
export interface JoinProps {
    pusherClient:any;
    onNewClient:(newClient:any) => void;
}
export interface SetupProps {
    pusherClient:any;
}
export interface MatchProps {
    pusherClient:any;
}