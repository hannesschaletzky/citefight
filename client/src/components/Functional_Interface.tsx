import {Setup_Settings} from 'components/Interfaces'
import {NotificationType} from 'components/Interfaces'

export interface SettingsProps {
    settings: Setup_Settings;
    isAdmin:boolean;
    onSettingsChanged:(newSettings:Setup_Settings) => void;
    newNotification:(msg:string, notType:NotificationType) => void;
}