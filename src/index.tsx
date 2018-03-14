import { AppContainer } from 'react-hot-loader';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { App } from './App';

const root = document.getElementById('root');
const render = (Component: typeof App) =>
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        root
    );

render(App);    

if ((module as any).hot) (module as any).hot.accept('./App', () => render(App));
