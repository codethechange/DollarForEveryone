import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import './splash.css';
import PRESENT_IMAGE from './assets/Present.svg'

const CONTEXT='dollarforeveryone'


class Title extends React.Component {
    render() {
      return <h2 className = "title">DollarForEveryone</h2>;
    }
}

class BeingYou extends React.Component {
    render () {
        return <h3 className = "being_you">$1 for Being You</h3>;
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

class Present extends React.Component {
    render () {
        return (
            <img src = {PRESENT_IMAGE}/> 
          );
    }
}

class Splash extends React.Component {
    render() {
      return (
        <div>
            <Title />
            <BeingYou />
            <Present />
            <Verify />
        </div>
        )
    }
}

export default Splash //when someone imports file, they import Splash function
