import React from 'react'
import st from './Tweet.module.scss'
import {log} from 'components/Logic'

//interfaces
import {Tweet} from 'components/Interfaces'
//ui-elements
import VerifiedIcon from 'assets/tweet/VerifiedIcon.png'
import TwitterIcon from 'assets/tweet/Twitter_Icon.png'
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

        //determine if name contains emoji
        let userNameClass = st.UserName
        if (/\p{Extended_Pictographic}/u.test(tweet.t_userName) ) {
            userNameClass = st.UserName_Emoji
        }

        //split text into spans if it contains #hastags or @links
        log(tweet.c_text)

        //FROM HERE: https://stackoverflow.com/a/25693471
        function findSpecialWords(searchText:string, links:boolean=false) {
            let regexp = /(\s|^)\#\w\w+\b/gm
            if (links) {
                regexp = /(\s|^)\@\w\w+\b/gm
            }
            let result = searchText.match(regexp)
            if (result) {
                result = result.map(function(s:any){ return s.trim();})
                return result
            } else {
                return false
            }
        }


        /*
            Hashtags AND Usernames can only contain letters, numbers, and underscores (_) 
            -> no special characters
        */

        //EXTRACT ALL HASHTAGS
        let foundHastags:RegExpMatchArray = []
        let hashtags = findSpecialWords(tweet.c_text)
        if (hashtags) {foundHastags = hashtags}
        log(hashtags)
        //EXTRACT ALL LINKS
        let foundTags:RegExpMatchArray = []
        let tags = findSpecialWords(tweet.c_text, true)
        if (tags) {foundTags = tags}
        log(tags)
        //split at line breaks
        let blocks = tweet.c_text.split(/\r?\n/)
        log(blocks)

        function isHashtag(word:string):boolean {
            for(let i=0;i<foundHastags.length;i++) {
                if (foundHastags[i] === word) {return true}
            }
            return false
        }
        function isUsertag(word:string):boolean {
            for(let i=0;i<foundTags.length;i++) {
                if (foundTags[i] === word) {return true}
            }
            return false
        }

        /*
            Now back to Bundesliga business... 😉 
            #TAGHeuerCarrera #DontCrackUnderPressure
            @tagheuer
            @Bundesliga_EN
        */
        //-> <span>This i a <span className={st.Text_Link}>Test</span>bro!</span>
        let text = [<span></span>]
        text = []
        //loop each block
        for(let i=0;i<blocks.length;i++) {
            //split block
            let words = blocks[i].split(/[ ,.;?!]+/)
            //loop each word
            for(let j=0;j<words.length;j++) {
                let word = words[j]
                if (isHashtag(word)) {
                    text.push(  <a className={st.Link} href={"https://twitter.com/hashtag/" + word.substring(1)} target="_blank" rel="noreferrer" title="View hastag">
                                    <span className={st.Text_Link}>{word}</span>
                                </a>)
                }
                else if (isUsertag(word)) {
                    text.push(  <a className={st.Link} href={"https://twitter.com/" + word.substring(1)} target="_blank" rel="noreferrer" title="View profile">
                                    <span className={st.Text_Link}>{word}</span>
                                </a>)
                }
                else {
                    text.push(<span className={st.Text}>{word}</span>)
                }
                text.push(<span> </span>) //insert space
            }
            //line break after block -> not at last
            if (i < blocks.length-1) {
                text.push(<br/>)
            }
        }
        

        let content = 
        <div className ={st.Con}>
            <div className ={st.Inside_Con}>
                {/*TOP*/}
                <div className={st.Top_Con}>
                    <a href={tweet.t_profileURL} target="_blank" rel="noreferrer" title="View twitter profile">
                        <img className={st.Pic} src={tweet.t_userPicURL} alt="User"/>
                    </a>
                    <div className={st.UserCard_Con}>
                        <div className={st.Names_Con}>
                            <div className={st.UserName_Con}>
                                <div className={userNameClass} title={tweet.t_userName}>
                                    {tweet.t_userName}
                                </div>
                                {tweet.t_userVerified && <img className={st.Verified_Icon} src={VerifiedIcon} title="Verified User" alt="Verified"/>}
                            </div>
                            <div className={st.UserTag}>
                                @{tweet.t_userTag}
                            </div>
                        </div>
                        <a href={tweet.t_tweetURL} target="_blank" rel="noreferrer" title="View tweet">
                            <img className={st.Twitter_Icon} src={TwitterIcon} alt="Tweet"/>
                        </a>
                    </div>
                </div>
                {/*CONTENT  <span className={st.Text_1}>This is a</span> <span className={st.Text_2}>Test</span> */}
                <div className={st.Content_Con}>
                    <div className={st.Text_Con}>
                        <span>{text}</span>
                    </div>
                </div>
                {/*BOTTOM*/}
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




