import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify, { Auth, API, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';

import { getObject, listObjects } from './graphql/queries';
import { createObject as createObjectMutation, deleteObject as deleteObjectMutation } from './graphql/mutations';

Amplify.configure(awsconfig)

Storage.configure({ level: 'private' });
const initialFormState = { description: '' }
const emailState = { email: '' }


var getExtension = function (url) {
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
	async function getEmail() {
		console.log("Getting email...")
		Auth.currentUserInfo()
			.then(res => { setUserEmail(res.attributes.email); console.log("Email is: " + res.attributes.email + "!"); })
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
		console.log("Calling from onChange(): file.name='" + file.name + "'");
		setFormData({ ...formData, email: userEmail, filename: file.name });
		setFileName(file.name);
		set_File(file);
	}

	async function fetchObjects() {
		console.log("Fetching...")
		const apiData = await API.graphql({ query: listObjects });

		const objectsFromAPI = apiData.data.listObjects.items;

		setObjects(objectsFromAPI);
	}



	async function createObjects() {
		//e.preventDefault();
		console.log("Into createObjects()")
		if (!formData.description) {
			console.log("BYE :(");
			return;
		}
		await API.graphql({ query: createObjectMutation, variables: { input: formData } });
		if (formData.filename) {
			console.log("Calling from creatObjects(), Putting into storage...")
			console.log("in createObjects() filename = " + fileName + " _file = " + _file);
			await Storage.put(fileName, _file, { level: 'private' });
			//formData.file = file;
			console.log("Put successfully!")
			window.alert("File Successfully Uploaded")
		}
	
		fetchObjects();
	}
	async function getLink( nameOfFile ) {
		
		try{
			console.log("file name for link" + nameOfFile)
			//const fileLink = await Storage.get(nameOfFile);
			//console.log("link for thr object",fileLink)
			return await Storage.get(nameOfFile);
		}catch(err) {
			console.log(err)
			
		  }
		
	}


	async function deleteObject(id, nameoffile ) {
		console.log("Calling from deleteObject(): ID: " + id + " " + nameoffile);
		
		const newObjectsArray = objects.filter(note => note.id !== id);
		setObjects(newObjectsArray); console.log("printing new obj Array", newObjectsArray)
		
		await Storage.remove(nameoffile)
			.then(result => console.log(result), window.alert("File Successfully deleted"))
			.catch(err => console.log(err));
		await API.graphql({ query: deleteObjectMutation, variables: { input: { id } } });

	}

	return (
		<div className="App">

			<header className="App-header">
				<AmplifySignOut />
				<h2>Beehive</h2>

				<input
					onChange={e => setFormData({ ...formData, 'description': e.target.value })}
					placeholder="File description"
					value={formData.description}
				/>
				<input
					type="file"
					onChange={onChange}
				/>
				<button onClick={createObjects}>Upload Image</button>

				<div style={{ marginBottom: 30 }}>
					{
						objects.map(file => (
							<div key={file.id || file.filename}>
								<i><h2>{file.filename}</h2></i>
								<p>{file.description}</p>
								<button onClick={() => { deleteObject(file.id, file.filename); }}>Delete Object</button>
								<button onClick={() => { Storage.get(file.filename) }}>Get Link!</button>
								
								<a href={getLink(file.filename)} > link </a>
							</div>
						))
					}
				</div>
			</header>
		</div>
	);

}
export default withAuthenticator(App);
