import {log} from 'components/Logic'

const Pusher = require('pusher-js');

//export const getPusherClient = (channelName:string) => { -> with input parameters
export const getNewPusherClient = () => {
    return new Promise((resolve, reject) => {

        //create random userid
        let rndID = new Date().toISOString()
        rndID += Math.floor(Math.random() * Math.floor(10))
        
        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
            cluster: cluster,
            encrypted: true,
            authEndpoint: '/api/pusher/auth?id=' + rndID
        })

        //bind error event
        _pusherClient.connection.bind('error', (err:any) => {
            log('error connecting')
            reject(Error("It broke"))
        })

        //bind connected
        _pusherClient.connection.bind('connected', async () => {
            log('pusher is connected')
            resolve(_pusherClient)
            return
            /*
            //sub channel
            const channel = _pusherClient.subscribe(channelName)
            // -> success
            channel.bind('pusher:subscription_succeeded', () => {
                log('subbed to: ' + channelName)
                resolve(_pusherClient)
                return
            })
            // -> error
            channel.bind('pusher:subscription_error', (err:any) => {
                log('subscription_error')
                reject(Error("It broke"))
            })
            channel.bind('pusher:member_removed', (member:any) => {
                log('member_removed')
                reject(Error("It broke"))
            })
            channel.bind('pusher:member_added', (member:any) => {
                log('member_added')
                reject(Error("It broke"))
            })
            */
        })
    })
}
