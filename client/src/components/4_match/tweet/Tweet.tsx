import React from 'react'
import st from './Tweet.module.scss'

//interfaces
import {Tweet} from 'components/Interfaces'
//ui-elements
import VerifiedIcon from 'assets/tweet/VerifiedIcon.png'
import TwitterIcon from 'assets/tweet/Twitter_Icon.png'
import Reply_Icon from 'assets/tweet/Reply.png'
import Retweet_Icon from 'assets/tweet/Retweet.png'
import Like_Icon from 'assets/tweet/Like.png'
import QuestionMark from 'assets/tweet/QuestionMark.png'


/*
##################################
            EXPORT
##################################
*/
interface Props {
    tweet: Tweet
    showImages: boolean
    fadeInClass: string
    onPicClick:(picURL:string) => void
}
export const getComponent = (tweet:Tweet, showImages:boolean, fadeInClass:string, onPicClick:(picURL:string) => void) => {
    let props:Props = {
        tweet: tweet,
        showImages: showImages,
        fadeInClass: fadeInClass,
        onPicClick: onPicClick
    }
    return React.createElement(TweetLogic, props)
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

function TweetLogic(props:Props) {

    const formatDate = (input:string):string => {
        let parsed = new Date(input).toDateString() 
        //parsed: Fri Feb 21 2017
        let parts = parsed.split(' ')
        return `${parts[2]} ${parts[1]} ${parts[3]}`
    }

    const getContent = () => {

        //log(props.tweet)

        //determine if name contains emoji
        let userNameClass = st.UserName
        if (/\p{Extended_Pictographic}/u.test(props.tweet.t_userName) ) {
            userNameClass = st.UserName_Emoji
        }

        /*
        ###########################
                TEXT
        ###########################
        */

         /*
            TODO:
                https://stackoverflow.com/a/27422629/6421228
                https://dev.w3.org/html5/html-author/charref

                -> https://ascii.cl/htmlcodes.htm !!!!!!

                q
                -> ampersand (&) is escaped to &amp; 
                convert HTML codes into characters -> https://ascii.cl/htmlcodes.htm 

                let htmlChars = {
                    quot: '"',
                    amp: '&',
                    lt: '<',
                    gt: '>',
                }
        */
        
        //https://stackoverflow.com/a/43282001
        function convertHTMLEntity(text:string){
            const span = document.createElement('span')
            return text
            .replace(/&[#A-Za-z0-9]+;/gi, (entity,position,text)=> {
                span.innerHTML = entity
                return span.innerText
            });
        }
        let dec_tweetText = convertHTMLEntity(props.tweet.c_text)
        //log(dec_tweetText)


        /*
        Hashtags AND Usernames can only contain letters, numbers, and underscores (_) 
        -> no special characters
        */
        //FROM HERE: https://stackoverflow.com/a/25693471
        function findSpecialWords(searchText:string, links:boolean=false) {
            let regexp = /(\s|^)#\w\w+\b/gm
            if (links) {
                regexp = /(\s|^)@\w\w+\b/gm
            }
            let result = searchText.match(regexp)
            if (result) {
                result = result.map(function(s:any){ return s.trim();})
                return result
            } else {
                return false
            }
        }

        //log(props.tweet.c_text)
        //EXTRACT HASHTAGS
        let foundHastags:RegExpMatchArray = []
        let hashtags = findSpecialWords(dec_tweetText)
        if (hashtags) {foundHastags = hashtags}
        //log(hashtags)
        //EXTRACT USERTAGS
        let foundTags:RegExpMatchArray = []
        let tags = findSpecialWords(dec_tweetText, true)
        if (tags) {foundTags = tags}
        //log(tags)
        //split at line breaks
        let blocks = dec_tweetText.split(/\r?\n/)
        //log(blocks)

        function isHashtag(word:string):string {
            for(let i=0;i<foundHastags.length;i++) {
                //also detect: #MalalaDay,
                if (word.indexOf(foundHastags[i]) >= 0) {return foundHastags[i]}
            }
            return ""
        }
        function isUsertag(word:string):string {
            for(let i=0;i<foundTags.length;i++) {
                //also detect: #MalalaDay,
                if (word.indexOf(foundTags[i]) >= 0) {return foundTags[i]}
            }
            return ""
        }
        //get random key
        let key = 0
        function grk():string {
            return '' + key++
        }

        /*
            Wishing a very happy birthday to @Malala! 
            To celebrate #MalalaDay, join me and the @GirlsAlliance
            in our work to empower girls around the world. 
            Check out http://girlsopportunityalliance.org to learn more and get involved.
            -> split text into spans if it contains #hastags or @links
        */

        //determine images included 
        let textConClass = st.Text_Con
        let textClass = st.Text
        let textLinkClass = st.Text_Link
        //-> only adjust to image css when image is finally shown
        if (props.tweet.c_photo1 !== '' && props.showImages) {
            textConClass = st.Text_Con_Pictures
            textClass = st.Text_Pictures
            textLinkClass = st.Text_Link_Pictures
        }

        let text = [<span key="-1"></span>]
        text = []
        //loop each block
        for(let i=0;i<blocks.length;i++) {
            //split block
            let words = blocks[i].split(/[ ]+/)
            //loop each word
            for(let j=0;j<words.length;j++) {
                let word = words[j]

                //determine word category
                let hashtag = isHashtag(word)
                let usertag = isUsertag(word)
                let link = false

                //links are displayed like this: https://t.co/cGyWghlVcH
                if (word.indexOf('https://t.co/') === 0) {
                    link = true
                }
                //hashtag
                if (hashtag !== "") {
                    text.push(  <a className={st.Link} key={grk()} href={"https://twitter.com/hashtag/" + word.substring(1)} target="_blank" rel="noreferrer" title="View hastag">
                                    <span className={textLinkClass} key={grk()}>{hashtag}</span>
                                </a>)
                    let rest = word.replace(hashtag, "") //like: '#MalalaDay,' -> ','
                    if (rest !== "") {
                        text.push(<span className={textClass} key={grk()}>{rest}</span>)
                    }
                }
                //usertag
                else if (usertag !== "") {
                    text.push(  <a className={st.Link} key={grk()} href={"https://twitter.com/" + word.substring(1)} target="_blank" rel="noreferrer" title="View profile">
                                    <span className={textLinkClass} key={grk()}>{usertag}</span>
                                </a>)
                    let rest = word.replace(usertag, "") //like: '@Malala!' -> '!'
                    if (rest !== "") {
                        text.push(<span className={textClass} key={grk()}>{rest}</span>)
                    }
                }
                else if (link) {
                    text.push(  <a className={st.Link} key={grk()} href={word} target="_blank" rel="noreferrer" title="View content">
                                    <span className={textLinkClass} key={grk()}>{word}</span>
                                </a>)
                }
                //normal word
                else {
                    text.push(<span className={textClass} key={grk()}>{word}</span>)
                }
                //insert space after each word
                text.push(<span key={grk()}> </span>)
            }
            //line break after block -> not at last one
            if (i < blocks.length-1) {
                text.push(<br key={grk()}></br>)
            }
        }

        /*
        ###########################
                PICTURES
        ###########################
        */

        const show = (picUrl:string) => {
            props.onPicClick(picUrl)
        }

        let pic1 = props.tweet.c_photo1
        let pic2 = props.tweet.c_photo2
        let pic3 = props.tweet.c_photo3
        let pic4 = props.tweet.c_photo4

        let count = 0
        if (pic1 !== "") {count++}
        if (pic2 !== "") {count++}
        if (pic3 !== "") {count++}
        if (pic4 !== "") {count++}

        let picturesComponent = <div></div>

        //ONE
        if (count === 1) {
            picturesComponent = 
            <div className={st.Images_Con}>
                <img className={st.OnePic} src={pic1} alt="" onClick={() => {show(pic1)}}/>
            </div>
        }
        else if (count === 2) {
            picturesComponent = 
            <div className={st.Images_Con}>
                <img className={st.Two_Left} src={pic1} alt="" onClick={() => {show(pic1)}}/>
                <img className={st.Two_Right} src={pic2} alt="" onClick={() => {show(pic2)}}/>
            </div>
        }
        else if (count === 3) {
            picturesComponent =  
                <div className={st.Images_Con}>
                    <div className={st.Three_Left_Con}>
                        <img className={st.Three_Left} src={pic1} alt="" onClick={() => {show(pic1)}}/>
                    </div>
                    <div className={st.Three_Right_Con}>
                        <div className={st.Three_Right_Top_Con}>
                            <img className={st.Three_Right_Top} src={pic2} alt="" onClick={() => {show(pic2)}}/>
                        </div>
                        <div className={st.Three_Right_Bottom_Con}>
                            <img className={st.Three_Right_Bottom} src={pic3} alt="" onClick={() => {show(pic3)}}/>
                        </div>
                    </div>
                </div>
        }
        else if (count === 4) {
            picturesComponent =  
                <div className={st.Images_Con}>
                    <div className={st.Four_Left_Con}>
                        <div className={st.Four_Left_Top_Con}>
                            <img className={st.Four_Left_Top} src={pic1} alt="" onClick={() => {show(pic1)}}/>
                        </div>
                        <div className={st.Four_Left_Bottom_Con}>
                            <img className={st.Four_Left_Bottom} src={pic2} alt="" onClick={() => {show(pic2)}}/>
                        </div>
                    </div>
                    <div className={st.Four_Right_Con}>
                        <div className={st.Four_Right_Top_Con}>
                            <img className={st.Four_Right_Top} src={pic3} alt="" onClick={() => {show(pic3)}}/>
                        </div>
                        <div className={st.Four_Right_Bottom_Con}>
                            <img className={st.Four_Right_Bottom} src={pic4} alt="" onClick={() => {show(pic4)}}/>
                        </div>
                    </div>
                </div>
        }

        /*
        ##############################
                COMPOSE TWEET
        ##############################
        */

        //TOP COMPONENT + ICONS
        let topClass = st.Top_Con
        let userIconComp = <div></div>
        let userVerifiedComp = <div></div>
        let tweetIconComp = <div></div>

        //disable
        if (props.tweet.t_profileURL === '') {
            userIconComp = 
                <img className={st.Pic} src={QuestionMark} alt="User"/>
            userVerifiedComp =
                <img className={st.Verified_Icon_Disabled} src={VerifiedIcon} alt="Verified"/>
        }
        //own pick OR Solution
        else {

            //toggle fade in when given 
            if (props.fadeInClass !== '') {
                topClass = props.fadeInClass
            }

            userIconComp = 
                <a href={props.tweet.t_profileURL} target="_blank" rel="noreferrer" title="View twitter profile">
                    <img className={st.Pic} src={props.tweet.t_userPicURL} alt="User"/>
                </a>
            userVerifiedComp =
                <img className={st.Verified_Icon} src={VerifiedIcon} title="Verified User" alt="Verified"/>
        }

        //Twitter Icon
        //disable always 
        if (props.tweet.t_tweetURL === '') {
            tweetIconComp = 
                <img className={st.Twitter_Icon_Disabled} src={TwitterIcon} alt="Tweet"/>
        }
        //except when solution is displayed
        else {
            //-> only enable clicking on twitter icon when solution is here
            topClass = st.Top_Con_Fade_In_Solution
            tweetIconComp = 
                <a href={props.tweet.t_tweetURL} target="_blank" rel="noreferrer" title="View tweet">
                    <img className={st.Twitter_Icon} src={TwitterIcon} alt="Tweet"/>
                </a>
        }

        let content = 
        <div className ={st.Con}>
            <div className ={st.Inside_Con}>
                {/*TOP*/}
                <div className={topClass}>
                    {userIconComp}
                    <div className={st.UserCard_Con}>
                        <div className={st.Names_Con}>
                            <div className={st.UserName_Con}>
                                <div className={userNameClass} title={props.tweet.t_userName}>
                                    {props.tweet.t_userName}
                                </div>
                                {props.tweet.t_userVerified && userVerifiedComp}
                            </div>
                            <div className={st.UserTag}>
                                @{props.tweet.t_userTag}
                            </div>
                        </div>
                        {tweetIconComp}
                    </div>
                </div>
                {/*CONTENT*/}
                <div className={st.Content_Con}>
                    <div className={textConClass}>
                        <span>{text}</span>
                    </div>
                    {props.showImages && picturesComponent}
                    <div className={st.Date_Con}>
                        {formatDate(props.tweet.b_date)}
                    </div>
                </div>
                {/*BOTTOM*/}
                <div className={st.Bot_Con}>
                    <div className={st.Reply_Con}>
                        <img className={st.Bot_Icon_Reply} src={Reply_Icon} alt="Reply"/>
                        <div className={st.Bot_Number}>{nFormatter(props.tweet.b_replyCount)}</div>
                    </div>
                    <div className={st.Retweet_Con}>
                        <img className={st.Bot_Icon_Retweet} src={Retweet_Icon} alt="Retweet"/>
                        <div className={st.Bot_Number}>{nFormatter(props.tweet.b_retweetCount)}</div>
                    </div>
                    <div className={st.Like_Con}>
                        <img className={st.Bot_Icon_Like} src={Like_Icon} alt="Like"/>
                        <div className={st.Bot_Number}>{nFormatter(props.tweet.b_likeCount)}</div>
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




