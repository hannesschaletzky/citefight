import React from 'react'
import st from './Tweet.module.scss'
//interfaces
import {Tweet} from 'components/Interfaces'

/*
##################################
            EXPORT
##################################
*/
interface Props {
    tweet: Tweet
}
export const getComponent = (tweet:Tweet) => {
    let props:Props = {
        tweet: tweet
    }
    return React.createElement(TweetLogic, props)
}

/*
##################################
            LOGIC
##################################
*/

function TweetLogic(props:Props) {

    const getContent = () => {

        let content = 

        <div className ={st.Box} >
            <div className={st.Top_Con}>
                TOP
            </div>
            <div className={st.Mid_Con}>
                <div className={st.Text}>
                    HERE COMES THE CONTENT
                </div>
            </div>
            <div className={st.Bottom_Con}>
                BOTTOM
            </div>
        </div>

        return content
    }

    return (
        getContent()
    )
}




