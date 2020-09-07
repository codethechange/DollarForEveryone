import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './splash.css';
import PRESENT_IMAGE from './assets/Present.svg'
import ENVELOPE_IMAGE from './assets/Envelope.svg'
import SUN_IMAGE from './assets/Sun.svg'

const CONTEXT='dollarforeveryone'

interface Props {
    contextId: string;
}

function Splash({ contextId }: Props) {
    const [deeplink, setDeeplink] = useState(null)
    
    useEffect(() => {
        fetch(`/api/deep-link?context_id=${contextId}`).then()
    }, [contextId])

    return (
    <div className="container">
        <h2 className = "title">DollarForEveryone</h2>
        <div className = "sun">
            <img src = {SUN_IMAGE}/>
        </div>
        <h2 className = "being_you">$1 for Being You </h2>
        <div className = "present">
            <img src = {PRESENT_IMAGE}/>
        </div>
        <h2 className = "description">The BrightID/H4H Team wants to give the first 10,000 members $1 each.
        </h2>
        <div className = "envelope">
            <img src = {ENVELOPE_IMAGE}/>
        </div>
        <h2 className = "description">
                This $1 will be sent in cryptocurrency (xDAI) that you can freely send to others in the
                browser.
        </h2>
        <h2 className = "description">
                To verify that you are a unique individual, you will use your BrightID application.
        </h2>
        <h2 className = "description">
            Don't have BrightID? Install it on the Play Store/ App Store.
        </h2>
        <button className="button">Verify with BrightID</button>
    </div>
    )
}

export default Splash //when someone imports file, they import Splash function
