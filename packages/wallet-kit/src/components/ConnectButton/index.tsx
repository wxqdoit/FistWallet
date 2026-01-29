import useStore from '../../state/store';
import {AppModal} from "../../types/configType";

export function ConnectButton() {
	const useToggleModal = useStore((state: any) => state.toggleModal);

	return (
		<button
			type="button"
			className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
			onClick={() => {
				useToggleModal(AppModal.ConnectModal);
			}}
		>
			链接钱包
		</button>
	);
}
