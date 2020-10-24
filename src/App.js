import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify, { Auth, API, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
//import {Row, Col, Jumbotron} from 'react.bootstrap'
import { getObject, listObjects } from './graphql/queries';
import { createObject as createObjectMutation, deleteObject as deleteObjectMutation, updateObject as updateObjectMutation } from './graphql/mutations';
import "jquery/dist/jquery.min.js";
import "bootstrap/dist/js/bootstrap.min.js";
import { Button, Card, Col, Row, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import NavBar from './Components/navbar.js'

Amplify.configure(awsconfig)

Storage.configure({ level: 'private' });
const initialFormState = { description: '' }
const emailState = { email: '' }
const updateInfo = { id: '', description: '' }


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
	const [downloadlink, setdownloadlink] = useState('');
	const [updatedInfo, setUpdatedInfo] = useState(updateInfo);
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


		const valid = validate(formData.description, _file)

		if (valid == true) {
			await API.graphql({ query: createObjectMutation, variables: { input: formData } });
			if (formData.filename) {
				console.log("Calling from creatObjects(), Putting into storage...")
				console.log("in createObjects() filename = " + fileName + " _file = " + _file);
				await Storage.put(fileName, _file, { level: 'private' });
				//formData.file = file;
				console.log("Put successfully!")
				window.alert("File Successfully Uploaded")
			}

		}
		fetchObjects();

	}

	function validate(description, file) {
		if (!description) {
			window.alert(" Write description");
			return false;

		};
		if (file.size / 1024 / 1024 > 10) {
			window.alert("File size is too big, please upload the file size less than 10 MB ")
			return false;
		}
		return true;
	}

	async function deleteObject(id, nameoffile) {
		console.log("Calling from deleteObject(): ID: " + id + " " + nameoffile);

		const newObjectsArray = objects.filter(note => note.id !== id);
		setObjects(newObjectsArray); console.log("printing new obj Array", newObjectsArray)

		await Storage.remove(nameoffile)
			.then(result => console.log(result), window.alert("File Successfully deleted"))
			.catch(err => console.log(err));
		await API.graphql({ query: deleteObjectMutation, variables: { input: { id } } });

	}


	async function getLink(scooby) {

		try {
			console.log("file name for link " + scooby + 'type of operator  ' + typeof (scooby))
			//const fileLink = await Storage.get(nameOfFile);
			//console.log("link for thr object",fileLink)
			const URL = await Storage.get(scooby);

			console.log("url  " + URL)
			setdownloadlink(URL)
			//return URL;
		} catch (err) {
			console.log(err)

		}
	}
	function showLink(filename, id) {
		var mylink = getLink(filename);
		document.getElementById(id).innerHTML = mylink;
	}
	/*function getlink() {
		var fname = fileName
		console.log("print from get link  ", fileName) 


	} */
	async function update() {

		try {
                   console.log("updated info:" + updatedInfo);

			const updated = await API.graphql({ query: updateObjectMutation, variables: { input: updatedInfo } });
			console.log("print updated  ", updated)
		}
		catch (error) {
		}
		fetchObjects();

	}
	return (


		<div className="bg">

			<nav> <NavBar className="App-header" /> </nav>
			<h1>Welcome to Beehive (email adderess goes here)</h1>
			<div className='container'>

				<input
					type="file"
					onChange={onChange}
					className='form-control'
				/>
				<br></br>
				<input
					onChange={e => setFormData({ ...formData, 'description': e.target.value })}
					placeholder="File description"

					className="form-control form-control-lg"
					value={formData.description}
				/>
				<br></br>

				<button className='btn btn-lg btn-info' onClick={createObjects}>Upload Image</button>
			</div>
			<div className='container'>
				<div >
					{
						objects.map(file => (
							<div key={file.id || file.filename}>
								<i><h2>{file.filename}</h2></i>
								<p>{file.description}</p>
								<button onClick={() => { deleteObject(file.id, file.filename); }}>Delete Object</button>
								<button onClick={() => { getLink(file.filename) }}> Generate</button>
								<br />
								<input
								id={file.id}
									onChange={e => setUpdatedInfo({ ...updatedInfo, 'description': e.target.value, 'id': file.id })}
									placeholder="Update file description"
									type="text"
									className="form-control form-control-lg"
									value={updatedInfo.description}
								/>

								<button className='btn btn-lg btn-info' onClick={update}>Update file</button>
								
								<button className='btn btn-lg btn-info' ><a href={downloadlink} className="btn">Download</a></button>

								
								
							</div>
						))
					}
				</div>
			</div>
		</div>

	);

}
export default withAuthenticator(App);
//<button><a  href={downloadlink}> Link</a></button>
//								<a href={downloadlink}>Download</a>
/*

+++++++++++=
<button type="button" data-toggle="collapse" data-target={"#".concat(file.id)}>Update</button>
<div id={file.id} className="collapse">
									<div>
										<h4 className="modal-title">Update Description for {file.filename}</h4>
									</div>
									<div>
										<input type='text' className='form-control form-control-lg' placeholder='Enter updated info here' />
									</div>
									<div>
										<button type="button" className="btn btn-default">Close</button>
									</div>
								</div>
								<input id="addSubmit" type="submit" value="Add"></input>
*/