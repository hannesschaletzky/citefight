import { useEffect, useReducer, useRef } from 'react'
//import st from './RoundCountdown.module.scss';
import {log} from 'components/Logic'

import {NextRoundCountdownProps} from 'components/Functional_Interfaces'

interface State {
    triggered: boolean
    seconds: number
}
let init_state:State = {
    triggered: false,
    seconds: -1
}
export default function RoundCountdown(props:NextRoundCountdownProps) {
    const ref_state = useRef(init_state)
    const [,forceUpdate] = useReducer(x => x + 1, 0)
    
    useEffect(() => {

        if (!ref_state.current.triggered) {
            ref_state.current.triggered = true

            let now = new Date()
            let ref = new Date(props.targetDate)
            let diff = Math.round((ref.getTime() - now.getTime())/1000)
            log(diff + ' until start')
            ref_state.current.seconds = diff

            //create finished timeout
            setTimeout(() => {
                props.onFinished()
            }, diff * 1000)

            //create countdown timeouts
            let timespan = 1000
            while (diff > 1) {
                setTimeout(() => {
                    ref_state.current.seconds -= 1
                    forceUpdate()
                }, timespan)
                timespan += 1000
                diff -= 1
            }

            forceUpdate()
        }
    })

    return (
        <div>
            {ref_state.current.seconds}
        </div>
    )
}


