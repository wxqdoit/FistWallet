import { useState, useRef, useEffect } from 'react';
import useStore from '../../state/store';
import { AppModal } from '../../types/configType';
import { useAccount } from '../../hooks/useAccount';
import { useDisconnect } from '../../hooks/useDisconnect';
import { useConnectedProvider } from '../../hooks/useConnectedProvider';

export function ConnectButton({ className }: { className?: string }) {
	const toggleModal = useStore((state: any) => state.toggleModal);
	const targetChain = useStore((state: any) => state.chain);
	const account = useAccount();
	const { disConnect } = useDisconnect();
	const { connectedProvider: adapter } = useConnectedProvider();

	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);

	const isWrongNetwork =
		targetChain &&
		account?.chainId &&
		String(targetChain.id) !== String(account.chainId);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
				setIsPopoverOpen(false);
			}
		}
		if (isPopoverOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isPopoverOpen]);

	const handleCopy = () => {
		const rawAddr =
			typeof account?.address === 'string'
				? account.address
				: account?.address?.address || '';
		if (rawAddr) {
			navigator.clipboard.writeText(rawAddr);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleSwitchNetwork = async () => {
		if (adapter?.switchNetwork && targetChain) {
			try {
				await adapter.switchNetwork({
					chainId: Number(targetChain.id),
					chainType: account?.chainType,
				});
			} catch (e) {
				console.error('Failed to switch network', e);
			}
		}
	};

	if (!account) {
		return (
			<button
				type="button"
				className={
					className ||
					"rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
				}
				onClick={() => toggleModal(AppModal.ConnectModal)}
			>
				Connect Wallet
			</button>
		);
	}

	const displayAddress =
		typeof account.address === 'string'
			? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
			: account.address?.address
			? `${account.address.address.slice(0, 6)}...${account.address.address.slice(-4)}`
			: 'Connected';

	return (
		<div className="relative inline-block text-left" ref={popoverRef}>
			<div className="flex items-center gap-2">
				{isWrongNetwork ? (
					<button
						type="button"
						onClick={handleSwitchNetwork}
						className="rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-500 border border-amber-500/30 transition hover:bg-amber-500/30"
					>
						Wrong Network (Switch)
					</button>
				) : null}

				<button
					type="button"
					onClick={() => setIsPopoverOpen(!isPopoverOpen)}
					className="flex items-center gap-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 px-4 py-2 text-sm font-medium text-white shadow-sm transition"
				>
					<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
					<span>{displayAddress}</span>
				</button>
			</div>

			{isPopoverOpen && (
				<div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 shadow-2xl z-50 text-white animate-in fade-in zoom-in-95 duration-100">
					<div className="flex items-center justify-between pb-3 border-b border-zinc-800">
						<span className="text-xs font-medium text-zinc-400">Connected Account</span>
						<span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
							{account.chainType}
						</span>
					</div>

					<div className="my-3 py-2 px-3 bg-zinc-950/60 rounded-xl border border-zinc-800/50">
						<p className="text-xs font-mono text-zinc-300 break-all select-all">
							{typeof account.address === 'string' ? account.address : account.address?.address}
						</p>
					</div>

					<div className="space-y-1.5 pt-1">
						<button
							type="button"
							onClick={handleCopy}
							className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-medium bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition"
						>
							{copied ? '✓ Copied!' : 'Copy Address'}
						</button>

						<button
							type="button"
							onClick={() => {
								disConnect();
								setIsPopoverOpen(false);
							}}
							className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
						>
							Disconnect
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
