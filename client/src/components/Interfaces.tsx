export enum LocalStorage {
    Token = 'Token',
    Token_Secret = 'Token_Secret',
    Access_Token = 'Access_Token',
    Access_Token_Secret = 'Access_Token_Secret',
    MatchID = 'MatchID',
    Username = 'Username',
    TwitterLoginSuccess = 'TwitterLoginSuccess',
    JoinGame = 'JoinGame'
}

export enum TwitterStatus {
    none,
    tokenRequested,
    tokenReceived,
    signedIn,
    error
}

export enum NotificationType {
    Not_Success = 'Not_Success',
    Not_Warning = 'Not_Warning',
    Not_Error = 'Not_Error'
}

export enum ProfilesUsage {
    Search,
    Added
}

export enum SysMsgType {
    none = '1',
    userJoined = '2',
    userLeft = '3',
    welcome = '4',
    startInfo = '5',
}

export enum SetupEventType {
    Join = 'Setup_Join',
    Chat = 'Setup_Chat',
    Player = 'Setup_Player',
    Profile = 'Profile',
    Settings = 'Settings'
}

export enum JoinStatus {
    init,
    connecting,
    error,
}

export enum PusherState {
    init = 'init',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    disconnected = 'disconnected',
    error = 'error'
}

export enum SetupChatStatus {
    enabled = 'enabled',
    disabled = 'disabled',
    inputTooLong = 'inputTooLong',
    sentTooMuch = 'sentTooMuch',
}

export enum Settings_Roundtime {
    Little,
    Normal,
    Much
}

export enum Settings_DrinkingMode {
    Off,
    Lightweight,
    Regular,
    Beast,
}

export enum Settings_Pictures {
    Off,
    Instantly,
    AtHalftime
}

export enum SetupStateType {
    init = 'init',
    countdown = 'countdown',
    getTweets = 'getTweets',
    redirectToMatch = 'redirectToMatch'
}

/*
    SETUP OBJECTS
*/

export interface Setup_Settings {
    rounds: number;
    roundtime: Settings_Roundtime;
    drinking: Settings_DrinkingMode;
    autoContinue: boolean;
    pictures: Settings_Pictures;
}

export interface Setup_Notification {
    display: boolean;
    msg: string;
    type: NotificationType;
    scssClass: string;
}

//normal event for all other tasks
export interface Setup_Event {
    type: SetupEventType;
    data: any;
}

//special event for players incl. state 
export interface Setup_Event_Players {
    type: SetupEventType;
    data: any;
    state: Setup_State;
}
export interface Setup_State {
    gameid: string;
    state: SetupStateType;
    stateTexts: string[];
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
export interface Twitter_Profile {
    id_str: string;
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
    userVerified: boolean,
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