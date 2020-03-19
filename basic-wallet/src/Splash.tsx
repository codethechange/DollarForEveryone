import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const UID = 'uID'
const NODE_URL = ''
const CONTEXT='dollarforeveryone'

function Splash() {
    
    const uID: string = localStorage.getItem(UID) || uuidv4()
    if (uID !== localStorage.getItem(UID)) {
        localStorage.setItem(UID, uID)
    }
  
    return (
        <>
            
            {uID }
            <a href="brightid://link-verification/<node_url>/<context>/<context_id>"> BrightID Deep Link</a>
        </>
    
    );
  }

export default Splash