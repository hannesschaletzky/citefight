/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useReducer } from 'react';
import st from './Notification.module.scss';

/*
##################################
            TYPES
##################################
*/
export enum Type {
    Init = 'INIT',
    Success = 'Success',
    Warning = 'Warning',
    Error = 'Error'
}
export interface Notification {
    id: string
    type: Type
    msg: string
    disapearAfter: number //milliseconds
}

/*
##################################
            EXPORT
##################################
*/
export const init:Notification = {
    id: new Date().toISOString(),
    type: Type.Init,
    msg: '',
    disapearAfter: 1
}
export const getComponent = (not:Notification) => {
    return React.createElement(NotificationLogic, not)
}

/*
##################################
            LOGIC
##################################
*/
function NotificationLogic(not:Notification) {

    const ref_show = useRef(true)
    const ref_current = useRef(init)
    const ref_timeout = useRef(setTimeout(() => {}, 1))
    const [,forceUpdate] = useReducer(x => x + 1, 0)

    useEffect(() => {
        //only show new notification
        if (ref_current.current.id !== not.id) {
            //console.log('new not: ' + not.id)
            ref_current.current = not
            ref_show.current = true
            clearTimeout(ref_timeout.current)
            ref_timeout.current = setTimeout(() => hideNotification(), not.disapearAfter)
            forceUpdate()
        }
        else {
            ref_show.current = false
        }
    })

    const hideNotification = () => {
        ref_show.current = false
        clearTimeout(ref_timeout.current)
        forceUpdate()
    }

    const getClass = (type:Type) => {
        if (type === Type.Success) {
            return st.Success
        }
        else if (type === Type.Warning) {
            return st.Warning
        }
        else if (type === Type.Error) {
            return st.Error
        }
        return st.Init
    }

    const getNot = () => {
        let rtn = <div></div>
        if (ref_show.current) {
            rtn = 
            <div className={getClass(not.type)} onClick={() => hideNotification()}>
                <div className={st.Text}>
                    {not.msg}
                </div>
                <div className={st.Close}>
                    x
                </div>
            </div>
        }
        return rtn
    }

    return (
        getNot()
    )
}


