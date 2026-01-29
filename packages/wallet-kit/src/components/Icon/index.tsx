import React from 'react';

interface IconImageArg {
	src: any;
	width?: number | string;
	height?: number | string;
	borderRadius?: string;
	isRadius?: boolean;
	className?: string;
}

interface FoldIconImageArg {
	src: Array<string>;
	width?: number | string;
	height?: number | string;
	offset?: number;
	proportion?: number;
	className?: string;
	isRadius?: boolean;
}

export const Icon: React.FC<IconImageArg> = ({ src, width, height, isRadius = true, className }) => {
	return (
		<img
			className={className}
			src={src}
			width={width ? width + 'px' : '24px'}
			height={height ? height + 'px' : '24px'}
			style={{ borderRadius: isRadius ? '50%' : '0', display: 'block', transition: 'all 0.2s' }}
		/>
	);
};

export const Image: React.FC<IconImageArg> = ({ src, width, height, isRadius = true, className, borderRadius }) => {
	return (
		<img
			className={className}
			src={src}
			width={width ? width : 'auto'}
			height={height ? height : 'auto'}
			style={{ borderRadius: borderRadius ? borderRadius : isRadius ? '50%' : '0', display: 'block', transition: 'all 0.2s' }}
		/>
	);
};

export const FoldIconBox: React.FC<FoldIconImageArg> = ({ src, width, height, offset = 0, isRadius = true }) => {
	return (
		<div className="relative flex cursor-pointer">
			{src.map((item, index) => {
				return (
					<div
						key={index}
						style={{
							zIndex: index + 1,
							marginLeft: index == 0 ? '0px' : offset + 'px',
							width: width ? width + 'px' : '24px',
							height: height ? height + 'px' : '24px'
						}}
					>
						<img
							src={item}
							width={width ? width : 24}
							height={height ? height : 24}
							style={{ borderRadius: isRadius ? '50%' : '0', display: 'block', transition: 'all 0.2s' }}
						/>
					</div>
				);
			})}
		</div>
	);
};
export const FoldIconBoxBig: React.FC<FoldIconImageArg> = ({ src, width, height, offset = 0, proportion = 1 }) => {
	return (
		<div className="relative flex cursor-pointer">
			{src.map((item, index) => {
				return (
					<div
						key={index}
						style={{
							zIndex: index + 1,
							marginLeft: index == 0 ? '0px' : offset + 'px',
							marginTop: index == 0 ? '0px' : -(offset / 2) + 'px',
							width: width ? width + 'px' : '24px',
							height: height ? height + 'px' : '24px'
						}}
					>
						{index === src.length - 1 ? (
							<img
								src={item}
								width={width ? Number(width) * proportion : 24 * proportion}
								height={height ? Number(height) * proportion : 24 * proportion}
								style={{ display: 'block', transition: 'all 0.2s' }}
							/>
						) : (
							<img
								src={item}
								width={width ? width : 24}
								height={height ? height : 24}
								style={{ display: 'block', transition: 'all 0.2s' }}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default Icon;
