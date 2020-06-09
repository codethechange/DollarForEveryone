import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import './splash.css';
import PRESENT_IMAGE from './assets/Present.svg'
import ENVELOPE_IMAGE from './assets/Envelope.svg'
import SUN_IMAGE from './assets/Sun.svg'

const CONTEXT='dollarforeveryone'

class Title extends React.Component {
    render() {
      return <h2 className = "title">
                DollarForEveryone
            </h2>;
    }
}

class BeingYou extends React.Component {
    render () {
        return (
            <h2 className = "being_you">
                $1 for Being You 
            </h2>
        );
    }
}

class Description1 extends React.Component {
    render () {
        return (
            <h2 className = "description">
                 The BrightID/H4H
                 Team wants to give
                 the first 10,000
                 members $1 each.
            </h2>
        );
    }
}

class Description2 extends React.Component {
    render () {
        return (
            <h2 className = "description">
                 This $1 will be sent in
                 cryptocurrency (xDAI)
                 that you can freely
                 send to others in the
                 browser.
            </h2>
        );
    }
}

class Description3 extends React.Component {
    render () {
        return (
            <h2 className = "description">
                 To verify that you are
                 a unique individual,
                 you will use your
                 BrightID application.
            </h2>
        );
    }
}

class Description4 extends React.Component {
    render () {
        return (
            <h2 className = "description">
                 Don't have a BrightID?
                 Install it on the Play
                 Store/ App Store
                 (Testflight).
            </h2>
        );
    }
}

//links to BrightId app
class Verify extends React.Component {
    render () {
        return (
            <button 
              className="button" 
            >
                Verify with BrightID
            </button>
          );
    }
}
/*is the div creating that weird thing? if so, can we change the tag?
or do we even really need the css?*/
class Present extends React.Component {
    render () {
        return (
            <div className = "present">
                <img src = {PRESENT_IMAGE}/>
            </div>
          );
    }
}

class Envelope extends React.Component {
    render () {
        return (
            <div className = "envelope">
                <img src = {ENVELOPE_IMAGE}/>
            </div>
          );
    }
}

class Sun extends React.Component {
    render () {
        return (
            <div className = "sun">
                <p>
                    <img src = {SUN_IMAGE}/>
                </p>
            </div>
          );
    }
}



class Splash extends React.Component {
    render() {
      return (
        <div>
            <Title />
            <Sun />
            <BeingYou />
            <Present />
            <Description1 />
            <Envelope />
            <Description2 />
            <Description3 />
            <Description4 />
            <Verify />
        </div>
        )
    }
}

export default Splash //when someone imports file, they import Splash function
