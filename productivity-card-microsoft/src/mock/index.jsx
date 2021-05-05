/* eslint-disable react/no-children-prop */
import React from "react";
import ReactDOM from "react-dom";
import Cards from '../cards';
const extensionJSON = require('./build/extension.json');
const user = require('./user.json');
import { MockApp } from 'experience-extension';
import Page from '../page';

const App = () => (
    <MockApp Cards={Cards} Page={Page} extension={extensionJSON} user={user} />
)

ReactDOM.render(<App />, document.getElementById('root'));