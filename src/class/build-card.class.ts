import * as core from '@actions/core';
import *  as github from '@actions/github';
const yaml = require('yaml');
const axios = require('axios');

import { RegexReplacer } from '../interface/RegexReplacer.interface';

export class BuildCard {
    private card: any;
    private preThemeColor: any;
    private regexReplacer: RegexReplacer[];
    private avatarUrl: string = '';

    constructor() {
        const githubContext: any = github.context;
        const githubActor: string = github.context.actor;
        this.getAvatarUrl(githubActor);

        this.card = {};
        this.card["@type"] = "MessageCard";
        this.card["@context"] = "https://schema.org/extensions";

        yaml.defaultOptions = {
            indent: +core.getInput('yaml-ident')
        }

        this.preThemeColor = {
            Success: '28a745',
            Warning: 'ffc107',
            Error: 'dc3545',
            Info: '2554fc'
        }

        this.regexReplacer = [
            { target: 'actor', replace: githubActor },
            { target: 'avatar_url', replace: this.avatarUrl }
        ]
    }

    setTitle(title: string): void {
        this.card["title"] = this.replaceTemplates(title);
    }

    setSummary(summary: string): void {
        this.card["summary"] = this.replaceTemplates(summary);
    }

    setText(text: string): void {
        this.card["text"] = this.replaceTemplates(text);
    }

    setThemeColor(themeColor: string): void {
        const useThemeColor = this.preThemeColor[themeColor] || themeColor;
        this.card["themeColor"] = useThemeColor;
    }

    setSections(sections: string): void {
        if (sections !== '') {
            const sectionsObject: any = yaml.parse(this.replaceTemplates(sections));

            this.card["sections"] = sectionsObject;
        }
    }

    setPotentialAction(potentialAction: string): void {
        if (potentialAction !== '') {
            const potentialActionObject: any = yaml.parse(potentialAction);
    
            this.card["potentialAction"] = potentialActionObject;
        }
    }

    toObject(): any {
        return this.card;
    }

    private replaceTemplates(str: string): string {
        this.regexReplacer.map(el => {
            str = str.replace(new RegExp(`{github:${el.target}}`, 'g'), el.replace);
        });

        return str;
    }

    private getAvatarUrl(user: string): void {
        core.info(`Get ${user} avatar url`);
        axios.get(`https://api.github.com/users/${user}`)
        .then((res: any) => {
            core.info(res.data.avatar_url);
            this.avatarUrl = res.data.avatar_url;
        }).catch((err: any) => {
            core.error(err);
            this.avatarUrl = 'avatar_url_error';
        });
    }
}