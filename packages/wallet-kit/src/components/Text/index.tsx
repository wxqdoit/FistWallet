import React from 'react';

interface TextOrg {
	text?: string | number | any;
	size?: number;
	weight?: number;
	color?: string;
	padding?: string;
	margin?: string;
	ellipsis?: boolean;
	className?: string;
	children?: React.ReactNode;
	prefix?: string;
	suffix?: string;
	counting?: boolean;
	href?: string;
}

export const Text: React.FC<TextOrg> = ({
	prefix,
	suffix,
	className = '',
	text,
	size,
	weight,
	color,
	padding = '',
	margin = ''
}) => {
	return (
		<div
			className={`text-[#171717] ${className}`}
			style={{
				fontSize: size ? size + 'px' : '16px',
				fontWeight: weight || 400,
				color,
				padding,
				margin,
				whiteSpace: 'pre-wrap',
				alignItems: 'center',
				height: 'inherit',
				left: 'inherit',
			}}
		>
			{prefix ? <span>{prefix}</span> : <></>}
			<span dangerouslySetInnerHTML={{ __html: text }} />
			{suffix ? <span>{suffix}</span> : <></>}
		</div>
	);
};

export default Text;
