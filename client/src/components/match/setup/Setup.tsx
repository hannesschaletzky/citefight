/* eslint-disable react/jsx-pascal-case */
import { useRef, useReducer, useEffect, useState } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Setup.module.scss'

import CircularProgress from '@material-ui/core/CircularProgress';
import ArrowIcon from 'assets/setup/Arrow_Icon.png'

import {Tweet, Tweet_TopPart, Tweet_Content, Tweet_BottomPart} from 'components/Interfaces'

import {LocalStorage} from 'components/Interfaces'
import {Setup_Event} from 'components/Interfaces'
import {Setup_Event_Players} from 'components/Interfaces'
import {Setup_State} from 'components/Interfaces'
import {SetupStateType} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {Setup_ChatMsg} from 'components/Interfaces'
import {Twitter_Profile} from 'components/Interfaces'
import {SysMsgType} from 'components/Interfaces'
import {SetupEventType} from 'components/Interfaces'
import {Setup_Notification} from 'components/Interfaces'
import {NotificationType} from 'components/Interfaces'
import {PusherState} from 'components/Interfaces'
import {Setup_Settings} from 'components/Interfaces'
import {Settings_Roundtime} from 'components/Interfaces'
import {Settings_DrinkingMode} from 'components/Interfaces'
import {Settings_Pictures} from 'components/Interfaces'

import Lobby from './lobby/Lobby'
import Info from './info/Info'
import Search from './search/Search'
import Interaction from './interaction/Interaction'
import Players from './players/Players'
import Chat from './chat/Chat'
import BottomPart from '../tweet/parts/BottomPart';

const Pusher = require('pusher-js');

const init_profiles:Twitter_Profile[] = []
const init_players:Setup_Player[] = []
const init_chat:Setup_ChatMsg[] = []
const init_notification:Setup_Notification = {
    display: false,
    msg: "",
    type: NotificationType.Not_Success,
    scssClass: ''
}
const init_state:Setup_State = {
    gameid: '',
    state: SetupStateType.init,
    stateTexts: []
}

//inital settings
const init_settings:Setup_Settings = {
    rounds: 25,
    roundtime: Settings_Roundtime.Normal,
    autoContinue: true,
    pictures: Settings_Pictures.AtHalftime,
    drinking: Settings_DrinkingMode.Off
}

let init_pusherCient:any = null
let init_pusherChannel:any = null

