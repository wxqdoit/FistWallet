import { type ReactNode, type RefObject } from 'react';
import useStore from '../../state/store';
import { Dialog, DialogContent } from '../ui/dialog';

interface ModalProps {
	isOpen: boolean;
	minHeight?: number | false;
	maxHeight?: number;
	initialFocusRef?: RefObject<any>;
	children?: ReactNode;
	closeAble?: boolean;
}

export default function Modal({ isOpen, children, closeAble = true, maxHeight, minHeight, initialFocusRef }: ModalProps) {
	const useCloseModal = useStore((state: any) => state.closeModal);
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open: boolean) => {
				if (!open && closeAble) {
					useCloseModal();
				}
			}}
		>
			<DialogContent
				aria-label="dialog"
				style={{
					maxHeight: typeof maxHeight === 'number' ? `${maxHeight}vh` : undefined,
					minHeight: typeof minHeight === 'number' ? `${minHeight}vh` : undefined
				}}
				className="overflow-hidden p-0"
				onOpenAutoFocus={(event: any) => {
					if (!initialFocusRef?.current) return;
					event.preventDefault();
					initialFocusRef.current.focus();
				}}
				onPointerDownOutside={(event: any) => {
					if (!closeAble) {
						event.preventDefault();
					}
				}}
				onEscapeKeyDown={(event: any) => {
					if (!closeAble) {
						event.preventDefault();
					}
				}}
			>
				{children}
			</DialogContent>
		</Dialog>
	);
}
