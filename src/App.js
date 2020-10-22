import React from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify,{Auth, API, Storage} from 'aws-amplify';
import awsconfig from './aws-exports';
import {AmplifySignOut, withAuthenticator} from '@aws-amplify/ui-react';

import { listObjects } from './graphql/queries';
import { CreateObject as CreateObjectMutetion, deleteObject as deleteObjectMutation } from './graphql/mutations';

Amplify.configure(awsconfig)

Storage.configure({ level: 'private' });

function App() {
  const [objects, setObjects] = useState([]);
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <AmplifySignOut />
        <h2>Beehive</h2>
      </header>
    </div>
  );
}

export default withAuthenticator(App);
