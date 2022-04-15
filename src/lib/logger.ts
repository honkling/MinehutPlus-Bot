export default class Logger {
	public static info(message: string, ...args: Object[]): void {
		console.log(this.parse(message, ...args));
	}

	public static warn(message: string, ...args: Object[]): void {
		console.warn(this.parse("%FgRed%" + message, ...args));
	}

	public static severe(message: string, ...args: Object[]): void {
		console.error(this.parse("%BgRed%" + message, ...args));
	}

	private static parse(message: string, ...args: Object[]): string {
		for (const index in args) {
			const arg = args[index];
			message = message.replace(new RegExp(`\\{${index}}`, "g"), arg.toString());
		}

		const expressions = Array.from(message.matchAll(/%(?!%)([^%]+)%(?!%)/g));
		for (const expression of expressions) {
			const formatting = expression[1].toUpperCase();
			if (!formattings[formatting]) continue;
			message = message.replace(expression[0], formattings[formatting]);
		}

		return message + "\x1b[0m";
	}
}

const formattings: {
	[key: string]: string,
} = {
	RESET: "\x1b[0m",
	BRIGHT: "\x1b[1m",
	DIM: "\x1b[2m",
	UNDERSCORE: "\x1b[4m",
	BLINK: "\x1b[5m",
	REVERSE: "\x1b[7m",
	HIDDEN: "\x1b[8m",
	FGBLACK: "\x1b[30m",
	FGRED: "\x1b[31m",
	FGGREEN: "\x1b[32m",
	FGYELLOW: "\x1b[33m",
	FGBLUE: "\x1b[34m",
	FGMAGENTA: "\x1b[35m",
	FGCYAN: "\x1b[36m",
	FGWHITE: "\x1b[37m",
	BGBLACK: "\x1b[40m",
	BGRED: "\x1b[41m",
	BGGREEN: "\x1b[42m",
	BGYELLOW: "\x1b[43m",
	BGBLUE: "\x1b[44m",
	BGMAGENTA: "\x1b[45m",
	BGCYAN: "\x1b[46m",
	BGWHITE: "\x1b[47m",
}