export enum LocalStorage {
    //used for getting user access token OAuth Process
    Token = 'Token',
    Token_Secret = 'Token_Secret',
    Access_Token = 'Access_Token',
    Access_Token_Secret = 'Access_Token_Secret',
    MatchID = 'MatchID',
    TwitterLoginSuccess = 'TwitterLoginSuccess',
    Username = 'Username',
    //used to enter game
    JoinGame = 'JoinGame',
    //Redirect Storage Vars from setup to match
    Trans_Tweets = 'Tweets',
    Trans_Players = 'Players',
    Trans_Profiles = 'Profiles',
    Trans_Settings = 'Settings'
}

export enum TwitterStatus {
    none,
    tokenRequested,
    tokenReceived,
    signedIn,
    error
}

export enum ProfilesUsage {
    Search,
    Added,
    Answer
}

export enum SysMsgType {
    none = '1',
    userJoined = '2',
    userLeft = '3',
    welcome = '4',
    startInfo = '5',
}


export interface Player {
    name: string;
    pusherID: string;
    ready: boolean;
}

export interface Profile {
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

export interface ChatMsg {
    n: string;      //name
    m: string;      //message
    t: SysMsgType;  //type
}



/*
    TWEET 
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

