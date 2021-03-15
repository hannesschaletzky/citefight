import React, { useState, useEffect } from 'react';
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
    type: Type
    msg: string
}

/*
##################################
            EXPORT
##################################
*/
export const init:Notification = {
    type: Type.Init,
    msg: ''
}
interface Props {
    type: Type
    msg: string
}
export const getComponent = (not:Notification) => {
    let props:Props = {
        type: not.type,
        msg: not.msg
    }
    return React.createElement(NotificationLogic, props)
}

/*
##################################
            LOGIC
##################################
*/
function NotificationLogic(props:Props) {

    const [show, setShow] = useState(true) //default to profiles

    useEffect(() => {
        setTimeout(() => hideNotification(), 2000)
    })

    const hideNotification = () => {
        setShow(false)
    }

    const getClass = (type:Type) => {
        console.log(type)
        if (type === Type.Success) {
            return st.Success
        }
        else if (type === Type.Warning) {
            return st.Warning
        }
        else if (type === Type.Error) {
            return st.Error
        }
        return st.none
    }

    return (
        <div>
            {show && 
                <div className={getClass(props.type)} onClick={() => hideNotification()}>
                    <div className={st.Text}>
                        {props.msg}
                    </div>
                    <div className={st.Close}>
                        x
                    </div>
                </div>
            }
        </div>
    )
}


