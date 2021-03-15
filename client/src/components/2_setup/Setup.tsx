/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-pascal-case */
import { useRef, useReducer, useEffect, useState } from 'react'
import  { Redirect } from 'react-router-dom'
import st from './Setup.module.scss'
import {log, logObjectPretty} from 'components/Logic'

//UI Elements
import CircularProgress from '@material-ui/core/CircularProgress'
import ArrowIcon from 'assets/setup/Arrow_Icon.png'

//interfaces
import {Tweet, Tweet_TopPart, Tweet_Content, Tweet_BottomPart} from 'components/Interfaces'
import {LocalStorage} from 'components/Interfaces'
import {Player} from 'components/Interfaces'
import {ChatMsg} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'
import {SysMsgType} from 'components/Interfaces'
//functional interfaces
import {SetupProps} from 'components/Functional_Interfaces'

//logic
import {isValidMatchID} from 'components/Logic'

//puhser
import * as Pu from 'components/pusher/Pusher'

//mockdata
import {popProfilesMock} from 'components/Mockdata'

//components
import Lobby from './lobby/Lobby'
import Add from './add/Add'
import Interaction from './interaction/Interaction'
import Players from './players/Players'
import * as Chat from 'components/00_shared/chat/Chat'
import * as Settings from 'components/00_shared/settings/Settings'
import * as Not from 'components/00_shared/notification/Notification'

//STATE & STATUS
interface State {
    matchID: string;
    state: Status;
    stateTexts: string[];
}
enum Status {
    init = 'init',
    countdown = 'countdown',
    getTweets = 'getTweets',
    redirectToMatch = 'redirectToMatch'
}

//PUSHER EVENT
interface Event_Join {
    type: Pu.EventType;
    data: Event_Join_Data;
}
interface Event_Players {
    type: Pu.EventType;
    data: any;
    state: State;
}
interface Event_Tweets {
    type: Pu.EventType;
    data: any;
    bottomIndex: number;
}
interface Event_Join_Data {
    username: string;
    userid: string;
}

//INIT OBJECTS FOR REFS
const init_profiles:Profile[] = []
const init_players:Player[] = []
const init_chat:ChatMsg[] = []
const init_tweets:Tweet[] = []
const init_state:State = {
    matchID: '',
    state: Status.init,
    stateTexts: []
}


