import { useRef, useEffect } from 'react';
//import st from './Match.module.scss'
import {log} from 'components/Logic'

import {LocalStorage} from 'components/Interfaces'
import {Settings, 
        Settings_Roundtime, 
        Settings_Pictures, 
        Settings_DrinkingMode} from 'components/Interfaces'
import {Player} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'

import {Tweet} from 'components/Interfaces'

const init_profiles:Profile[] = []
const init_players:Player[] = []
const init_tweets:Tweet[] = [] 
const init_settings:Settings = {
    rounds: 25,
    roundtime: Settings_Roundtime.Normal,
    autoContinue: true,
    pictures: Settings_Pictures.AtHalftime,
    drinking: Settings_DrinkingMode.Off
}

export default function Match() {

    //refs
    const ref_tweets = useRef(init_tweets)
    const ref_profiles = useRef(init_profiles)
    const ref_settings = useRef(init_settings)
    const ref_players = useRef(init_players)

	useEffect(() => {

        //set initial values passed from setup
        const setValue = (ref:React.MutableRefObject<any>, type:LocalStorage) => {
            let data = sessionStorage.getItem(type)
            if (data !== null) {
                ref.current = JSON.parse(data)
                sessionStorage.removeItem(type)
                log('set item: ' + type)
                //log(ref.current)
            }
        }
        setValue(ref_tweets, LocalStorage.Trans_Content)
        setValue(ref_profiles, LocalStorage.Trans_Profiles)
        setValue(ref_players, LocalStorage.Trans_Players)
        setValue(ref_settings, LocalStorage.Trans_Settings)
  	})

	const getContent = () => {
		return <div>Matchroom</div>
	}

	return (
		getContent()
	);
}


