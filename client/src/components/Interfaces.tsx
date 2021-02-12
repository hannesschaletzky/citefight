export enum SysMsg {
    none = 'none',
    userJoined = 'userJoined',
    userLeft = 'userLeft'
}

/*
    SETUP OBJECTS
*/

export interface Setup_Player {
    name: string;
    
    /** @default true */
    connected ? : boolean;
}

export interface Setup_ChatMsg {
    name: string;
    message: string;
    sysMsgType: SysMsg;
}

//state container object of Setup
export interface Setup_State {
    players: Setup_Player[];
    chat: Setup_ChatMsg[];
    selectedTwitterUser: Twitter_User[];
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