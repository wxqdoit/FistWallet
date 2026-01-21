import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { getSupportedNetworksForAccount } from '@core/networks';
import { Button } from '@/ui';
import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';
import { cn } from '@/utils';

export default function ChainSelect() {
    const navigate = useNavigate();
    const { currentAccount, currentNetwork, switchNetwork } = useWalletStore();

    if (!currentAccount) return null;

    const supportedNetworks = getSupportedNetworksForAccount(currentAccount);

    const handleSelect = (networkId: string) => {
        switchNetwork(networkId);
        navigate(-1);
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4  flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className=" px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    Select Chain
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {supportedNetworks.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        No supported chains found.
                    </div>
                ) : (
                    supportedNetworks.map((network) => {
                        const isSelected = currentNetwork.id === network.id;

                        return (
                            <button
                                key={network.id}
                                type="button"
                                onClick={() => handleSelect(network.id)}
                                className={cn(
                                    'w-full text-left rounded-xl border border-border/60 bg-card transition-colors',
                                    isSelected
                                        ? 'border-primary/60 bg-primary/5'
                                        : 'hover:border-border'
                                )}
                            >
                                <div className="flex items-center gap-3 p-4">
                                    <div
                                        className={cn(
                                            'h-10 w-10 rounded-full bg-secondary flex items-center justify-center',
                                            isSelected && 'ring-2 ring-primary/50'
                                        )}
                                    >
                                        <NetworkIcon
                                            chainType={network.chainType}
                                            iconKey={network.icon}
                                            className="text-foreground"
                                            size={20}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{network.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {network.nativeCurrency.symbol}
                                        </p>
                                    </div>
                                    {isSelected && <CheckIcon size={18} className="text-primary" />}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
