export enum LocalStorage {
    //used for getting user access token OAuth Process
    Token = 'Token',
    Token_Secret = 'Token_Secret',
    Access_Token = 'Access_Token',
    Access_Token_Secret = 'Access_Token_Secret',
    MatchID = 'MatchID',
    TwitterLoginSuccess = 'TwitterLoginSuccess',
    Username = 'Username',
    FadeInClass = 'FadeInClass',
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

export type Matrix = {[index:string] : Point[]}
export interface Point {
    goal: string        //target usertag
    answer: string      //chosen usertag
    correct: boolean    //evaluation
    timeMS: number      //answer time in Milliseconds
    ready: boolean
}

/*
    TWEET 
*/
export interface Tweet {
    //TOP PART
    t_userName: string
    t_userTag: string,
    t_userVerified: boolean,
    t_profileURL: string,
    t_userPicURL: string,
    t_tweetURL: string
    //CONTENT
    c_text: string,
    c_photo1: string,
    c_photo2: string,
    c_photo3: string,
    c_photo4: string,
    //BOTTOM PART
    b_replyCount: string,
    b_likeCount: string,
    b_retweetCount: string,
    b_date: string
}

