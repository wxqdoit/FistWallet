declare module '*.svg' {
	const dataUrl: string;
	export default dataUrl;
}

declare module '*.png' {
	const dataUrl: string;
	export default dataUrl;
}

declare module '*.css' {
	const css: string;
	export default css;
}

declare module 'content-hash' {
	declare function decode(x: string): string;
	declare function getCodec(x: string): string;
}
declare module '*.json' {
	const value: any;
	export default value;
}
