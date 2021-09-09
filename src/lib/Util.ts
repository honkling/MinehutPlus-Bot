// Functions

import { User } from "discord.js";

export function parseLength(length: string): ParsedTimespanInformation | boolean {
	const getSegments = /([0-9]{1,})(s|m|h|d|w|mo|y|de){1,}/g;
	if(!getSegments.test(length)) return false;
	const segments: string[] = length.match(getSegments) as string[];
	const parsedSegments = [];
	let ms = 0;
	for(const segment of segments) {
		const [amount, unit] = segment.match(/([0-9]{1,}|(s|m|h|d|w|mo|y|de))/g) as [string, ShortenedLabel];
		parsedSegments.push({
			amount: parseInt(amount),
			longUnit: TimeLabelTranslation[unit],
			shortUnit: unit,
		});
		ms += parseInt(amount) * (TimeUnitTranslation[TimeLabelTranslation[unit]] as number);
	}
	const { amount: lastParsedSegmentAmount, longUnit: lastParsedSegmentLongUnit } = parsedSegments[parsedSegments.length - 1];
	const lastParsedSegmentLength = `${lastParsedSegmentAmount} ${basicPluralify(lastParsedSegmentAmount, lastParsedSegmentLongUnit.toLowerCase())}`;
	return {
		ms,
		parsedLength: parsedSegments.length === 1 ? lastParsedSegmentLength : parsedSegments
			.map(({ amount, longUnit }) => `${amount} ${basicPluralify(amount, longUnit.toLowerCase())}`)
			.slice(0, parsedSegments.length - 1)
			.join(', ') +
			`${parsedSegments.length === 2 ? ' ' : ', '}and ${lastParsedSegmentAmount} ${basicPluralify(lastParsedSegmentAmount, lastParsedSegmentLongUnit.toLowerCase())}`,
		parsedSegments
	};
}

export function basicPluralify(amount: number, input: string): string {
	return amount === 1 ? input : input + 's';
}

export function properCase(input: string): string {
	return input[0].toUpperCase() + input.slice(1, input.length).toLowerCase();
}

// Constants

export interface ParsedTimespanInformation {
	ms: number,
	parsedLength: string,
	parsedSegments: {
		amount: number,
		longUnit: TimeLabelTranslation, shortUnit: ShortenedLabel,
	}[],
};

export enum EmbedColors {
	PRIMARY = 'BLUE',
}

export enum TimeUnitTranslation {
	SECOND = 1000,
	MINUTE = 1000 * 60,
	HOUR = 1000 * 3600,
	DAY = 1000 * 3600 * 24,
	WEEK = 1000 * 3600 * 24 * 7,
	MONTH = 1000 * 3600 * 24 * 7 * 4,
	YEAR = 1000 * 3600 * 24 * 7 * 4 * 10,
	DECADE = 1000 * 3600 * 24 * 7 * 4 * 10 * 10,
}

export enum TimeLabelTranslation {
	s = "SECOND",
	m = "MINUTE",
	h = "HOUR",
	d = "DAY",
	w = "WEEK",
	mo = "MONTH",
	y = "YEAR",
	de = "DECADE",
}

export type ShortenedLabel = 's' | 'm' | 'h' | 'd' | 'w' | 'mo' | 'y' | 'de';

export interface PunishmentOptions {
	member: User,
	moderator: User,
	reason: string,
	length?: ParsedTimespanInformation,
	type: ValidPunishmentTypes,
}

export enum PunishmentType {
	KICK = 1,
	BAN = 2,
}

export type ValidPunishmentTypes = "KICK" | "BAN";

export enum PastTensePunishmentType {
	KICK = "kicked",
	BAN = "banned",
}

export class PunishmentFailedError extends Error {
	constructor(input: string) {
		super(input);
	}
}