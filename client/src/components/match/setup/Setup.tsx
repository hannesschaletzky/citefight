import { useState, useEffect } from 'react';
import st from './Setup.module.scss'

import { useParams } from 'react-router-dom';

import Search from './parts/Search'

export default function Setup() {
    //state hook
    //const [test, setTest] = useState("");
    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        
    });

  return (

    <div className={st.Content_Con}>
        <div className={st.Left_Panel}>
            {Search()}
        </div>
        <div className={st.Center_Panel}>
            CENTER PANEL
        </div>
        <div className={st.Right_Panel}>
            RIGHT PANEL
        </div>
    </div>
  );
}










