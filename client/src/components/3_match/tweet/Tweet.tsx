import React from 'react'
import st from './Tweet.module.scss'
//interfaces
import {Tweet} from 'components/Interfaces'

//ui-elements
import Reply_Icon from 'assets/tweet/Reply.png'
import Retweet_Icon from 'assets/tweet/Retweet.png'
import Like_Icon from 'assets/tweet/Like.png'

/*
##################################
            EXPORT
##################################
*/
export const getComponent = (tweet:Tweet) => {
    return React.createElement(TweetLogic, tweet)
}

/*
##################################
            LOGIC
##################################
*/

//from: https://stackoverflow.com/a/9462382/6421228
const nFormatter = (input: string, digits = 2) => {

    let num: number = +input

    let si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ]
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/
    let i
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol
}

function TweetLogic(tweet:Tweet) {

    const getContent = () => {

        let content = 

        <div className ={st.Con}>
            <div className ={st.Inside_Con}>
                <div className={st.Top_Con}>
                    TOP
                </div>
                <div className={st.Content_Con}>
                    HERE COMES THE CONTENT
                </div>
                <div className={st.Bot_Con}>
                    <div className={st.Data_Con}>
                        <img className={st.Bot_Icon} src={Reply_Icon} alt="Reply"/>
                        <div className={st.Bot_Number}>{nFormatter(tweet.b_replyCount)}</div>
                    </div>
                    <div className={st.Data_Con}>
                        <img className={st.Bot_Icon_Retweet} src={Retweet_Icon} alt="Retweet"/>
                        <div className={st.Bot_Number}>{nFormatter(tweet.b_retweetCount)}</div>
                    </div>
                    <div className={st.Data_Con}>
                        <img className={st.Bot_Icon_Like} src={Like_Icon} alt="Like"/>
                        <div className={st.Bot_Number}>{nFormatter(tweet.b_likeCount)}</div>
                    </div>
                </div>
            </div>
        </div>

        return content
    }

    return (
        getContent()
    )
}




