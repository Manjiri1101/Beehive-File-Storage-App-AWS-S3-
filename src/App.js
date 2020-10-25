import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import Amplify, { Auth, API, Storage } from "aws-amplify";
import awsconfig from "./aws-exports";
import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import { getObject, listObjects } from "./graphql/queries";
import {
	createObject as createObjectMutation,
	deleteObject as deleteObjectMutation,
	updateObject as updateObjectMutation,
} from "./graphql/mutations";
import "jquery/dist/jquery.min.js";
import "bootstrap/dist/js/bootstrap.min.js";
import { Button, Card, Col, Row, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "./Components/navbar.js";
import { HiDownload, HiPencil, HiTrash, HiUpload } from "react-icons/hi";
import { GiTreeBeehive } from "react-icons/gi";
import { CgBee } from "react-icons/cg";


Amplify.configure(awsconfig);

Storage.configure({ level: "private" });
const initialFormState = { description: "" };
const emailState = { email: "" };
const updateInfo = { id: "", description: "" };


var getExtension = function (url) {
	var arr = url.split("/");
	var fileArr = arr[5].split(".");
	var fileName = fileArr[0].replace("%20", " ");
	var fileExt = fileArr[1].substring(0, fileArr[1].indexOf("?"));
	var fullFileName = fileName + "." + fileExt;
	console.log(fullFileName);
	return [fullFileName, fileExt];
};

function App() {
	const [objects, setObjects] = useState([]);
	const [formData, setFormData] = useState(initialFormState);
	const [fileName, setFileName] = useState("");
	const [_file, set_File] = useState(null);
	const [userEmail, setUserEmail] = useState("");
	const [downloadlink, setdownloadlink] = useState("");
	const [updatedInfo, setUpdatedInfo] = useState(updateInfo);
	async function getEmail() {
		console.log("Getting email...");
		Auth.currentUserInfo()
			.then((res) => {
				setUserEmail(res.attributes.email);

				console.log("Email is: " + res.attributes.email + "!");
			})
			.catch((err) => {
				console.error(err);
			});
	}

	useEffect(() => {
		fetchObjects();
		getEmail();
	}, []);

	async function onChange(e) {
		if (!e.target.files[0]) return;
		var file = e.target.files[0];
		console.log("Calling from onChange(): file.name='" + file.name + "'");
		setFormData({ ...formData, email: userEmail, filename: file.name });
		setFileName(file.name);
		set_File(file);
	}

	async function fetchObjects() {
		console.log("Fetching...");
		const apiData = await API.graphql({ query: listObjects });
		const objectsFromAPI = apiData.data.listObjects.items;
		setObjects(objectsFromAPI);
	}

	async function createObjects() {
		const valid = validate(formData.description, _file);
		if (valid == true) {
			await API.graphql({
				query: createObjectMutation,
				variables: { input: formData },
			});
			if (formData.filename) {
				console.log("Calling from creatObjects(), Putting into storage...");
				console.log(
					"in createObjects() filename = " + fileName + " _file = " + _file
				);
				await Storage.put(fileName, _file, { level: "private" });

				console.log("Put successfully!");
				window.alert("File Successfully Uploaded");
			}
		}
		fetchObjects();
		document.getElementById("file_description").value = "";
	}

	function validate(description, file) {
		if (!description) {
			window.alert(" Write description");
			return false;
		}
		if (file.size / 1024 / 1024 > 10) {
			window.alert(
				"File size is too big, please upload the file size less than 10 MB "
			);
			return false;
		}
		return true;
	}

	async function deleteObject(id, nameoffile) {
		console.log("Calling from deleteObject(): ID: " + id + " " + nameoffile);
		const newObjectsArray = objects.filter((note) => note.id !== id);
		setObjects(newObjectsArray);
		console.log("printing new obj Array", newObjectsArray);
		await Storage.remove(nameoffile)
			.then(
				(result) => console.log(result),
				window.alert("File Successfully deleted")
			)
			.catch((err) => console.log(err));
		await API.graphql({
			query: deleteObjectMutation,
			variables: { input: { id } },
		});
	}

	async function getLink(scooby, scoobyid) {
		try {
			console.log(
				"file name for link " + scooby + "type of operator  " + typeof scooby
			);
			const URL = await Storage.get(scooby);
			console.log("url  " + URL);
			setdownloadlink(URL);
			document.getElementById('link_'.concat(scoobyid)).innerHTML = 'Download!';
			document.getElementById('link_'.concat(scoobyid)).setAttribute('href', URL);
		} catch (err) {
			console.log(err);
		}
	}

	function showLink(filename, id) {
		var mylink = getLink(filename);
		document.getElementById(id).innerHTML = mylink;
	}

	async function update() {
		try {
			console.log("updated info:" + updatedInfo);
			const updated = await API.graphql({
				query: updateObjectMutation,
				variables: { input: updatedInfo },
			});
			console.log("print updated  ", updated);
		} catch (error) { }
		fetchObjects();
	}

	return (
		<div className="bg">
			<nav>
				{" "}
				<NavBar className="App-header" />{" "}
			</nav>
			<div className="container">
				<center>
					<h1>
						{" "}
						
            Welcome Bee
            {" "}
					</h1>
	<p><CgBee /> {" "}{userEmail}</p>
					<p> {userEmail==="manjiri1994@outlook.com"? 'Admin':''}</p>
					

				</center>
			</div>
			<div className="container form-inline">
				<input
					id="fileupload"
					type="file"
					onChange={onChange}
					className="btn btn-warning"
				></input>

				<br/>

				<input
					onChange={(e) =>
						setFormData({ ...formData, description: e.target.value })
					}
					id="file_description"
					onfocus="this.value= ''"
					placeholder="File description"
					className="form-control form-control-lg"
					value={formData.description}
				/>
				<br/>

				<button
					className="btn btn-warning"
					onClick={() => {
						createObjects();
					}}
				>
					<HiUpload />
				</button>
			</div>
			<br></br>
			<div className="container">
				<div>
					{objects.map((file) => (
						<div>
							<div key={file.id || file.filename} className="container mycard">
								<i>
									<h2>Filename: {file.filename}</h2>
								</i>
								<p>Description: {file.description}</p>
								<p className="small">Uploaded by: {file.email}</p>

								<br />
								<input
									id={file.id}
									onChange={(e) =>
										setUpdatedInfo({
											...updatedInfo,
											description: e.target.value,
											id: file.id,
										})
									}
									placeholder="Update file description"
									type="text"
									className="form-control form-control-lg"
									id="clear"
								/>
								<div className="btn-toolbar">
									<button id="clear"	onClick="reset();" className="btn btn-warning" onClick={update}>
										<HiPencil />
									</button>
									<button
										className="btn btn-warning"
										onClick={() => {
											deleteObject(file.id, file.filename);}}>
										<HiTrash />
									</button>
									<button className="btn btn-warning" onClick={() => {getLink(file.filename, file.id)}}>
										<HiDownload color="black" />
										
									</button>
									<a id={'link_'.concat(file.id)} href={downloadlink}></a>
								</div>
										<p class="small">Time Created(PST) : {file.createdAt}</p>
								<p id="datebtn" class="small">
									Time Updated(PST) : {file.updatedAt}
								</p>
							</div>
							<br />
						</div>
					))}
				</div>

				<br/>
			</div>
		</div>
	);
}
export default withAuthenticator(App);



/*
					<if condition={{userEmail}==="manjiri1994@outlook.com"}>
						<then> <p>" Admin "</p></then>
						</if>
						<else>
						<p>{userEmail}</p>
						</else>
*/