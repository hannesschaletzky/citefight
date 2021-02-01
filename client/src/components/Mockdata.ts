import {Ranking_User} from './Interfaces'
import {Answer} from './Interfaces'

import {Tweet} from './Interfaces'
import {Tweet_Content} from './Interfaces'
import {Tweet_TopPart} from './Interfaces'
import {Tweet_BottomPart} from './Interfaces'

export class Mockdata {

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

    getAnswers() {
        return  {
            answer1: this.answer1,
            answer2: this.answer2,
            answer3: this.answer3
        }
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

    getRanking() {
        return  {
            user1: this.rankUser1,
            user2: this.rankUser2,
            user3: this.rankUser3,
            user4: this.rankUser4,
            user5: this.rankUser5,
            user6: this.rankUser6,
            user7: this.rankUser7,
            user8: this.rankUser8,
            user9: this.rankUser9,
            user10: this.rankUser10,
            user11: this.rankUser11,
            user12: this.rankUser12,
            user13: this.rankUser13,
            user14: this.rankUser14,
            user15: this.rankUser15,
            user16: this.rankUser16,
            user17: this.rankUser17,
            user18: this.rankUser18
        }
    }













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
        userVerified: 1,
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
    getTweet() {
        return this.tweet
    }

}