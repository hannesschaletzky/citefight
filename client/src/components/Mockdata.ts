
import {Tweet} from './Interfaces'
import {Tweet_Content} from './Interfaces'
import {Tweet_TopPart} from './Interfaces'
import {Tweet_BottomPart} from './Interfaces'

import {Profile} from 'components/Interfaces'

//popular profiles mockdata
export const popProfilesMock:Profile[] = [
    {
        id_str:'342599843',
        screen_name: 'MarioGoetze',
        name: 'Mario Götze',
        description: "It's me Mario",
        location: 'Eindhoven, Nederland',
        verified: true,
        protected: false,
        following: false, 
        followers_count: 4299723, 
        statuses_count: 1334, 
        profile_image_url_https: "https://pbs.twimg.com/profile_images/1352250255048396801/MdiZUeLH_normal.jpg"
    },
    {
        id_str:'2359476565',
        screen_name: 'matshummels',
        name: 'Mats Hummels',
        description: "Official Account of Mats Hummels - German Football Player",
        location: 'Dortmund',
        verified: true,
        protected: false,
        following: false, 
        followers_count: 2169147, 
        statuses_count: 1662, 
        profile_image_url_https: "https://pbs.twimg.com/profile_images/1123228138316750848/WK6tgKGC_normal.png"
    }

]


export class Mockdata {

    /*
    private answer1: Answer = {
        name: 'Mario Götze',
        tag: 'MarioGoetze',
        isVerified: 1,
        picURL: 'http://pbs.twimg.com/profile_images/1352250255048396801/MdiZUeLH_normal.jpg' 
    }
    private answer2: Answer = {
        name: 'Basti Schweinsteiger',
        tag: 'BSchweinsteiger',
        isVerified: 1,
        picURL: 'http://pbs.twimg.com/profile_images/1221743739045138432/WuISQWsb_normal.jpg'
    }
    private answer3: Answer = {
        name: 'Philipp Lahm',
        tag: 'philipplahm',
        isVerified: 1,
        picURL: 'http://pbs.twimg.com/profile_images/1068108475832635392/C9iHIj2z_normal.jpg'
    }

    getAnswers(): Answer[] {
        let rtnArr: Answer[] = []
        rtnArr.push(this.answer1)
        rtnArr.push(this.answer2)
        rtnArr.push(this.answer3)
        return  rtnArr
    }
    









    private rankUser1: Ranking_User = { 
        name: 'Torsten',
        points: 7,
        totalTime: 19
    };

    private rankUser2: Ranking_User = { 
        name: 'Bernd',
        points: 5,
        totalTime: 24
    };

    private rankUser3: Ranking_User = { 
        name: 'Sabrina',
        points: 6,
        totalTime: 39
    };

    private rankUser4: Ranking_User = { 
        name: 'Maike',
        points: 6,
        totalTime: 22
    };

    private rankUser5: Ranking_User = { 
        name: 'Tim ich bin nur geil',
        points: 12,
        totalTime: 105
    };

    private rankUser6: Ranking_User = { 
        name: 'Anna',
        points: 2,
        totalTime: 164
    };

    private rankUser7: Ranking_User = { 
        name: 'Mark',
        points: 7,
        totalTime: 3
    };

    private rankUser8: Ranking_User = { 
        name: 'Lasse',
        points: 2,
        totalTime: 180
    };

    private rankUser9: Ranking_User = { 
        name: 'Heinz',
        points: 6,
        totalTime: 86
    };

    private rankUser10: Ranking_User = { 
        name: 'Uwe',
        points: 6,
        totalTime: 12
    };

    private rankUser11: Ranking_User = { 
        name: 'Jordan',
        points: 6,
        totalTime: 40
    };

    private rankUser12: Ranking_User = { 
        name: 'Feli',
        points: 12,
        totalTime: 50
    };

    private rankUser13: Ranking_User = { 
        name: 'Jörg',
        points: 12,
        totalTime: 160
    };

    private rankUser14: Ranking_User = { 
        name: 'Ninaaaaaaaaaaaaaaaaa',
        points: 12,
        totalTime: 70
    };

    private rankUser15: Ranking_User = { 
        name: 'Susi',
        points: 12,
        totalTime: 62
    };

    private rankUser16: Ranking_User = { 
        name: 'Teo',
        points: 2,
        totalTime: 170
    };

    private rankUser17: Ranking_User = { 
        name: 'Zen',
        points: 2,
        totalTime: 155
    };

    private rankUser18: Ranking_User = { 
        name: 'Kora',
        points: 2,
        totalTime: 162
    };

    getRanking(): Ranking_User[] {

        let rtnArr: Ranking_User[] = []

        rtnArr.push(this.rankUser1)
        rtnArr.push(this.rankUser2)
        rtnArr.push(this.rankUser3)
        rtnArr.push(this.rankUser4)
        rtnArr.push(this.rankUser5)
        rtnArr.push(this.rankUser6)
        rtnArr.push(this.rankUser7)
        rtnArr.push(this.rankUser8)
        rtnArr.push(this.rankUser9)
        rtnArr.push(this.rankUser10)
        rtnArr.push(this.rankUser11)
        rtnArr.push(this.rankUser12)
        rtnArr.push(this.rankUser13)
        rtnArr.push(this.rankUser14)
        rtnArr.push(this.rankUser15)
        rtnArr.push(this.rankUser16)
        rtnArr.push(this.rankUser17)
        rtnArr.push(this.rankUser18)

        return  rtnArr
    }
    */












