import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@store/wallet';
import { Button, Card, CardContent, Input, Label, ToggleGroup, ToggleGroupItem } from '@/ui';
import { ArrowLeftIcon, ArrowsDownUpIcon, CaretDownIcon, DiamondIcon } from '@phosphor-icons/react';
import { NetworkIcon } from '@/components/NetworkIcon';

export default function Swap() {
    const navigate = useNavigate();
    const { currentNetwork } = useWalletStore();
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5');

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
                    Swap
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
                {/* From */}
                <div>
                    <Label className="mb-2 block text-sm font-medium">From</Label>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <Button variant="secondary" className="h-9 gap-2">
                                    <NetworkIcon
                                        chainType={currentNetwork.chainType}
                                        iconKey={currentNetwork.icon}
                                        className="text-foreground"
                                        size={18}
                                    />
                                    <span className="font-medium">{currentNetwork.nativeCurrency.symbol}</span>
                                    <CaretDownIcon className="text-muted-foreground" size={14} />
                                </Button>
                                <p className="text-xs text-muted-foreground">Balance: 0</p>
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                    className="pr-16"
                                    placeholder="0.0"
                                    step="any"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFromAmount('0')}
                                    className="absolute right-2 top-1/2 h-7 -translate-y-1/2 px-2 text-primary hover:text-primary/80"
                                >
                                    MAX
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">≈ $0.00</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Swap direction button */}
                <div className="flex justify-center -my-2 relative z-10">
                    <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full border-2 border-border/60">
                        <ArrowsDownUpIcon size={18} />
                    </Button>
                </div>

                {/* To */}
                <div>
                    <Label className="mb-2 block text-sm font-medium">To</Label>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <Button variant="secondary" className="h-9 gap-2">
                                    <DiamondIcon size={18} />
                                    <span className="font-medium">Select token</span>
                                    <CaretDownIcon className="text-muted-foreground" size={14} />
                                </Button>
                                <p className="text-xs text-muted-foreground">Balance: 0</p>
                            </div>
                            <Input
                                type="number"
                                value={toAmount}
                                readOnly
                                className="bg-muted/40"
                                placeholder="0.0"
                            />
                            <p className="text-xs text-muted-foreground mt-2">≈ $0.00</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Slippage settings */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Slippage Tolerance</span>
                            <span className="text-sm text-primary">{slippage}%</span>
                        </div>
                        <div className="flex gap-2">
                            <ToggleGroup
                                type="single"
                                value={slippage}
                                onValueChange={(value) => value && setSlippage(value)}
                                className="flex flex-1 gap-2"
                            >
                                {['0.1', '0.5', '1.0'].map((value) => (
                                    <ToggleGroupItem key={value} value={value} className="flex-1">
                                        {value}%
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                            <Button variant="secondary" className="h-9 px-3 text-sm">
                                Custom
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quote info (placeholder) */}
                <Card className="bg-muted/40">
                    <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                        <p className="text-sm">Enter amount to see quote</p>
                    </CardContent>
                </Card>
            </div>

            {/* Swap button */}
            <div className="p-4 border-t border-border/60">
                <Button disabled={!fromAmount} className="w-full">
                    Select Token to Swap
                </Button>
            </div>
        </div>
    );
}
