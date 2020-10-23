import React, { useState , useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify,{Auth, API, Storage} from 'aws-amplify';
import awsconfig from './aws-exports';
import {AmplifySignOut, withAuthenticator} from '@aws-amplify/ui-react';

import { listObjects } from './graphql/queries';
import { createObject as createObjectMutation, deleteObject as deleteObjectMutation } from './graphql/mutations';

Amplify.configure(awsconfig)

Storage.configure({ level: 'private' });
const initialFormState = {  description: '' }
const emailState = {email: ''}


var getExtension = function(url) {
  var arr = url.split("/");
  var fileArr = arr[5].split(".");
  var fileName = fileArr[0].replace("%20", " ");
  var fileExt = fileArr[1].substring(0, fileArr[1].indexOf("?"))
  var fullFileName = fileName + "." + fileExt;
  console.log(fullFileName);
  return [fullFileName, fileExt];
}

function App() {
  const [objects, setObjects] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [fileName, setFileName] = useState('');
  const [_file, set_File] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  async function getEmail(){
      console.log("Getting email...")
      Auth.currentUserInfo()
      .then(res => {setUserEmail(res.attributes.email); console.log("Email is: " + res.attributes.email + "!");})
      .catch(err => {
        console.error(err);
      });
  }
useEffect(() => {
  fetchObjects();
  getEmail();
  }, []);
  
  async function onChange(e) {
    if (!e.target.files[0]) return
    var file = e.target.files[0];
    console.log("Calling from onChange(): file.name='"+ file.name +"'");
    setFormData({ ...formData, email: userEmail, filename: file.name});
    setFileName(file.name);
    set_File(file);
    // console.log("in onChange() var1 = " + var1 + " var2 = " + var2);
    // await Storage.put(file.name, file);
    // fetchObjects();
  }
  
  async function fetchObjects() {
    console.log("Fetching...")
    const apiData = await API.graphql({ query: listObjects });
    const objectsFromAPI = apiData.data.listObjects.items;
    
    
    setObjects(objectsFromAPI);
  }
  /*
  const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
        const fileDetails = getExtension(note.image);
        note.fileType = fileDetails[1];
        note.fileName = fileDetails[0];
        if(note.fileType === "pdf") {
           note.logoType = "https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg";
        }else{
           note.logoType = note.image;
        }
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
   */
   
  async function createObjects() {
    //e.preventDefault();
    console.log("Into createObjects()")
    if (!formData.description){
      console.log("BYE :(");
      return;
    } 
    //var file = e.target.files[0];
    await API.graphql({ query: createObjectMutation, variables: { input: formData } });
    if (formData.filename) {
      console.log("Calling from creatObjects(), Putting into storage...")
      console.log("in createObjects() filename = " + fileName + " _file = " + _file);
      await Storage.put(fileName, _file, {level: 'private'});
      //formData.file = file;
      console.log("Put successfully!")
      window.alert("File Successfully Uploaded")
    }
    // setObjects([ ...objects, formData ]);
    // setFormData(initialFormState);
    fetchObjects();
  }
  async function deleteObject({ id }) {
    console.log("Calling from deleteObject(): ID: " + id);
    const newObjectsArray = objects.filter(note => note.id !== id);
    setObjects(newObjectsArray);
   console.log("printig new obj Array",newObjectsArray )
   const nameoffile = newObjectsArray[0].filename
   console.log("nameoffile", nameoffile)
   await Storage.remove(fileName)
     .then(result => console.log(result), window.alert("File Successfully deleted"))
     .catch(err => console.log(err));
    await API.graphql({ query: deleteObjectMutation, variables: { input: { id } }});

  }

  /*async function deleteObj(fileName){
    console.log("Calling from DeleteObj(): name=" + fileName);
    await Storage.remove(fileName)
     .then(result => console.log(result))
     .catch(err => console.log(err));
  }*/
 
  return (
    <div className="App">
      
      <header className="App-header">
        <AmplifySignOut />
        <h2>Beehive</h2>
        
          <input
          onChange={e => setFormData({ ...formData, 'description': e.target.value})}
          placeholder="File description"
          value={formData.description}
        />
        <input
          type="file"
          onChange={onChange}
        />
        <button onClick={createObjects}>Upload Image</button>
      
      <div style={{marginBottom: 30}}>
      {
      objects.map(note => (
        <div key={note.id }>
          <h2>{note.name}</h2>
          <p>{note.description}</p>
          <button onClick={() => {deleteObject(note);}}>Delete Object</button>
        </div>
      ))
      }
      </div>
      </header>
    </div>
  );

}
export default withAuthenticator(App);
