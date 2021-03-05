import {Settings} from 'components/Interfaces'
import {Settings_Roundtime} from 'components/Interfaces'
import {Settings_DrinkingMode} from 'components/Interfaces'
import {Settings_Pictures} from 'components/Interfaces'

export function didUserExceedLimit(timestamps:string[],actionCount:number, timeSpan: number = 15000):boolean {
    //if user wants to send more than 5 messages within 15 seconds -> return true
    //check only as soon as five messages were sent
    actionCount--; //index starts at 0
    let count = timestamps.length - 1;
    if (count < actionCount) {
        return false
    }
    //calc time difference in milliseconds
    let ref = new Date(timestamps[count - actionCount])
    let now = new Date()
    let diff = now.getTime() - ref.getTime(); 
    if (diff < timeSpan) {
        return true
    }
    return false
}

export const initSettings:Settings = {
    rounds: 25,
    roundtime: Settings_Roundtime.Normal,
    autoContinue: true,
    pictures: Settings_Pictures.AtHalftime,
    drinking: Settings_DrinkingMode.Off
}


export function log(value:any):void {
    if (process.env.NODE_ENV === 'development') {
        console.log(value)
    }
}
