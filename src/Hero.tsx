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

export interface GainXPAction { type: ActionTypeKeys.GAIN_XP, payload: number }
export interface LevelUpAction { type: ActionTypeKeys.LEVEL_UP }
export interface MoveAction { type: ActionTypeKeys.MOVE, payload: Position }
export interface DrinkPotionAction { type: ActionTypeKeys.DRINK_POTION }
export interface TakeDamageAction { type: ActionTypeKeys.TAKE_DAMAGE, payload: number }


export type Actions =
    | GainXPAction
    | LevelUpAction
    | MoveAction
    | DrinkPotionAction
    | TakeDamageAction


const xpReducer = (state = initialState.xp, action: Actions) => {
    switch (action.type) {
        case ActionTypeKeys.GAIN_XP:
            return state + action.payload;
        default: return state;
    }
}

const levelReducer = (state = initialState.level, action: Actions) => {
    switch (action.type) {
        case ActionTypeKeys.LEVEL_UP:
            return state + 1;
        default: return state;
    }
}

const positionReducer = (state = initialState.position, action: Actions) => {
    switch (action.type) {
        case ActionTypeKeys.MOVE:
            let { x, y } = action.payload;
            x += state.x;
            y += state.y;
            return { x, y };
        default: return state;
    }
}

const statsReducer = (state = initialState.stats, action: Actions) => {
    let { health, maxHealth } = state;
    switch (action.type) {
        case ActionTypeKeys.DRINK_POTION:
            health = Math.min(health + 20, maxHealth);
            return { ...state, health, maxHealth };
        case ActionTypeKeys.TAKE_DAMAGE:
            health = Math.max(0, health - action.payload);
            return { ...state, health };
        default: return state;
    }
}

const inventoryReducer = (state = initialState.inventory, action: Actions) => {
    let { potions } = state;
    switch (action.type) {
        case ActionTypeKeys.DRINK_POTION:
            potions = Math.max(0, potions - 1);
            return { ...state, potions };
        default: return state;
    }
}

const reducer = combineReducers({
    xp: xpReducer,
    level: levelReducer,
    position: positionReducer,
    stats: statsReducer,
    inventory: inventoryReducer,
});

export const store = createStore(reducer, initialState);