export default function Setup() {
    //state
    const [redirectToJoin,setRedirectToJoin] = useState(false)
    //refs
    const ref_state = useRef(init_state)
    const ref_profiles = useRef(init_profiles)
    const ref_settings = useRef(init_settings)
    const ref_players = useRef(init_players)
    const ref_chat = useRef(init_chat)
    const ref_pusherState = useRef(PusherState.init)
    const ref_notification = useRef(init_notification)

    //control flow refs
    const ref_username = useRef("")
    const ref_pusherClient = useRef(init_pusherCient)
    const ref_pusherChannel = useRef(init_pusherChannel)

    const [,forceUpdate] = useReducer(x => x + 1, 0);
    
    let notTimeout = setTimeout(() => {}, 1) //store notification-timeout 

    const channelName = 'presence-Game2'

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {

        //CHECK SESSION STORAGE TO DETERMINE WHERE USER CAME FROM

        //twitter login callback && join page
        let twitterLoginSucces = sessionStorage.getItem(LocalStorage.TwitterLoginSuccess)
        let join = sessionStorage.getItem(LocalStorage.JoinGame)
        if (twitterLoginSucces !== null || join != null) {
            //get username
            let savedUsername = localStorage.getItem(LocalStorage.Username)
            if (savedUsername !== null) {
                ref_username.current = savedUsername
                //remove session storage tokens -> prevent infinite loop
                sessionStorage.removeItem(LocalStorage.JoinGame)
                sessionStorage.removeItem(LocalStorage.TwitterLoginSuccess) 
                joinGame()
                return
            }
        }
        
        //only check for redirect back to join page when user not already in state
        if (ref_pusherState.current === PusherState.init) {
            setRedirectToJoin(true)
        }

    })

    /*
    ##################################
    ##################################
        GENERAL FUNCTIONS
    ##################################
    ##################################
    */

    const getIndexOfUser = (name:string):number => {
        for (let i=0; i<ref_players.current.length;i++) {
            let user = ref_players.current[i]
            if (user.name === name) {
                return i
            }
        }
        //console.log('ERROR: could not find user in players array')
        return -1
    }

    
    const setPusherState = (state:PusherState) => {
        console.log('set state to: ' + state)
        ref_pusherState.current = state
        forceUpdate()
    }
    
    const addSysMsg = (type:SysMsgType, inputMsg:string) => {

        //create msg
        let msg:Setup_ChatMsg = {
            n: '',
            m: '',
            t: type
        }

        //determine type 
        if (type === SysMsgType.welcome) {
            msg.m = inputMsg
        }
        else if (type === SysMsgType.userJoined) {
            msg.m = inputMsg + ' joined 🎊'
        }
        else if (type === SysMsgType.userLeft) {
            msg.m = inputMsg + ' left 😭'
        }
        else if (type === SysMsgType.startInfo) {
            msg.m = '📢 ' + inputMsg
        }
        
        //add
        ref_chat.current.push(msg)
    }

    const showNotification = (msg:string, notType:NotificationType)  => {
        let newNot:Setup_Notification = {
            display: true,
            msg: msg,
            type: notType,
            scssClass: ''
        }
        //set scss class
        if (notType === NotificationType.Not_Success) {
            newNot.scssClass = st.Not_Success
        }
        else if (notType === NotificationType.Not_Warning) {
            newNot.scssClass = st.Not_Warning
        }
        else if (notType === NotificationType.Not_Error) {
            newNot.scssClass = st.Not_Error
        }
        //update UI
        ref_notification.current = newNot
        forceUpdate()

        //clear old timeout && set new timer to hide it after seconds
        clearTimeout(notTimeout)
        notTimeout = setTimeout(hideNotification, 5000);
    }

    const hideNotification = () => {
        ref_notification.current.display = false
        forceUpdate()
    }

    /*
    ##################################
    ##################################
            MANAGE MATCH SETUP 
    ##################################
    ##################################
    */

    const addStateMsg = (msg:string) => {
        ref_state.current.stateTexts.push(msg)
        fireEvent_Players()
    }

    const noMoreTweets = useRef(false)
    const currentMaxID = useRef('')
    const tweets = useRef([])

    const triggerMatchSetup = async () => {

        interface ProfileTweets {
            profile: Twitter_Profile,
            tweets: any[]
        }
        let profileTweets:ProfileTweets[] = []

        /*
        ###################
        EXTRACT TWEETS FROM PROFILE
        ###################
        */
        let iterations = 3 //how many rounds will timeline be iterated backwards
        //loop profiles
        for(let i=0;i<ref_profiles.current.length;i++) {
            let profile = ref_profiles.current[i]
            addStateMsg('Fetching tweets for: ' + profile.screen_name)
            console.log('\n' + profile.id_str + ' - fetching tweets for: ' + profile.screen_name)

            currentMaxID.current = ''
            noMoreTweets.current = false
            tweets.current = []

            //iterate timeline backwards
            for(let j=0;j<iterations;j++) {

                if (noMoreTweets.current) {
                    break
                }
                console.log('Round: ' + (j+1))

                await getTweets(profile.id_str, currentMaxID.current)
                .then(res => {
                    
                    if (res.length === 0) {
                        addStateMsg('Error: No available tweets for: ' + profile.screen_name)
                        console.log('\t NO TWEETS')
                        noMoreTweets.current = true
                    }
                    else if (res.length === 1 && res[0].id_str === currentMaxID.current) {
                        //last tweet (maxid) came back itself
                        console.log('\t -> no more tweets')
                        noMoreTweets.current = true
                    }
                    else {
                        console.log('\t' + res.length)
                        currentMaxID.current = res[res.length-1].id_str
                        if (j >= 1) {
                            //remove last bc its first in new round
                            tweets.current.pop()
                        }
                        tweets.current = tweets.current.concat(res)
                    }
                })
                .catch(err => {
                    addStateMsg('Error: error retrieving tweets: ' + err)
                    console.log('error retrieving tweets: ' + err)
                    return
                })
            }
            console.log('--> ' + tweets.current.length + ' total tweets')
            //console.log(tweets.current)

            let obj:ProfileTweets = {
                profile: profile,
                tweets: tweets.current 
            }
            profileTweets.push(obj)
        }
        //console.log(profileTweets)
        let totalTweets = 0
        for(let i = 0;i<profileTweets.length;i++) {
            totalTweets += profileTweets[i].tweets.length
        }
        addStateMsg(`Fetched ${totalTweets} tweets`)


        /*
        ###################
        REMOVE TWEETS WITH is_quote_status=true
        ###################
        */
        //each profile
        let count = 0
        profileTweets.forEach((item) => {
            //each tweet (backwards)
            console.log(item.tweets.length)
            for(let i=item.tweets.length-1;i>=0;i--) {
                if (item.tweets[i].is_quote_status) {
                    item.tweets.splice(i,1)
                    count++
                }
            }
        })
        addStateMsg(`Removed ${count} 'reply to' tweets`)
        console.log(profileTweets)



        /*
        ###################
        EXTRACT RANDOM TWEETS
        ###################
        */
        function getDistinctRandomNumbers(max:number, count:number):number[] {
            let numbers:number[] = []
            while (numbers.length < count) {
                let rnd = getRandomInt(max)
                //check already added
                for(let i=0;i<numbers.length;i++) {
                    if (rnd === numbers[i]) {
                        continue
                    }
                }
                numbers.push(rnd)
            }
            numbers.sort((a, b) => b - a) //sort desc
            return numbers
        }
        function getRandomInt(max:number):number {
            return Math.floor(Math.random() * Math.floor(max))
        }

        //calc total tweets available -> adjust rounds if necessary
        console.log(`${totalTweets} tweets from ${profileTweets.length} profiles for ${ref_settings.current.rounds} rounds available`)
        if (totalTweets < ref_settings.current.rounds) {
            console.log(`Set rounds to ${totalTweets} because there are not enough tweets to play`)
            ref_settings.current.rounds = totalTweets
        }

        //calc tweet ratio per profile
        let ratio:number = Math.floor(ref_settings.current.rounds/ref_profiles.current.length)
        console.log('ratio: ' + ratio)
        addStateMsg(`Extracting ${ref_settings.current.rounds} tweets`)
        //addStateMsg(`Extracting ${ref_settings.current.rounds} tweets out of ${totalTweets} random tweets`)

        //choose tweets
        let tweetsToPlay:any[] = []
        for(let i=0;i<profileTweets.length;i++) {
            let item = profileTweets[i]
            //profile has less than needed or equal
            if (item.tweets.length < ratio || 
                item.tweets.length === ratio) {
                //tweetsToPlay.push(item.tweets)
                tweetsToPlay = tweetsToPlay.concat(item.tweets)
                console.log(`Added ${item.tweets.length} tweets from ${item.profile.screen_name}`)
                profileTweets[i].tweets = []
            }
            //profile has more than needed
            else {
                let indexes = getDistinctRandomNumbers(item.tweets.length, ratio)
                //console.log(indexes.toString())
                for (let j=0;j<indexes.length;j++) {
                    tweetsToPlay.push(item.tweets[indexes[j]])
                    profileTweets[i].tweets.splice(indexes[j], 1)
                }
                console.log(`Added ${ratio} tweets from ${item.profile.screen_name}`)
            }
        }
        console.log(profileTweets)
        console.log(tweetsToPlay)
        console.log(tweetsToPlay.length + ' tweets to play')

        //fill remaining diff (bc of ration rounding bug or profile/s has/have less tweets than ratio)
        while (tweetsToPlay.length < ref_settings.current.rounds) {
            //add one tweet from each profile each round
            for(let i=0;i<profileTweets.length;i++) {
                //stop if tweetsToPlay filled
                if (tweetsToPlay.length >= ref_settings.current.rounds) {
                    break
                }
                let item = profileTweets[i]
                //only add from profile with tweets left
                if (item.tweets.length > 0) {
                    let index = getRandomInt(item.tweets.length)
                    tweetsToPlay.push(item.tweets[index])
                    profileTweets[i].tweets.splice(index, 1)
                    console.log(`Added 1 tweet from ${item.profile.screen_name}`)
                }
            }
        }
        console.log(tweetsToPlay.length + ' tweets to play')

        /*
        ###################
        EXTRACT TWEET IDS
        ###################
        */
        let tweetIDs = ""
        tweetsToPlay.forEach((value) => {
            tweetIDs += value.id_str + ","
        })
        tweetIDs = tweetIDs.substring(0,tweetIDs.length-1) //cut last ,
        
        /*
        ###################
        GET TWEET DETAILS
        ###################
        */
        var requestOptions = {
            headers: {
                'idstoplay': tweetIDs
            }
        }
        let request = new Request('/api/twitter/tweetdetails', requestOptions)
        const response = await fetch(request)
        const body = await response.json()
        if (body.status !== 200) {
            addStateMsg('Error: error retrieving tweets: ' + body.message)
            console.log('error retrieving tweets: ' + body.message)
            return
        }
        //console.log(body.data)
        //console.log(body.includes)
        let finalTweets = parseTweets(body.data, body.includes, ref_profiles.current)
        console.log(finalTweets)

        /*
        ###################
        RANDOMIZE 
        ###################
        */
        addStateMsg('Stiring the pot')



        /*
        ###################
        REDIRECT TO MATCH
        ###################
        */
        setTimeout(() => {
            addStateMsg('Joining Matchroom')
        }, 2000)
        
    }


    const getTweets = async (userid:string, maxid:string='') => {

        var requestOptions = {
            headers: {
                'userid': userid,
                'maxid': maxid
            }
        };
        let request = new Request('/api/twitter/tweets', requestOptions)
        const response = await fetch(request)
        const body = await response.json()
        if (response.status !== 200) {
            throw Error(body)
        }
        //console.log(body.data.length + ' tweets')
        //console.log(body)
        return body.data
    }

    const parseTweets = (data:[], includes:any, profiles:Twitter_Profile[]):Tweet[] => {
        
        const getProfileForAuthorID = (id:string):Twitter_Profile => {
            for (let i=0;i<profiles.length;i++) {
                if (profiles[i].id_str === id) {
                    return profiles[i]
                }
            }
            return profiles[99]
        }

        const getPhotoUrlForKey = (key:string):string => {
            /*
            "includes": {
                "media": [
                    {
                        "width": 1600,
                        "media_key": "3_1336401334170431490",
                        "url": "https://pbs.twimg.com/media/EovZ7tCWMAIS46l.jpg",
                        "type": "photo",
                        "height": 1342
                    }
                ]
            }
            */
            let media:any[] = includes.media
            for(let i=0;i<media.length;i++) {
                if (media[i].media_key === key) {
                    return media[i].url
                }
            }
            return ""
        }   

        let parsed:Tweet[] = []
        data.forEach((item:any,i) => {

            //"Absolutely upsetting week. https://t.co/JumIw4XgV3"
            let text_org:string = item.text

            //TOP PART
            //get profile for author_id
            let profile = getProfileForAuthorID(item.author_id)
            //get tweetURL
            let profileLink = `https://twitter.com/${profile.screen_name}`
            let tweetLink = `https://twitter.com/${profile.screen_name}/status/${item.id}`
            let topPart:Tweet_TopPart = {
                userName: profile.name,
                userTag: profile.screen_name,
                userVerified: profile.verified,
                profileURL: profileLink,
                userPicURL: profile.profile_image_url_https,
                tweetURL: tweetLink
            }

            //CONTENT
            //subtract link from text
            let index = text_org.lastIndexOf('https://')
            let text_cut = text_org.substring(0, index).trimEnd()

            //test retweet -> https://twitter.com/matshummels/status/959457608984875013
            //959457608984875013

            //media
            let ph1 = ""
            let ph2 = ""
            let ph3 = ""
            let ph4 = ""
            if (!("attachments" in item)) {
                console.log("no photos for this tweet")
            }
            else {
                let keys = item.attachments.media_keys
                switch (keys.length) {
                    case 1: { 
                        ph1 = getPhotoUrlForKey(keys[0])
                        break; 
                    }
                    case 2: { 
                        ph1 = getPhotoUrlForKey(keys[0])
                        ph2 = getPhotoUrlForKey(keys[1])
                        break; 
                    }
                    case 3: { 
                        ph1 = getPhotoUrlForKey(keys[0])
                        ph2 = getPhotoUrlForKey(keys[1])
                        ph3 = getPhotoUrlForKey(keys[2])
                        break; 
                    }
                    case 4: { 
                        ph1 = getPhotoUrlForKey(keys[0])
                        ph2 = getPhotoUrlForKey(keys[1])
                        ph3 = getPhotoUrlForKey(keys[2])
                        ph4 = getPhotoUrlForKey(keys[3])
                        break; 
                    }
                    default: { 
                        break; 
                    } 
                }
            }
            let content:Tweet_Content = {
                text: text_cut,
                photo1: ph1,
                photo2: ph2,
                photo3: ph3,
                photo4: ph4,
            } 


            //BOTTOM PART
            /*
            "public_metrics": {
                "retweet_count": 248,
                "reply_count": 70,
                "like_count": 7684,
                "quote_count": 57
            }
            */
            let met = item.public_metrics
            let bottomPart:Tweet_BottomPart = {
                replyCount: met.reply_count,
                likeCount: met.like_count,
                retweetCount: met.retweet_count,
                date: item.created_at
            }

            let tweet:Tweet = {
                content: content,
                topPart: topPart,
                bottomPart: bottomPart
            }

            //push
            parsed.push(tweet)

        })
        return parsed
    }


    /*
    ##################################
    ##################################
            JOIN && LEAVE 
    ##################################
    ##################################
    */
    const joinGame = () => {

        //has already joined
        if (ref_pusherState.current === PusherState.connected ||
            ref_pusherState.current === PusherState.connecting) {
            console.log('already connecting or connected')
            return
        }
        setPusherState(PusherState.connecting)

        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true,
          authEndpoint: '/api/pusher/auth?id=' + ref_username.current 
        })

        //bind to all events
        //see: https://pusher.com/docs/channels/using_channels/connection#available-states
        _pusherClient.connection.bind('state_change', (states:any) => {
            //states = {previous: 'oldState', current: 'newState'}
            console.log('new pusher state from event "state_change": ' + states.current)
            //setPusherConState(states.current) //-> also see enum PusherConState
        });

        //bind error event
        _pusherClient.connection.bind('error', (err:any) => {
            setPusherState(PusherState.error)
            let str = JSON.stringify(err, null, 4);
            console.log('error during pusher connection')
            console.log(str)
        })

        //bind connected
        _pusherClient.connection.bind('connected', async () => {
            
            if (ref_pusherClient.current !== null) {
                //reconnected
                console.log('reconnected')
                return
            }
            console.log('pusher is connected')

            //sub channel
            const channel = _pusherClient.subscribe(channelName)
            // -> success
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('subscribed to channel: ' + channelName)
                
                //set vars
                ref_pusherClient.current = _pusherClient 
                ref_pusherChannel.current = channel

                //bind to events
                ref_pusherChannel.current.bind(SetupEventType.Join, 
                    (data:Setup_Event) => handleEvent_Join(data)
                )
                ref_pusherChannel.current.bind(SetupEventType.Player, 
                    (data:Setup_Event_Players) => handleEvent_Player(data)
                )
                ref_pusherChannel.current.bind(SetupEventType.Chat, 
                    (data:Setup_Event) => handleEvent_Chat(data)
                )
                ref_pusherChannel.current.bind(SetupEventType.Profile, 
                    (data:Setup_Event) => handleEvent_Profile(data)
                )
                ref_pusherChannel.current.bind(SetupEventType.Settings, 
                    (data:Setup_Event) => handleEvent_Settings(data)
                )
                ref_pusherChannel.current.bind('pusher:member_removed', (member:any) => {
                    //abort countdown
                    if (ref_state.current.state === SetupStateType.countdown) {
                        ref_state.current.state = SetupStateType.init
                    }
                    //remove user
                    let i = getIndexOfUser(member.id)
                    ref_players.current.splice(i,1);
                    addSysMsg(SysMsgType.userLeft, member.id)
                    forceUpdate()
                    assignJoinEventAdmin()
                });

                //request current state from lobby
                fireEvent_Join()
            });

            // -> error
            channel.bind('pusher:subscription_error', (err:any) => {
                let str = JSON.stringify(err, null, 4);
                console.log('error during subscribing to channel: ' + channelName)
                console.log(str)
            });
        })
    }

    const leaveGame = () => {
        console.log('leaving')
        setPusherState(PusherState.connecting)
        document.location.reload()
    }

    /*
    ##################################
    ##################################
        EVENT: Join
    ##################################
    ##################################
    */
    const handleEvent_Join = (event:Setup_Event) => {

        /*
            ONLY FIRST USER HANDLES THIS
        */

        /*
        let str = JSON.stringify(event.data, null, 4);
        console.log(str)
        */

        //security
        if (event.type !== SetupEventType.Join) {
            console.log('EventType mismatch in handleEvent_Admin:\n\n' + event)
            return
        }
        let triggerUser = event.data
            
        //encapsulated join
        const joinPlayer = (name:string) => {
            let newUser:Setup_Player = {
                name: name,
                ready: false
            }
            ref_players.current.push(newUser)
            addSysMsg(SysMsgType.userJoined, name)
        }

        if (ref_players.current.length === 0 && triggerUser === ref_username.current ) {
            /*
                you are the only one in the game
                -> dont send out event, add youself manually
            */
            console.log('you are the only person in the room')
            //insert welcome first
            let currentUrl = window.location.href
            addSysMsg(SysMsgType.welcome,   '🎉 Welcome to your matchroom!') 
            addSysMsg(SysMsgType.welcome,   '🎉 Invite the people you wanna play by sending them the match-link (Browser-URL).' +
                                            ' You can also let others scan the QR Code.' +
                                            ' The game will start when everyone is ready.') 
            addSysMsg(SysMsgType.welcome,   currentUrl) 
            joinPlayer(triggerUser)
            setPusherState(PusherState.connected) //force update is incl. here
            return
        }

        if (ref_players.current[0].name === ref_username.current ) {
            /*
                you are admin
                -> attach new user 
                -> broadcast current state
            */
            console.log('BROADCAST join for: ' + triggerUser)
            joinPlayer(triggerUser)
            fireEvent_Chat()
            fireEvent_Players()
            fireEvent_Profiles()
            fireEvent_Settings()
        }
    }

    const fireEvent_Join = async () => {

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Join,
            data: ref_username.current
        }

        //exectue
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event.type
            },
            body: JSON.stringify(event), 
        });

        //read response
        const body = await response.text();
        console.log(body)
    }

    const assignJoinEventAdmin = () => {
        /*
            This has to be called when a new user joins or one leaves
            -> assign new answer player for join event
            -> only first player handles join event
            (unbind to avoid double calling!)
        */
        if (ref_players.current.length > 0) {
            ref_pusherChannel.current.unbind(SetupEventType.Join)
            if (ref_players.current[0].name === ref_username.current ) {
                //bind
                ref_pusherChannel.current.bind(SetupEventType.Join,
                    (data:any) => handleEvent_Join(data)
                )
                console.log('Bound join event')
            }
        }
    }

    /*
    ##################################
    ##################################
        EVENT: Player
    ##################################
    ##################################
    */
    const handleEvent_Player = (event:Setup_Event_Players) => {

        //let str = JSON.stringify(event.data, null, 4);
        //console.log(str)

        //console.log(pusherChannel.members.count)
        //security
        if (event.type !== SetupEventType.Player) {
            console.log('EventType mismatch in handleEvent_Player:\n\n' + event)
            return
        }

        //set new state
        let newState:Setup_State = event.state
        ref_state.current = newState

        //set new players
        let newPlayers:Setup_Player[] = event.data
        console.log('total players: ' + newPlayers.length)
        ref_players.current = newPlayers
        setPusherState(PusherState.connected) //force update incl. here
        assignJoinEventAdmin()

        /*  
        ################
        CHECK IF COUNTDOWN CAN BE STARTED
        ################
        */
        //let first user trigger management of game content
        if (ref_state.current.state === SetupStateType.init && 
            ref_username.current === ref_players.current[0].name) {
            
            //everyone ready?
            for(let i=0;i<ref_players.current.length;i++) {
                if (!ref_players.current[i].ready) return
            }
            console.log('everyone ready!')

            //start countdown for everyone
            ref_state.current.state = SetupStateType.countdown
            fireEvent_Players()
        }
        /*  
        ################
        START COUNTDOWN
        ################
        */
        else if (ref_state.current.state === SetupStateType.countdown) {

            let timeouts:NodeJS.Timeout[] = [] //store timeout to clear when aborted
            const checkCancelled = ():boolean => {
                if (ref_state.current.state === SetupStateType.init) {
                    //set everyone unready
                    ref_players.current.forEach((value) => {
                        value.ready = false
                    })
                    //show info
                    showNotification('Someone left, cancelled starting...', NotificationType.Not_Warning)
                    //clear further steps
                    timeouts.forEach((value) => {
                        clearTimeout(value)
                    })
                    return true
                }
                return false
            }

            const addStartInfo = (sec:number) => {
                if (checkCancelled()) {return}
                addSysMsg(SysMsgType.startInfo, `${sec}...`)
                forceUpdate()
            }
            timeouts.push(setTimeout(() => {  addSysMsg(SysMsgType.startInfo, 'Everyone is ready! Starting in...') 
                                forceUpdate()}, 100))
            timeouts.push(setTimeout(() => addStartInfo(5), 1000))
            timeouts.push(setTimeout(() => addStartInfo(4), 2000))
            timeouts.push(setTimeout(() => addStartInfo(3), 3000))
            timeouts.push(setTimeout(() => addStartInfo(2), 4000))
            timeouts.push(setTimeout(() => addStartInfo(1), 5000))

            //first triggers start game for everyone
            if (ref_username.current === ref_players.current[0].name) {
                const startGame = () => {
                    if (checkCancelled()) {return}
                    ref_state.current.state = SetupStateType.getTweets
                    fireEvent_Players()
                }
                timeouts.push(setTimeout(() => startGame(), 5200))
            }
        }
        /*  
        ################
        START GETTING TWEETS
        ################
        */
        else if (ref_state.current.state === SetupStateType.getTweets &&
                 ref_username.current === ref_players.current[0].name &&
                 ref_state.current.stateTexts.length === 0) { 
            //first user starts and only call when not called already (stateTexts.length === 0)
            triggerMatchSetup()
        }
    }

    const fireEvent_Players = async () => {

        //prepare
        let event:Setup_Event_Players = {
            type: SetupEventType.Player,
            data: ref_players.current,
            state: ref_state.current 
        }

        //execute
        console.log('broadcast new players + state')
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event.type
            },
            body: JSON.stringify(event),
        });
        
        //read response
        const body = await response.text();
        console.log(body)
    }

    const toogleReady = (ready:boolean) => {
        //set yourself ready
        let i = getIndexOfUser(ref_username.current)
        ref_players.current[i].ready = ready
        fireEvent_Players()
    }

    /*
    ##################################
    ##################################
        EVENT: Chat
    ##################################
    ##################################
    */
    const handleEvent_Chat = (event:Setup_Event) => {

        //security
        if (event.type !== SetupEventType.Chat) {
            console.log('EventType mismatch in handleEvent_Chat:\n\n' + event)
            return
        }

        //set new chat
        let newChat:Setup_ChatMsg[] = event.data
        console.log('total msgs: ' + newChat.length)
        ref_chat.current = newChat
        forceUpdate()
        
    }

    const fireEvent_Chat = async () => {

        //remove first message of chat until chat is smaller than 10KB
        let chatString = JSON.stringify(ref_chat.current)
        while (chatString.length > 10000) {
            console.log('Chat too long\n -> removing first message')
            //find first non welcome message to remove
            for(let i=0;i<ref_chat.current.length;i++) {
                if (ref_chat.current[i].t !== SysMsgType.welcome) {
                    ref_chat.current.splice(i,1)
                    break
                }
            }
            chatString = JSON.stringify(ref_chat.current)
        }

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Chat,
            data: ref_chat.current
        }

        //execute
        console.log('broadcast new chat ' + chatString.length)
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event.type
            },
            body: JSON.stringify(event),
        });

        //read response
        const body = await response.text();
        console.log(body)
    }

    /*
    ##################################
    ##################################
        EVENT: Profiles
    ##################################
    ##################################
    */
    const handleEvent_Profile = (event:Setup_Event) => {

        //console.log(pusherChannel.members.count)
        //security
        if (event.type !== SetupEventType.Profile) {
            console.log('EventType mismatch in handleEvent_Profile:\n\n' + event)
            return
        }

        //set new profiles
        let newProfiles:Twitter_Profile[] = event.data
        console.log('total profiles: ' + newProfiles.length)
        ref_profiles.current = newProfiles
        forceUpdate()
    }

    const fireEvent_Profiles = async () => {

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Profile,
            data: ref_profiles.current
        }

        //execute
        console.log('broadcast new profiles')
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event.type
            },
            body: JSON.stringify(event),
        });
        
        //read response
        const body = await response.text();
        console.log(body)
    }

    /*
    ##################################
    ##################################
        EVENT: Settings
    ##################################
    ##################################
    */
    const handleEvent_Settings = (event:Setup_Event) => {

        //console.log(pusherChannel.members.count)
        //security
        if (event.type !== SetupEventType.Settings) {
            console.log('EventType mismatch in handleEvent_Settings:\n\n' + event)
            return
        }

        //set new settings
        let newSettings:Setup_Settings = event.data
        console.log('new Settings received')
        ref_settings.current = newSettings
        forceUpdate()
    }

    const fireEvent_Settings = async () => {

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Settings,
            data: ref_settings.current
        }

        //execute
        console.log('broadcast new settings')
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event.type
            },
            body: JSON.stringify(event),
        });
        
        //read response
        const body = await response.text();
        console.log(body)
    }

    /*
    ##################################
    ##################################
        Functions to child components
    ##################################
    ##################################
    */

    //passed to search component
    const onAddProfile = (newUser: Twitter_Profile):void => {

        //check if user has tweets
        if (newUser.statuses_count === 0) {
            showNotification('User should have posted at least one tweet', NotificationType.Not_Error)
            return
        }

        //check already added
        for(let i=0;i<ref_profiles.current.length;i++) {
            if (ref_profiles.current[i].screen_name === newUser.screen_name) {
                showNotification(newUser.name + ' already added!', NotificationType.Not_Error)
                return
            }
        }

        //check maximum
        if (ref_profiles.current.length >= 10) {
            showNotification('Maximum number of 10 profiles reached', NotificationType.Not_Error)
            return
        }
        
        //check pusher event size
        let alreadyL = JSON.stringify(ref_profiles.current).length
        let newUserL = JSON.stringify(newUser).length
        if ((alreadyL + newUserL) > 9000) {
            showNotification('Pusher server cannot support more profiles!', NotificationType.Not_Error)
            return
        }

        //if user did not post a lot, show warning
        if (newUser.statuses_count < 20) {
            showNotification('Playing profiles with few tweets might affect the game experience', NotificationType.Not_Warning)
        }

        //add
        console.log('profile added: ' + newUser.screen_name)
        ref_profiles.current.push(newUser)
        fireEvent_Profiles()
    }

    //passed to chat 
    const onNewChatMessage = (newMsg:Setup_ChatMsg) => {
        //console.log('new chat msg received: ' + newMsg.m)
        newMsg.n = ref_username.current //chat component does not know/set user name
        ref_chat.current.push(newMsg)
        fireEvent_Chat()
    }

    const onLeaveTriggered = () => {
        leaveGame()
    }

    const onToogleReady = (ready:boolean) => {
        if (ref_profiles.current.length === 0) {
            showNotification('You have to select profiles to play before you can start', NotificationType.Not_Warning)
            return
        }
        toogleReady(ready)
    } 

    const onNewNotification = (msg:string, notType:NotificationType) => {
        showNotification(msg, notType)
    }

    const onRemoveProfile = (deletedUser: Twitter_Profile):void => {
        for(let i = 0; i<ref_profiles.current.length;i++) {
            if (ref_profiles.current[i].screen_name === deletedUser.screen_name) {
                ref_profiles.current.splice(i, 1)
                console.log('user removed: ' + deletedUser.screen_name)
                fireEvent_Profiles()
                return
            }
        }
    }

    const onSettingsChanged = (newSettings:Setup_Settings) => {
        ref_settings.current = newSettings
        fireEvent_Settings()
    } 

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */

    const getAdmin = () => {
        if (ref_username.current !== null && ref_players.current.length > 0) {
            if (ref_username.current === ref_players.current[0].name) {
                return true
            }
        }
        return false
    }

    const getSpecialContent = () => {

        let content = <div></div>

        //check if given MatchID is invalid
        let current = window.location.href
        let matchID = current.substr(current.lastIndexOf('/') + 1);
        if (matchID.length === 0 || !(/^\d+$/.test(matchID))) {
            console.log('INVALID ID: ' + matchID)
            content =  
                <div className={st.State_Con}>
                    '{matchID}' is an invalid Match ID! Only numbers allowed
                </div>
            return content
        }

        //redirect back to join page
        if (redirectToJoin) {
            let redirectURL = '/match/join/' + matchID
            return <Redirect to={redirectURL}/>
        }
        
        //PUSHER STATE
        //loading
        if (ref_pusherState.current === PusherState.init ||
            ref_pusherState.current === PusherState.connecting) {
            content =  
                <div className={st.State_Con}>
                    <CircularProgress/>
                </div>
        }
        //connected
        else if (ref_pusherState.current !== PusherState.connected) {
            content =  
                <div className={st.State_Con}>
                    Could not connect to match
                </div>
        }

        //SETUP STATE
        //retrieve tweets and stuff
        if (ref_state.current.state === SetupStateType.getTweets) {

            let cards = [<div></div>]
            cards = []
            let maxI = ref_state.current.stateTexts.length - 1 //max index
            ref_state.current.stateTexts.forEach((value,i) => {
                cards.push(
                    <div className={st.State_Line} key={i}>
                        <div className={st.State_Status}>
                            {i < maxI && //prior are done
                                <img className={st.State_Icon} src={ArrowIcon} alt="Done"/>
                            }
                            {i === maxI && //current is processing
                                <CircularProgress/>
                            }
                        </div>
                        {value}
                    </div>
                )
            })

            content =  
                <div className={st.State_Con}>
                    {cards}
                </div>
        }

        return content
    }
    
    return (
    <div className={st.Content_Con}>
        {getSpecialContent()}
        <div className={ref_state.current.state === SetupStateType.init ? st.Left_Panel : st.Left_Panel_disabled}>
            {Search(
                ref_profiles.current,
                onAddProfile,
                onNewNotification
            )}
        </div>
        <div className={ref_state.current.state === SetupStateType.init ? st.Center_Panel : st.Center_Panel_disabled}>
            <div className={st.Lobby_Con}>
                {Lobby(
                    getAdmin(),
                    ref_profiles.current,
                    onRemoveProfile,
                    ref_settings.current,
                    onSettingsChanged,
                    onNewNotification
                )}
            </div>
            {Info()
            }
        </div>
        <div className={st.Right_Panel}>
            <div className={ref_state.current.state === SetupStateType.init ? st.Interaction_Con : st.Interaction_Con_disabled}>
                <Interaction
                    user={ref_players.current[getIndexOfUser(ref_username.current)]}
                    onLeaveClick={onLeaveTriggered}
                    onToogleReadyClick={onToogleReady}
                    addNotification={onNewNotification}
                />
            </div>
            <div className={st.Players_Con}>
                <Players   
                    data={ref_players.current}
                    currentUser={ref_username.current}
                />
            </div>
            <div className={st.Chat_Con}>
                {Chat(
                    ref_chat.current,
                    onNewChatMessage
                )}
            </div>
        </div>
        {ref_notification.current.display && 
            <div className={ref_notification.current.scssClass} onClick={() => hideNotification()}>
                <div className={st.Not_Text}>
                    {ref_notification.current.msg}
                </div>
                <div className={st.Not_Close}>
                    x
                </div>
            </div>
        }
    </div>
    );
}