import { AppContainer } from 'react-hot-loader';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { createAction, handleActions, combineActions } from 'redux-actions';


export interface Position { x: number, y: number }
export interface Stats { health: number, maxHealth: number }
export interface Inventory { potions: number }

export interface State {
    hero: {
        xp: number,
        level: number,
        position: Position,
        stats: Stats,
        inventory: Inventory
    },
    monster: any
}

export const initialState: State = {
    hero: {
        xp: 0,
        level: 1,
        position: { x: 0, y: 0 },
        stats: { health: 50, maxHealth: 50 },
        inventory: { potions: 1 }
    },
    monster: {},
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


/// actions
export const gainXp = createAction<number>(ActionTypeKeys.GAIN_XP);
export const levelUp = createAction(ActionTypeKeys.LEVEL_UP);
export const move = createAction<Position, number, number>(ActionTypeKeys.MOVE, (x: number, y: number) => ({ x, y }));
export const drinkPotion = createAction(ActionTypeKeys.DRINK_POTION);
export const takeDamage = createAction<number>(ActionTypeKeys.TAKE_DAMAGE);


/// reducers    
const heroReducer = (state = initialState.hero, action: Actions) => {
    const { stats, inventory } = state;
    switch (action.type) {
        case ActionTypeKeys.GAIN_XP:
            const xp = state.xp + action.payload;
            return { ...state, xp };
        case ActionTypeKeys.LEVEL_UP:
            const level = state.level + 1;
            return { ...state, level };
        case ActionTypeKeys.MOVE:
            let { position: { x, y } } = state;
            x += action.payload.x;
            y += action.payload.y;
            return { ...state, position: { x, y } };
        case ActionTypeKeys.DRINK_POTION:
            return {
                ...state,
                stats: statsReducer(stats, action),
                inventory: inventoryReducer(inventory, action)
            };
        case ActionTypeKeys.TAKE_DAMAGE:
            return {
                ...state,
                stats: statsReducer(stats, action)
            };
    }
    return state;
};

const statsReducer = (state = initialState.hero.stats, action: Actions) => {
    let { health, maxHealth } = state;
    switch (action.type) {
        case ActionTypeKeys.DRINK_POTION:
            health = Math.min(health + 20, maxHealth);
            return { ...state, health };
        case ActionTypeKeys.TAKE_DAMAGE:
            health = Math.max(0, health - action.payload);
            return { ...state, health };
        default: return state;
    }
};

const inventoryReducer = (state = initialState.hero.inventory, action: Actions) => {
    let { potions } = state;
    switch (action.type) {
        case ActionTypeKeys.DRINK_POTION:
            potions = Math.max(0, potions - 1);
            return { ...state, potions };
        default: return state;
    }
};

const monsterReducer = (state = initialState.monster, action: Actions) => {
    return state;
};

const reducer = combineReducers({
    hero: heroReducer,
    monster: monsterReducer,
});

export const store = createStore(reducer, initialState);
