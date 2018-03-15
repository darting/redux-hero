import { AppContainer } from 'react-hot-loader';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { App } from './App';
import { store, move, takeDamage, drinkPotion, gainXp, levelUp } from './Hero';


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

store.dispatch(move(1, 0));
store.dispatch(move(1, 1));
store.dispatch(takeDamage(13));
store.dispatch(drinkPotion());
store.dispatch(gainXp(100));
store.dispatch(levelUp());

