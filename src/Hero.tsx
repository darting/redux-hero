import { AppContainer } from 'react-hot-loader';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { createAction, handleActions, combineActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { call, put, takeEvery, takeLatest, race, take, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';


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

const levels = [
    { xp: 0, maxHealth: 50 },
    { xp: 100, maxHealth: 55 },
    { xp: 250, maxHealth: 60 },
    { xp: 500, maxHealth: 67 },
    { xp: 1000, maxHealth: 75 },
];

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

/// selectors    
const getXp = (state : State) => state.hero.xp;
const getHealth = (state : State) => state.hero.stats.health;
const getLevel = createSelector(getXp, xp => levels.filter(level => xp >= level.xp).length);
const getMaxHealth = createSelector(getLevel, level => levels[level].maxHealth);
const isHealthLow = createSelector([ getHealth, getMaxHealth ], (health, maxHealth) => health < maxHealth * 0.15);

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


export async function gameSaga() {
    let playerAlive = true;
    while (playerAlive) {
        await take(ActionTypeKeys.MOVE);

        const location = await select(getLocation);
        if (location.safe) continue;

        const monsterProbability = await call(Math.random);
        if (monsterProbability < location.encounterThreshold) continue;

        playerAlive = await call(fightSaga);
    }
}

export async function fightSaga() {
    const monster = await select(getMonster);

    while (true) {
        await call(monsterAttackSaga, monster);

        const playerHealth = await select(getHealth);
        if (playerHealth <= 0) return false;

        await call(playerFightOptionsSaga);

        const mosnterHealth = await select(getMonsterHealth);
        if (mosnterHealth <= 0) return true;
    }
}

export async function monsterAttackSaga(monster) {
    await call(delay, 1000);

    let damage = monster.strength;
    const critProbability = await call(Math.random);
    if (critProbability >= monster.critThreshold) damage *= 2;

    await put(animateMonsterAttack(damage));
    await call(delay, 1000);

    await put(takeDamage(damage));
}

export async function playerFightOptionsSaga() {
    const { attack, heal, escape } = await race({
        attack: take(ActionTypeKeys.ATTACK),
        heal, take(ActionTypeKeys.DRINK_POTION),
        escape: take(ActionTypeKeys.RUN_AWAY),
    });

    if (attack) await call(playerAttackSaga);
    if (heal) await call(playerHealSaga);
    if (escape) await call(playerEscapeSaga);
}

export async function metaSaga() {
    while (true) {
        await race({
            play: call(gameSaga),
            load: take(ActionTypeKeys.LOAD_GAME),
        })
    }
}

/// redux-saga
/// take : to wait for an action
/// select : to access state
/// call : to call a function or another saga
/// delay : to delay execution
/// put : to dispatch an antion
/// race : to wait for the first completion from a set of effects