    private tweet_content1: Tweet_Content = {
        text: 'Little man, big memories Face with tears of joy haha',
        photo1: 'https://pbs.twimg.com/media/EsWwrpuW8AIRn_q.jpg',
        photo2: 'https://pbs.twimg.com/media/EsWwrpvXEAAeKSW.jpg',
        photo3: 'https://pbs.twimg.com/media/EsWwrpmW8AALVuN.jpg',
        photo4: 'https://pbs.twimg.com/media/EsWwrppW4AQrA4z.jpg',
    }

    private tweet_content2: Tweet_Content = {
        text: 
            'Little man, big memories Face with tears of joy haha' + 
            'Little man, big memories Face with tears of joy haha',
        photo1: '',
        photo2: '',
        photo3: '',
        photo4: '',
    }

    private tweet_content3: Tweet_Content = {
        text: 
            'Little man, big memories Face with tears of joy haha' + 
            'Little man, big memories Face with tears of joy haha' +
            'Little man, big memories Face with tears of joy haha' + 
            'Little man, big memories Face with tears of joy haha',
        photo1: '',
        photo2: '',
        photo3: '',
        photo4: '',
    }

    private tweet_content4: Tweet_Content = {
        text: 'Little man, big memories Face with tears of joy haha',
        photo1: '',
        photo2: '',
        photo3: '',
        photo4: '',
    }

    private tweet_content5: Tweet_Content = {
        text: 
            'Little man, big memories Face with tears of joy haha',
        photo1: 'https://pbs.twimg.com/media/EsWwrpuW8AIRn_q.jpg',
        photo2: '',
        photo3: '',
        photo4: '',
    }

    getTweetContent() {
        return this.tweet_content1
    }




    

    private topPartData: Tweet_TopPart = {
        userName: 'Mario Götze',
        userTag: 'MarioGoetze',
        userVerified: true,
        profileURL: 'https://twitter.com/MarioGoetze',
        userPicURL: 'http://pbs.twimg.com/profile_images/1352250255048396801/MdiZUeLH_normal.jpg',
        tweetURL: 'https://twitter.com/MarioGoetze/status/1345396853815312385'
    }

    getTweetTopPart() {
        return this.topPartData
    }
    




    

    private bottomPartData: Tweet_BottomPart = {
        replyCount: '2.4k',
        likeCount: '5.2k',
        retweetCount: '357',
        date: '4 Mar 2013'
    }

    getTweetBottomPart() {
        return this.bottomPartData
    }








    

    private tweet: Tweet = {
        content: this.getTweetContent(),
        topPart: this.getTweetTopPart(),
        bottomPart: this.getTweetBottomPart()
    }

    //THIS HAS TO BE AT THE BOTTOM of everything, otherwise it will return undefined values
    getTweet(): Tweet {
        return this.tweet
    }

}