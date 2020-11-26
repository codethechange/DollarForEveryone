import React, { useState, useEffect } from 'react';

import './splash.css';
import PRESENT_IMAGE from './assets/Present.svg'
import ENVELOPE_IMAGE from './assets/Envelope.svg'

interface Props {
    address: string;
}

function Splash({ address }: Props) {
    const [deepLink, setDeepLink] = useState("")
    useEffect(() => {
        fetch(`/deep-link/${address}`, {
            method: "POST"
        }).then(res => res.text())
        .then(res => {            
            setDeepLink(res)
        })
    }, [address])

    return (
    <div className="container text">
        <div className="line">
            <h2 className = "">$1 for Being You </h2>
            <img src = {PRESENT_IMAGE}/>
        </div>
        <div className="line">
            <h2>
                The BrightID/H4H Team wants to give the first 10,000 members $1 each.
            </h2>
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
        <button className="button" onClick={() => {window.location.href=deepLink}}>{deepLink ? "Verify with BrightID" : "Loading..."}</button>
    </div>
    )
}

export default Splash //when someone imports file, they import Splash function
