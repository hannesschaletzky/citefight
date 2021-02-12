export enum SysMsg {
    none = '1',
    userJoined = '2',
    userLeft = '3'
}

export enum EventType {
    init = 'init',
    chat = 'chat',
    player = 'player'
}

/*
    SETUP OBJECTS
*/

export interface Setup_Event {
    type: EventType;
    data: any;
}

export interface Setup_Player {
    name: string;
    
    /** @default true */
    connected ? : boolean;
}

export interface Setup_ChatMsg {
    name: string;
    msg: string;
    type: SysMsg;
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