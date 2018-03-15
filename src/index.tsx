import { AppContainer } from 'react-hot-loader';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { App } from './App';
import { store } from './Hero';


const root = document.getElementById('root');
const render = (Component: typeof App) =>
    ReactDOM.render(
        <Provider store={store}>
            <AppContainer>
                <Component />
            </AppContainer>
        </Provider>,
        root
    );

render(App);

if ((module as any).hot) (module as any).hot.accept('./App', () => render(App));


store.subscribe(() => {
    console.log(store.getState());
});

store.dispatch({ type: 'LEVEL_UP' });
store.dispatch({ type: 'MOVE', by: { x: 10, y: 12 } });
store.dispatch({ type: 'MOVE', by: { x: 20, y: 1 } });
store.dispatch({ type: 'LEVEL_UP' });
