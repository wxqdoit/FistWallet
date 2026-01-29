import useStore from '../../state/store';

interface ModalHeaderProps {
	text?: string | any;
	closeAble?: boolean;
}

export default function ModalHeader({ text = '', closeAble = true }: ModalHeaderProps) {
	const useCloseModal = useStore((state: any) => state.closeModal);

	return (
		<div className="flex h-8 items-center justify-between">
			<div className="h-8 text-[18px] font-semibold leading-8 text-slate-800">{text}</div>
			{closeAble ? (
				<button
					type="button"
					aria-label="Close"
					className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-transform duration-200 hover:rotate-180 hover:bg-slate-200"
					onClick={useCloseModal}
				>
					×
				</button>
			) : (
				<></>
			)}
		</div>
	);
}
