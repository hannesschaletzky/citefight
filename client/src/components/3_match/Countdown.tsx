import React, { useEffect, useReducer, useRef } from 'react'
//import st from './RoundCountdown.module.scss';
import {log} from 'components/Logic'


/*
##################################
            EXPORT
##################################
*/
interface Props {
    targetDate: Date
    onFinished:() => void
}
export default function getComponent(targetDate:Date, onFinished:() => void) {
    let props:Props = {
        targetDate: targetDate,
        onFinished: onFinished
    }
    return React.createElement(Countdown, props)
}


/*
##################################
            LOGIC
##################################
*/
interface State {
    triggered: boolean
    seconds: number
}
let init_state:State = {
    triggered: false,
    seconds: -1
}
function Countdown(props:Props) {

    const ref_state = useRef(init_state)
    const [,forceUpdate] = useReducer(x => x + 1, 0)
    
    useEffect(() => {

        if (!ref_state.current.triggered) {
            ref_state.current.triggered = true

            //calc differnce until target date
            let now = new Date()
            let ref = new Date(props.targetDate)
            let diffMS = ref.getTime() - now.getTime() //milliseconds 
            let diffS = Math.round(diffMS/1000) //seconds -> rounded
            
            //set countdown
            log(diffS + ' until start')
            ref_state.current.seconds = diffS
            forceUpdate()
            
            //create finished timeout -> exactly at targettime 
            setTimeout(() => {
                props.onFinished()
            }, diffMS)

            //create countdown timeouts
            let timespan = 1000
            while (diffS > 1) { //>1 -> skip last call
                setTimeout(() => {
                    ref_state.current.seconds -= 1
                    forceUpdate()
                }, timespan)
                timespan += 1000
                diffS -= 1
            }
        }
        else {
            log('ALREADY TRIGGERED')
        }
    })

    return (
        <div>
            {ref_state.current.seconds}
        </div>
    )
}


