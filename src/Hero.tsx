import { AppContainer } from 'react-hot-loader';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

export interface Position { x: number, y: number }
export interface Stats { health: number, maxHealth: number }
export interface Inventory { potions: number }

export interface HeroState {
    xp: number,
    level: number,
    position: Position,
    stats: Stats,
    inventory: Inventory
}

export const initialState: HeroState = {
    xp: 0,
    level: 1,
    position: { x: 0, y: 0 },
    stats: { health: 50, maxHealth: 50 },
    inventory: { potions: 1 }
};

export enum ActionTypeKeys {
    GAIN_XP = 'GAIN_XP',
    LEVEL_UP = 'LEVEL_UP',
    MOVE = 'MOVE',
    DRINK_POTION = 'DRINK_POTION',
    TAKE_DAMAGE = 'TAKE_DAMAGE',
}

export interface GainXPAction { type: ActionTypeKeys.GAIN_XP, by: number }
export interface LevelUpAction { type: ActionTypeKeys.LEVEL_UP }
export interface MoveAction { type: ActionTypeKeys.MOVE, by: Position }
export interface DrinkPotionAction { type: ActionTypeKeys.DRINK_POTION }
export interface TakeDamageAction { type: ActionTypeKeys.TAKE_DAMAGE, by: number }


export type ActionTypes =
    | GainXPAction
    | LevelUpAction
    | MoveAction
    | DrinkPotionAction
    | TakeDamageAction


export const levelReducer = (state = initialState.level, action: ActionTypes) => {
    switch (action.type) {
        case ActionTypeKeys.LEVEL_UP:
            return state + 1;
        default: return state;
    }
}

export const positionReducer = (state = initialState.position, action: ActionTypes) => {
    switch (action.type) {
        case ActionTypeKeys.MOVE:
            let { x, y } = action.by;
            x += state.x;
            y += state.y;
            return { x, y };
        default: return state;
    }
}

const reducer = combineReducers({
    level: levelReducer,
    position: positionReducer
});

export const store = createStore(reducer);
