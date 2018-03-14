import { AppContainer } from 'react-hot-loader';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

export interface HeroState {
    level: number
}

export enum ActionTypeKeys {
    LEVEL_UP = "LEVEL_UP",
}

export interface LevelUpAction {
    type: ActionTypeKeys.LEVEL_UP
}


export type ActionTypes =
    | LevelUpAction


export function levelReducer(state: HeroState, action: ActionTypes) {
    switch (action.type) {
        case ActionTypeKeys.LEVEL_UP:
            return { level: state.level + 1 };
        default: return state;
    }
} 
