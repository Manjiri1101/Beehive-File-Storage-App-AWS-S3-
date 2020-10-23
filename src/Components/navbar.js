import { Button, Navbar, Nav, NavDropdown, Jumbotron } from 'react-bootstrap';
import './navbar.css';
import 'bootstrap/dist/css/bootstrap.css'
import React, { Component } from 'react'
import { navBar } from 'aws-amplify';

import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';

function NavBar(props) {
    return (
        <Navbar collapseOnSelect='true' expand="lg" bg="dark" variant="dark" className="mr-auto">
            <Navbar.Brand href="#home">
                <div className='brand-name'>Beehive</div>
                <div className='brand-logo'></div>
            </Navbar.Brand>
            <Navbar.Brand > 
                < AmplifySignOut />
            </Navbar.Brand>
            
        </Navbar>
    )
}

export default NavBar;


