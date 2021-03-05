import {Settings} from 'components/Interfaces'
import {NotificationType} from 'components/Interfaces'

export interface SettingsProps {
    settings: Settings;
    isAdmin:boolean;
    onSettingsChanged:(newSettings:Settings) => void;
    newNotification:(msg:string, notType:NotificationType) => void;
}