export enum TwitterStatus {
    none = '1',
    signedIn = '2',
    error = '3'
}

export enum SysMsgType {
    none = '1',
    userJoined = '2',
    userLeft = '3',
    welcome = '4',
    info = '5'
}

export enum SetupEventType {
    Join = 'Setup_Join',
    Chat = 'Setup_Chat',
    Player = 'Setup_Player'
}

export enum SetupJoinStatus {
    NotJoined = 'NotJoined',
    Connecting = 'Connecting',
    Failed = 'Failed',
    Joined = 'Joined'
}

export enum PusherConState {
    initialized = 'initialized',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    failed = 'failed',
    disconnected = 'disconnected',
}

export enum SetupChatStatus {
    enabled = 'enabled',
    disabled = 'disabled',
    inputTooLong = 'inputTooLong',
    sentTooMuch = 'sentTooMuch',
}

/*
    SETUP OBJECTS
*/

export interface Setup_Event {
    type: SetupEventType;
    data: any;
}

export interface Setup_Player {
    name: string;
    ready: boolean;
}


export interface Setup_ChatMsg {
    n: string;      //name
    m: string;      //message
    t: SysMsgType;  //type
}




/*
    API TWITTER
*/
export interface Twitter_User {
    id: bigint;
    screen_name: string;
    name: string;
    description: string;
    location: string;
    verified: boolean;
    protected: boolean;
    following: boolean;
    followers_count: number;
    statuses_count: number;
    profile_image_url_https: string;
}



/*
    MATCH
*/
/*
    RIGHT PANEL
*/
export interface Ranking_User {
    name: string;
    points: number;
    totalTime: number;
}

export interface Answer {
    name: string,
    tag: string,
    isVerified: number,
    picURL: string
}



/*
    CENTER 
*/
export interface Tweet {
    content: Tweet_Content,
    topPart: Tweet_TopPart,
    bottomPart: Tweet_BottomPart
}

export interface Tweet_Content {
    text: string,
    photo1: string,
    photo2: string,
    photo3: string,
    photo4: string,
}

export interface Tweet_TopPart {
    userName: string
    userTag: string,
    userVerified: number,
    profileURL: string,
    userPicURL: string,
    tweetURL: string
}

export interface Tweet_BottomPart {
    replyCount: string,
    likeCount: string,
    retweetCount: string,
    date: string
}