export default function Setup(props:SetupProps) {
    //state
    const [redirectToJoin,setRedirectToJoin] = useState(false)
    const [validMatchID,setValidMatchID] = useState(true)
    //refs
    const ref_username = useRef("")
    const ref_tweets = useRef(init_tweets)
    const ref_state = useRef(init_state)
    const ref_profiles = useRef(init_profiles)
    const ref_settings = useRef(Settings.initSettings_Lobby)
    const ref_players = useRef(init_players)
    const ref_chat = useRef(init_chat)
    const ref_notification = useRef(Not.init)
    //control flow refs
    const ref_pusherState = useRef(Pu.State.init)
    const ref_pusherClient = useRef(Pu.init_pusherCient)
    const ref_pusherChannel = useRef(Pu.init_pusherChannel)
    const [,forceUpdate] = useReducer(x => x + 1, 0)

    useEffect(() => {
        
        //check if given MatchID is invalid
        let matchID = isValidMatchID(window.location.href)
        if (!matchID) {
            setValidMatchID(false)
            return
        }
        ref_state.current.matchID = matchID

        //get pusherclient (only at first loading -> .init)
        if (props.pusherClient === null && ref_pusherState.current === Pu.State.init) {
            log('no pusher client -> redirect to join')
            setRedirectToJoin(true)
            return
        }

        //retrieve & set pusherclient (once)
        if (ref_pusherClient.current === null) {
            ref_pusherClient.current = props.pusherClient
            log('retrieved and set pusher client')
            //get username
            let savedUsername = localStorage.getItem(LocalStorage.Username)
            if (savedUsername !== null) {
                ref_username.current = savedUsername
                joinGame()
            }
            else {
                log('error joining -> no username')
            }
        }
    })

    /*
    ##################################
    ##################################
                GENERAL
    ##################################
    ##################################
    */

    const getLobbyName = ():string => {
        return Pu.Channel_Lobby + ref_state.current.matchID
    }

    const isAdmin = ():boolean => {
        if (ref_username.current === ref_players.current[0].name) {
            return true
        }
        return false
    }

    const getIndexOfUser = (name:string):number => {
        for (let i=0; i<ref_players.current.length;i++) {
            let user = ref_players.current[i]
            if (user.name === name) {
                return i
            }
        }
        //log('ERROR: could not find user in players array')
        return -1
    }

    const setPusherState = (state:Pu.State) => {
        //log('set state to: ' + state)
        ref_pusherState.current = state
        forceUpdate()
    }
    
    const addSysMsg = (type:SysMsgType, inputMsg:string) => {
        Chat.addSysMsg(type, inputMsg, ref_chat)
    }

    const showNotification = (msg:string, notType:Not.Type)  => {
        let newNot:Not.Notification = {
            type: notType,
            msg: msg
        }
        //update UI
        log(newNot)
        ref_notification.current = newNot
        forceUpdate()
    }

    /*
    ##################################
    ##################################
            JOIN && LEAVE 
    ##################################
    ##################################
    */
    const joinGame = () => {

        //bind to connection state change events
        ref_pusherClient.current.connection.bind(Pu.Conn_State_Change, (states:any) => {
            //states = {previous: 'oldState', current: 'newState'}
            log('new pusher state from event "state_change": ' + states.current)
            setPusherState(states.current) 
        })

        //sub to events of lobby if connected
        if (ref_pusherClient.current.connection.state === Pu.State.connected) {

            //sub to lobby channel
            let name = getLobbyName()
            const channel = props.pusherClient.subscribe(name)
            channel.bind(Pu.Channel_Sub_Fail, (err:any) => {
                logObjectPretty(err)
                setPusherState(Pu.State.failed) 
            })
            channel.bind(Pu.Channel_Sub_Success, () => {
                log('SETUP: sub to: ' + channel.name)

                //bind to events
                channel.bind(Pu.EventType.Join, 
                    (data:Event_Join) => handleEvent_Join(data)
                )
                //above will be handled by admin when more players in lobby
                channel.bind(Pu.EventType.Player, 
                    (data:Event_Players) => handleEvent_Player(data)
                )
                channel.bind(Pu.EventType.Chat, 
                    (data:Pu.Event) => handleEvent_Chat(data)
                )
                channel.bind(Pu.EventType.Profile, 
                    (data:Pu.Event) => handleEvent_Profile(data)
                )
                channel.bind(Pu.EventType.Settings, 
                    (data:Pu.Event) => handleEvent_Settings(data)
                )
                channel.bind(Pu.EventType.Tweets, 
                    (data:Event_Tweets) => handleEvent_Tweets(data)
                )
                //user left pusher-event 
                channel.bind(Pu.Channel_Member_Removed, 
                    (member:any) => userLeft(member.id)
                )

                //set channel
                ref_pusherChannel.current = channel
                //request current state from lobby
                fireEvent_Join()
            })
        }
    }

    const userLeft = (memberID:string) => {
        //abort countdown + fetchTweets
        if (ref_state.current.state === Status.countdown) {
            ref_state.current.state = Status.init
        }
        //member id -> e.g. 2021-03-09T01:38:42.941Z7
        ref_players.current.forEach((item:Player, i) => {
            if (item.pusherID === memberID) {
                ref_players.current.splice(i,1)
                addSysMsg(SysMsgType.userLeft, item.name)
                forceUpdate()
                assignJoinEventAdmin()
                return
            }
        })
    }

    const leaveGame = () => {
        log('leaving')
        setPusherState(Pu.State.connecting)
        //unsubscribe from lobby channel
        let name:string = Pu.Channel_Lobby + ref_state.current.matchID
        ref_pusherClient.current.unsubscribe(name)
        //refresh window -> closes websocket connection
        window.location.reload()
    }

    /*
    ##################################
    ##################################
        EVENT: Join
    ##################################
    ##################################
    */
    const handleEvent_Join = (event:Event_Join) => {

        /*
        let str = JSON.stringify(event.data, null, 4)
        log(str)
        */

        //security
        if (event.type !== Pu.EventType.Join) {
            log('EventType mismatch in handleEvent_Admin:\n\n' + event)
            return
        }
        let triggerUser = event.data.username
            
        //encapsulated join
        const joinPlayer = () => {
            let newUser:Player = {
                name: event.data.username,
                pusherID: event.data.userid,
                ready: false
            }
            //avoid double names
            for (let i=0;i<ref_players.current.length;i++) {
                if (ref_players.current[i].name === newUser.name) {
                    newUser.name += '1'
                    i = 0 //restart loop
                }
            }
            ref_players.current.push(newUser)
            addSysMsg(SysMsgType.userJoined, newUser.name)
        }

        if (ref_players.current.length === 0 && triggerUser === ref_username.current) {
            /*
                you are the only one in the game
                -> dont send out event, add youself manually
            */
            log('you are the only person in the room')
            //insert welcome first
            let currentUrl = window.location.href
            addSysMsg(SysMsgType.welcome,   '🎉 Welcome to your matchroom!') 
            addSysMsg(SysMsgType.welcome,   '🎉 Invite the people you wanna play by sending them the match-link (Browser-URL).' +
                                            ' You can also let others scan the QR Code.' +
                                            ' The game will start when everyone is ready.') 
            addSysMsg(SysMsgType.welcome,   currentUrl) 
            joinPlayer()
            setPusherState(Pu.State.connected) //force update incl.
        }
        else if (ref_players.current[0].name === ref_username.current) {
            /*
                you are admin
                -> attach new user 
                -> broadcast current state
            */
            log('BROADCAST join for: ' + triggerUser)
            joinPlayer()
            fireEvent_Chat()
            fireEvent_Players()
            fireEvent_Profiles()
            fireEvent_Settings()
        }
    }

    const fireEvent_Join = async () => {

        //prepare
        let event_data:Event_Join_Data = {
            username: ref_username.current,
            userid: ref_pusherChannel.current.members.me.id
        }
        let event:Event_Join = {
            type: Pu.EventType.Join,
            data: event_data
        }
        //trigger
        Pu.triggerEvent(getLobbyName(), event.type, event)
    }

    /*
    ##################################
    ##################################
        EVENT: Player
    ##################################
    ##################################
    */
    const assignJoinEventAdmin = () => {
        /*
            This has to be called when a new user joins or one leaves
            -> assign admin to answer join event
            -> only first player handles join and ping event
            (unbind first to avoid double calling!)
        */
        if (ref_players.current.length > 0) {
            ref_pusherChannel.current.unbind(Pu.EventType.Join)
            if (ref_players.current[0].name === ref_username.current) {
                //bind
                ref_pusherChannel.current.bind(Pu.EventType.Join,
                    (data:any) => handleEvent_Join(data)
                )
                log('Bound admin events')
            }
        }
    }

    const handleEvent_Player = (event:Event_Players) => {

        //let str = JSON.stringify(event.data, null, 4);
        //log(str)

        //log(pusherChannel.members.count)
        //security
        if (event.type !== Pu.EventType.Player) {
            log('EventType mismatch in handleEvent_Player:\n\n' + event)
            return
        }

        //set new state
        let newState:State = event.state
        ref_state.current = newState

        //set new players
        let newPlayers:Player[] = event.data
        log('total players: ' + newPlayers.length)
        ref_players.current = newPlayers
        setPusherState(Pu.State.connected) //force update incl. here
        assignJoinEventAdmin()

        //set every name when new player joined, bc. admin can edit name to avoid duplicates
        ref_players.current.forEach((item:Player) => {
            if (item.pusherID === ref_pusherChannel.current.members.me.id) {
                ref_username.current = item.name
            }
        }) 

        /*  
        ################
        CHECK IF COUNTDOWN CAN BE STARTED
        ################
        */
        //let first user trigger management of game content
        if (ref_state.current.state === Status.init && isAdmin()) {
            
            //everyone ready?
            for(let i=0;i<ref_players.current.length;i++) {
                if (!ref_players.current[i].ready) return
            }
            log('everyone ready!')

            //start countdown for everyone
            ref_state.current.state = Status.countdown
            fireEvent_Players()
        }
        /*  
        ################
        START COUNTDOWN
        ################
        */
        else if (ref_state.current.state === Status.countdown) {

            let timeouts:NodeJS.Timeout[] = [] //store timeout to clear when aborted
            const checkCancelled = ():boolean => {
                if (ref_state.current.state === Status.init) {
                    //set everyone unready
                    ref_players.current.forEach((value) => {
                        value.ready = false
                    })
                    //show info
                    showNotification('Someone left, cancelled starting...', Not.Type.Warning)
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
            if (isAdmin()) {
                const startGame = () => {
                    if (checkCancelled()) {return}
                    ref_state.current.state = Status.getTweets
                    fireEvent_Players()
                }
                timeouts.push(setTimeout(() => startGame(), 1)) //5200
            }
        }
        /*  
        ################
        START GETTING TWEETS
        ################
        */
        else if (isAdmin() &&
                ref_state.current.state === Status.getTweets &&
                ref_state.current.stateTexts.length === 0) { 
            //first user starts and only call when not called already (stateTexts.length === 0)
            triggerMatchSetup()
        }
    }

    const fireEvent_Players = async () => {
        //prepare
        let event:Event_Players = {
            type: Pu.EventType.Player,
            data: ref_players.current,
            state: ref_state.current 
        }
        //trigger
        Pu.triggerEvent(getLobbyName(), event.type, event)
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
    const handleEvent_Chat = (event:Pu.Event) => {

        //security
        if (event.type !== Pu.EventType.Chat) {
            log('EventType mismatch in handleEvent_Chat:\n\n' + event)
            return
        }

        //set new chat
        let newChat:ChatMsg[] = event.data
        log('total msgs: ' + newChat.length)
        ref_chat.current = newChat
        forceUpdate()
        
    }

    const fireEvent_Chat = async () => {

        //remove first message of chat until chat is smaller than 10KB
        let chatString = JSON.stringify(ref_chat.current)
        while (chatString.length > 10000) {
            log('Chat too long\n -> removing first message')
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
        let event:Pu.Event = {
            type: Pu.EventType.Chat,
            data: ref_chat.current
        }
        //trigger
        Pu.triggerEvent(getLobbyName(), event.type, event)
    }

    /*
    ##################################
    ##################################
        EVENT: Profiles
    ##################################
    ##################################
    */
    const handleEvent_Profile = (event:Pu.Event) => {

        //security
        if (event.type !== Pu.EventType.Profile) {
            log('EventType mismatch in handleEvent_Profile:\n\n' + event)
            return
        }

        //set new profiles
        let newProfiles:Profile[] = event.data
        log('total profiles: ' + newProfiles.length)
        ref_profiles.current = newProfiles
        forceUpdate()
    }

    const fireEvent_Profiles = async () => {

        //prepare
        let event:Pu.Event = {
            type: Pu.EventType.Profile,
            data: ref_profiles.current
        }
        //trigger
        Pu.triggerEvent(getLobbyName(), event.type, event)
    }

    /*
    ##################################
    ##################################
        EVENT: Settings
    ##################################
    ##################################
    */
    const handleEvent_Settings = (event:Pu.Event) => {

        //security
        if (event.type !== Pu.EventType.Settings) {
            log('EventType mismatch in handleEvent_Settings:\n\n' + event)
            return
        }

        //set new settings
        let newSettings:Settings.Settings_Lobby = event.data
        log('new Settings received')
        ref_settings.current = newSettings
        forceUpdate()

        //adjust rounds (space) in ref_tweets
        ref_tweets.current = new Array<Tweet>(ref_settings.current.rounds)
    }

    const fireEvent_Settings = async () => {

        //prepare
        let event:Pu.Event = {
            type: Pu.EventType.Settings,
            data: ref_settings.current
        }
        //trigger
        Pu.triggerEvent(getLobbyName(), event.type, event)
    }

    /*
    ##################################
    ##################################
        EVENT: Tweets
    ##################################
    ##################################
    */
    const handleEvent_Tweets = (event:Event_Tweets) => {

        //security
        if (event.type !== Pu.EventType.Tweets) {
            log('EventType mismatch in handleEvent_Settings:\n\n' + event)
            return
        }

        //add new tweets
        let data:Tweet[] = event.data
        let bottomIndex = event.bottomIndex
        data.forEach((item) => {
            ref_tweets.current[bottomIndex] = item
            bottomIndex++
        })
        //log(ref_tweets.current)
    }

    const fireEvent_Tweets = async (_data:Tweet[], _bottomIndex:number) => {

        //prepare
        let event:Event_Tweets = {
            type: Pu.EventType.Tweets,
            data: _data,
            bottomIndex: _bottomIndex
        }
        log(`broadcast ${_data.length} tweets with ${_bottomIndex} bottomIndex`)
        //trigger
        Pu.triggerEvent(getLobbyName(), event.type, event)
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
            profile: Profile,
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
            log('\n' + profile.id_str + ' - fetching tweets for: ' + profile.screen_name)

            currentMaxID.current = ''
            noMoreTweets.current = false
            tweets.current = []

            //iterate timeline backwards
            for(let j=0;j<iterations;j++) {

                if (noMoreTweets.current) {
                    break
                }
                log('Round: ' + (j+1))

                await getTweets(profile.id_str, currentMaxID.current)
                .then(res => {
                    
                    if (res.length === 0) {
                        addStateMsg('Error: No available tweets for: ' + profile.screen_name)
                        log('\t NO TWEETS')
                        noMoreTweets.current = true
                    }
                    else if (res.length === 1 && res[0].id_str === currentMaxID.current) {
                        //last tweet (maxid) came back itself
                        log('\t -> no more tweets')
                        noMoreTweets.current = true
                    }
                    else {
                        log('\t' + res.length)
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
                    log('error retrieving tweets: ' + err)
                    return
                })
            }
            log('--> ' + tweets.current.length + ' total tweets')
            //log(tweets.current)

            let obj:ProfileTweets = {
                profile: profile,
                tweets: tweets.current 
            }
            profileTweets.push(obj)
        }
        //log(profileTweets)
        addStateMsg('Dumping boring tweets')

        /*
        ###################
        REMOVE TWEETS WITH is_quote_status=true
        ###################
        */
        //each profile
        let count = 0
        profileTweets.forEach((item) => {
            //each tweet (backwards)
            log(item.tweets.length)
            for(let i=item.tweets.length-1;i>=0;i--) {
                if (item.tweets[i].is_quote_status) {
                    item.tweets.splice(i,1)
                    count++
                }
            }
        })
        //addStateMsg(`Removed ${count} 'reply to' tweets`)
        log(`Removed ${count} 'reply to' tweets`)

        /*
        ###################
        EXTRACT RANDOM TWEETS
        ###################
        */
        function getDistinctRandomNumbers(max:number, count:number, sort:boolean):number[] {
            let numbers:number[] = []
            while (numbers.length < count) {
                let rnd = getRandomInt(max)
                let add = true
                //check already added
                for(let i=0;i<numbers.length;i++) {
                    if (rnd === numbers[i]) {
                        add = false
                        break
                    }
                }
                if (add) {numbers.push(rnd)}
            }
            if (sort) {numbers.sort((a, b) => b - a)} //sort desc
            return numbers
        }
        function getRandomInt(max:number):number {
            return Math.floor(Math.random() * Math.floor(max))
        }

        //calc total tweets available -> adjust rounds if necessary
        let totalTweets = 0
        for(let i = 0;i<profileTweets.length;i++) {
            totalTweets += profileTweets[i].tweets.length
        }
        log(`${totalTweets} tweets from ${profileTweets.length} profiles for ${ref_settings.current.rounds} rounds available`)
        if (totalTweets < ref_settings.current.rounds) {
            addStateMsg(`Set rounds to ${totalTweets}`)
            log(`Set rounds to ${totalTweets} because there are not enough tweets to play`)
            ref_settings.current.rounds = totalTweets
        }

        //calc tweet ratio per profile
        let ratio:number = Math.floor(ref_settings.current.rounds/ref_profiles.current.length)
        log('ratio: ' + ratio)
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
                log(`Added ${item.tweets.length} tweets from ${item.profile.screen_name}`)
                profileTweets[i].tweets = []
            }
            //profile has more than needed
            else {
                let indexes = getDistinctRandomNumbers(item.tweets.length, ratio, true)
                //log(indexes.toString())
                for (let j=0;j<indexes.length;j++) {
                    tweetsToPlay.push(item.tweets[indexes[j]])
                    profileTweets[i].tweets.splice(indexes[j], 1)
                }
                log(`Added ${ratio} tweets from ${item.profile.screen_name}`)
            }
        }
        //log(profileTweets)
        //log(tweetsToPlay)
        //log(tweetsToPlay.length + ' tweets to play')

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
                    log(`Added 1 tweet from ${item.profile.screen_name}`)
                }
            }
        }
        //log(tweetsToPlay.length + ' tweets to play')

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
            log('error retrieving tweets: ' + body.message)
            return
        }
        //log(body.data)
        //log(body.includes)
        let parsedTweets = parseTweets(body.data, body.includes, ref_profiles.current)
        //log(parsedTweets)

        /*
        ###################
        RANDOMIZE 
        ###################
        */
        let indexes = getDistinctRandomNumbers(parsedTweets.length, parsedTweets.length, false)
        let finalTweets:Tweet[] = []
        indexes.forEach((val) => {
            finalTweets.push(parsedTweets[val])
        })
        log(finalTweets)
        /*
        ###################
        BROADCAST TWEETS
        ###################
        */
        //split tweets in portions of 10
        let bulk:Tweet[] = []
        finalTweets.forEach((tweet,i) => {
            //first and middle bulks
            if (i % 10 === 0 && i > 0) {
                fireEvent_Tweets(bulk, i-bulk.length)
                bulk = []
                bulk.push(tweet)
            }
            //last bulk
            else if (i === finalTweets.length-1) {
                bulk.push(tweet)
                fireEvent_Tweets(bulk, i-(bulk.length-1))
            }
            else {
                bulk.push(tweet)
            }
        })

        /*
        ###################
        UX-MESSAGES
        ###################
        */
        setTimeout(() => {
            addStateMsg('Stirring the pot')
        }, 2000)
        setTimeout(() => {
            addStateMsg(`Pulling ${ref_settings.current.rounds} tweets`)
        }, 4000)
        setTimeout(() => {
            addStateMsg('Joining Matchroom')
        }, 6000)
        /*
        ###################
        REDIRECT TO MATCH
        ###################
        */
        setTimeout(() => {
            ref_state.current.state = Status.redirectToMatch
            setTimeout(() => fireEvent_Players(), 3000) //TEST
            forceUpdate() //TEST
            //fireEvent_Players() //ORIGINAL
        }, 1)
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
        //log(body.data.length + ' tweets')
        //log(body)
        return body.data
    }

    const parseTweets = (data:[], includes:any, profiles:Profile[]):Tweet[] => {
        
        const getProfileForAuthorID = (id:string):Profile => {
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

        log('parsing tweets')
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
            let text_cut = ""
            let ph1 = ""
            let ph2 = ""
            let ph3 = ""
            let ph4 = ""
            if (!("attachments" in item)) {
                //no photos -> no link in text
                text_cut = text_org
                //log("no photos for this tweet")
            }
            else {
                //remove link from text
                let index = text_org.lastIndexOf('https://')
                text_cut = text_org.substring(0, index).trimEnd()
                //photos
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
        Functions to child components
    ##################################
    ##################################
    */

    //passed to search component
    const onAddProfile = (newUser: Profile):void => {

        //check if user has tweets
        if (newUser.statuses_count === 0) {
            showNotification('User should have posted at least one tweet', Not.Type.Error)
            return
        }

        //check already added
        for(let i=0;i<ref_profiles.current.length;i++) {
            if (ref_profiles.current[i].screen_name === newUser.screen_name) {
                showNotification(newUser.name + ' already added!', Not.Type.Error)
                return
            }
        }

        //check maximum
        if (ref_profiles.current.length >= 10) {
            showNotification('Maximum number of 10 profiles reached', Not.Type.Error)
            return
        }
        
        //check pusher event size
        let alreadyL = JSON.stringify(ref_profiles.current).length
        let newUserL = JSON.stringify(newUser).length
        if ((alreadyL + newUserL) > 9000) {
            showNotification('Pusher server cannot support more profiles!', Not.Type.Error)
            return
        }

        //if user did not post a lot, show warning
        if (newUser.statuses_count < 20) {
            showNotification('Playing profiles with few tweets might affect the game experience', Not.Type.Warning)
        }

        //add
        log('profile added: ' + newUser.screen_name)
        ref_profiles.current.push(newUser)
        fireEvent_Profiles()
    }

    //passed to chat 
    const onNewChatMessage = (newMsg:ChatMsg) => {
        //log('new chat msg received: ' + newMsg.m)
        newMsg.n = ref_username.current //chat component does not know/set user name
        ref_chat.current.push(newMsg)
        fireEvent_Chat()
    }

    const onLeaveTriggered = () => {
        leaveGame()
    }

    const onToogleReady = (ready:boolean) => {
        if (ref_profiles.current.length < 2) {
            showNotification('You have to add at least two profiles from the left panel to start', Not.Type.Warning)
            return
        }
        toogleReady(ready)
    }

    const onNewNotification = (msg:string, notType:Not.Type) => {
        showNotification(msg, notType)
    }

    const onRemoveProfile = (deletedUser: Profile):void => {
        for(let i = 0; i<ref_profiles.current.length;i++) {
            if (ref_profiles.current[i].screen_name === deletedUser.screen_name) {
                ref_profiles.current.splice(i, 1)
                log('user removed: ' + deletedUser.screen_name)
                fireEvent_Profiles()
                return
            }
        }
    }

    const onSettingsChanged = (newSettings:Settings.Settings_Lobby) => {
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
            return isAdmin()
        }
        return false
    }

    /*
    ##################################
    ##################################
            UI
    ##################################
    ##################################
    */

    const getSpecialContent = () => {

        let content = <div></div>

        if (!validMatchID) {
            content =  
                <div className={st.State_Con}>
                    Invalid Match ID! Double check the URL, only numbers allowed
                </div>
            return content
        }

        //redirect back to join page
        if (redirectToJoin) {
            let redirectURL = '/join/' + ref_state.current.matchID
            return <Redirect to={redirectURL}/>
        }
        
        //PUSHER STATE
        /*
            init = 'init',
            connecting = 'connecting',
            connected = 'connected',
            unavailable = 'unavailable',
            disconnected = 'disconnected',
            error = 'error'
        */

        //loading
        if (ref_pusherState.current === Pu.State.init ||
            ref_pusherState.current === Pu.State.connecting) {
            content =  
                <div className={st.State_Con}>
                    <CircularProgress/>
                </div>
        }
        //error
        else if (ref_pusherState.current !== Pu.State.connected) {
            content =  
                <div className={st.State_Con}>
                    Could not connect to lobby, pusher service status is: {ref_pusherState.current}. 
                    Please try again later!
                </div>
        }

        /*
            SETUP STATE
            -> if all good with pusher, look at actual state of setup
        */
        //retrieve tweets
        if (ref_state.current.state === Status.getTweets) {

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
        //redirect to match
        else if (ref_state.current.state === Status.redirectToMatch) {

            //store data to pass to new route in session storage
            sessionStorage.setItem(LocalStorage.Trans_Tweets, JSON.stringify(ref_tweets.current))
            sessionStorage.setItem(LocalStorage.Trans_Players, JSON.stringify(ref_players.current))
            sessionStorage.setItem(LocalStorage.Trans_Profiles, JSON.stringify(ref_profiles.current))
            sessionStorage.setItem(LocalStorage.Trans_Settings, JSON.stringify(ref_settings.current))
            sessionStorage.setItem(LocalStorage.Username, ref_username.current)

            let redirectURL = '/match/' + ref_state.current.matchID
            return <Redirect to={redirectURL}/>
        }

        return content
    }
    
    return (
        <div className={st.Content_Con}>
            {getSpecialContent()}
            <div className={ref_state.current.state === Status.init ? st.Left_Panel : st.Left_Panel_disabled}>
                <div className={st.Add_Con}>
                    {Add(
                        ref_profiles.current,
                        popProfilesMock,
                        onAddProfile,
                        onNewNotification
                    )}
                </div>
            </div>
            <div className={ref_state.current.state === Status.init ? st.Center_Panel : st.Center_Panel_disabled}>
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
            </div>
            <div className={st.Right_Panel}>
                <div className={ref_state.current.state === Status.init ? st.Interaction_Con : st.Interaction_Con_disabled}>
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
                    {Chat.getComponent(
                        ref_chat.current,
                        onNewChatMessage
                    )}
                </div>
            </div>
            {Not.getComponent(ref_notification.current)}
        </div>
    );
}