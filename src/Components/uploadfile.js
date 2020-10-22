import React, {  useRef, useState, useEffect } from 'react';
import { Auth, API, Storage } from 'aws-amplify';

import { listObjects } from './graphql/queries';
import { CreateObject as CreateObjectMutetion } from './graphql/mutations';


const initialFile = {
    filename: '',
    description: '',
    email: ''
  };

  function loadUserInfo(mounted) {
    Auth.currentUserInfo()
      .then((user) => {
        initialFile.username = user.attributes.email;
        initialFile.lastname = user.attributes.email;
        initialFile.key = `private/${user.id}/`;
        if (mounted)
          setFileData(initialFile);
      }).catch((e) => console.log(e))
  }
  class UploadFile extends React.Component{

  }
  export default UploadFile