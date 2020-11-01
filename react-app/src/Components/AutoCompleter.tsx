/*
 * @Author: Kanata You 
 * @Date: 2020-10-28 20:08:55 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-10-28 20:55:58
 */

import React, { Component } from "react";
import $ from "jquery";
import { CommandDict } from "../Handlers/CommandParser";


export interface AutoCompleterProps {};

export interface AutoCompleterState {
    active: boolean;
    x: number;
    y: number;
    list: Array<string>;
    currentParam: null | number | string;
    focusIdx: number;
};

export class AutoCompleter extends Component<AutoCompleterProps, AutoCompleterState> {

    protected static currentRef: AutoCompleter | null = null;

    public static getRef() {
        return AutoCompleter.currentRef;
    }

    public static show(value: string, x?: number, y?: number): void {
        if (AutoCompleter.currentRef) {
            if (value.includes(" ")) {
                const name: string = value.split(" ")[0];
                if (CommandDict[name]) {
                    let paramIdx: number = 0;
                    let argName: string | null = null;
                    let argWaitingForValue: boolean = false;
                    
                    value.split(/ {1,}/).slice(1).forEach(b => {
                        const argSet = CommandDict[name].args.filter(
                            a => a.name === b
                        );
                        if (argSet.length) {
                            argName = b;
                            argWaitingForValue = argSet[0].requireValue;
                        } else {
                            if (argWaitingForValue) {
                                argWaitingForValue = false;
                            } else {
                                paramIdx += 1;
                                argName = null;
                            }
                        }
                    });

                    AutoCompleter.currentRef.setState({
                        list: [name],
                        currentParam: argName ?? paramIdx,
                        active: true,
                        x: x || AutoCompleter.currentRef.state.x,
                        y: y || AutoCompleter.currentRef.state.y
                    });
                } else {
                    AutoCompleter.currentRef.setState({
                        list: [],
                        currentParam: null,
                        active: false
                    });
                }
            } else {
                const pattern = new RegExp(value.split("").join(".*"));

                AutoCompleter.currentRef.setState({
                    list: Object.keys(CommandDict).filter(
                        keyname => pattern.test(keyname)
                    ),
                    currentParam: null,
                    active: true,
                    x: x || AutoCompleter.currentRef.state.x,
                    y: y || AutoCompleter.currentRef.state.y
                });
            }
        }
    }

    public static hide(): void {
        if (AutoCompleter.currentRef) {
            AutoCompleter.currentRef.setState({
                active: false
            });
        }
    }

    public constructor(props: AutoCompleterProps) {
        super(props);
        this.state = {
            active: false,
            x: 200,
            y: 200,
            list: [],
            currentParam: null,
            focusIdx: 0
        };
    }

    public render(): JSX.Element {
        const currentCmd = CommandDict[this.state.list[this.state.focusIdx]];

        let currentDescr: string = "";

        if (currentCmd && this.state.currentParam !== null) {
            if (typeof this.state.currentParam === "string") {
                currentDescr = currentCmd.args.filter(
                    d => d.name === this.state.currentParam
                )[0].description;
            } else if (currentCmd.params.length > this.state.currentParam - 1) {
                currentDescr = currentCmd.params[this.state.currentParam - 1].description;
            }
        }

        return (
            <div style={{
                zIndex: 10000,
                position: "fixed",
                left: this.state.x,
                bottom: $(window).innerHeight()! - this.state.y,
                pointerEvents: "none",
                display: this.state.active && this.state.list.length ? "flex" : "none",
                flexDirection: "column"
            }} >
                {
                    currentCmd ? (
                        <div key="detail" style={{
                            color: "rgb(64,172,225)",
                            border: `1px solid rgb(91,95,97)`,
                            borderBottom: "none",
                            padding: "0.3em 0.7em",
                            width: "32.6em",
                            background: `rgb(26,29,33)`
                        }} >
                            <label>
                                <span key="name" >
                                    { this.state.list[this.state.focusIdx] + " " }
                                </span>
                                {
                                    currentCmd.params.map(
                                        (d, i) => (
                                            i + 1 === this.state.currentParam ? (
                                                <span key={ `param_${ i }` } >
                                                    <b>
                                                        { " " }
                                                        <u>
                                                            { `[${ d.name }]` }
                                                        </u>
                                                    </b>
                                                </span>
                                            ) : (
                                                <span key={ `param_${ i }` } >
                                                    { ` [${ d.name }]` }
                                                </span>
                                            )
                                        )
                                    )
                                }
                                {
                                    currentCmd.args.map(
                                        (d, i) => (
                                            d.name === this.state.currentParam ? (
                                                <span key={ `arg_${ d.name }` } >
                                                    <b>
                                                        { i ? "|" : " " }
                                                        <u>
                                                        {
                                                            `${ d.name }${
                                                                d.requireValue ? "()" : ""
                                                            }`
                                                        }
                                                        </u>
                                                    </b>
                                                </span>
                                            ) : (
                                                <span key={ `arg_${ d.name }` } >
                                                    {
                                                        `${
                                                            i ? "|" : " "
                                                        }${ d.name }${
                                                            d.requireValue ? "()" : ""
                                                        }` }
                                                </span>
                                            )
                                        )
                                    )
                                }
                            </label>
                            {
                                this.state.currentParam === null ? null : (
                                    <div key="cmd-descri" >
                                        <small>
                                            <i>
                                                { currentCmd.description }
                                            </i>
                                        </small>
                                    </div>
                                )
                            }
                            {
                                currentDescr ? (
                                    <>
                                        <div key="paramDescr" style={{
                                            borderTop: "1px solid rgba(64, 172, 225, 0.5)",
                                            marginTop: "0.5em",
                                            padding: "0.2em 0 0.1em"
                                        }} >
                                            <small>
                                                { currentDescr }
                                            </small>
                                        </div>
                                    </>
                                ) : null
                            }
                        </div>
                    ) : (
                        <div key="unknow" style={{
                            color: "rgb(64,172,225)",
                            border: `1px solid rgb(91,95,97)`,
                            borderBottom: "none",
                            padding: "0.3em 0.7em",
                            background: `rgb(26,29,33)`,
                            width: "32em"
                        }} >
                            <label>
                                Unknown command
                            </label>
                        </div>
                    )
                }
                {
                    this.state.currentParam === null ? (
                        <div key="list" style={{
                            display: "flex",
                            flexDirection: "column",
                            color: "rgb(64,172,225)",
                            fontWeight: "bold",
                            border: `1px solid rgb(91,95,97)`,
                            background: `rgb(26,29,33)`
                        }} >
                        {
                            this.state.list.map((item, i) => {
                                return (
                                    <div key={ i }
                                    style={{
                                        display: "flex"
                                    }} >
                                        <label key="name" style={{
                                            display: "inline-block",
                                            padding: "0.3em 1em",
                                            width: "6em",
                                            background: i === this.state.focusIdx ? (
                                                "rgb(52,57,64)"
                                            ) : ""
                                        }} >
                                            { item }
                                        </label>
                                        <label key="descri" style={{
                                            display: "inline-block",
                                            padding: "0.3em 1em",
                                            width: "24em",
                                            background: i === this.state.focusIdx ? (
                                                "rgb(52,57,64)"
                                            ) : "",
                                            fontWeight: "normal"
                                        }} >
                                            { CommandDict[item].description }
                                        </label>
                                    </div>
                                );
                            })
                        }
                        </div>
                    ) : null
                }
            </div>
        );
    }

    public componentDidMount(): void {
        AutoCompleter.currentRef = this;
    }

};