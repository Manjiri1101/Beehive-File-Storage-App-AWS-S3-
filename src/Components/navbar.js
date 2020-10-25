import { Button, Navbar, Nav, NavDropdown, Jumbotron } from 'react-bootstrap';
import './navbar.css';
import 'bootstrap/dist/css/bootstrap.css'
import React, { Component } from 'react'
import { navBar } from 'aws-amplify';
import {GiTreeBeehive} from "react-icons/gi";
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';

function NavBar(props) {
    return (
        <Navbar collapseOnSelect='true' expand="lg" bg="dark" variant="dark" className="mr-auto ">
            <Navbar.Brand href="#home">
                <div className='brand-name ' ><i>Beehive</i> <GiTreeBeehive/></div>
                
            </Navbar.Brand>
            <Navbar.Brand > 
                < AmplifySignOut className="float-right"/>
            </Navbar.Brand>
            
        </Navbar>
    )
}

export default NavBar;


