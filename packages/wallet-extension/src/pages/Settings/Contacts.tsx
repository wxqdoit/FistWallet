import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "@store/settings";
import { Button, Card, CardContent, Input, Label } from "@/ui";
import { ArrowLeftIcon, PlusIcon, TrashIcon, UserIcon, CopyIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { t } from "@utils/i18n";
import { getStorage, setStorage } from "@/core/storage";

interface Contact {
    id: string;
    name: string;
    address: string;
    chain?: string;
}

const CONTACTS_KEY = "fistwallet_contacts";

export default function Contacts() {
    const navigate = useNavigate();
    const { language } = useSettingsStore();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        getStorage<Contact[]>(CONTACTS_KEY).then(res => {
            if (res) setContacts(res);
        });
    }, []);

    const handleSave = async () => {
        if (!name.trim() || !address.trim()) {
            toast.error("Please enter both contact name and address");
            return;
        }

        const newContact: Contact = {
            id: Date.now().toString(),
            name: name.trim(),
            address: address.trim(),
        };

        const updated = [...contacts, newContact];
        setContacts(updated);
        await setStorage(CONTACTS_KEY, updated);
        setName("");
        setAddress("");
        setIsAdding(false);
        toast.success("Contact saved successfully");
    };

    const handleDelete = async (id: string) => {
        const updated = contacts.filter(c => c.id !== id);
        setContacts(updated);
        await setStorage(CONTACTS_KEY, updated);
        toast.success("Contact removed");
    };

    const copyAddr = (addr: string) => {
        navigator.clipboard.writeText(addr);
        toast.success("Address copied");
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border/40">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="px-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon size={16} />
                    <span className="ml-1">{t(language, "back")}</span>
                </Button>
                <h2 className="text-base font-semibold">Address Book</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-2 text-primary hover:text-primary/80"
                >
                    <PlusIcon size={18} />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {isAdding && (
                    <Card className="border-primary/40 bg-muted/30 mb-4">
                        <CardContent className="p-4 space-y-3">
                            <h3 className="text-sm font-semibold">Add New Contact</h3>
                            <div>
                                <Label className="text-xs mb-1 block">Contact Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Alice / My Cold Wallet"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs mb-1 block">Wallet Address</Label>
                                <Input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="0x... or bc1... or solana address"
                                    className="h-8 text-sm font-mono"
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Button size="sm" onClick={handleSave} className="flex-1">
                                    Save Contact
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setIsAdding(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {contacts.length === 0 && !isAdding ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <UserIcon size={36} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No saved contacts</p>
                        <p className="text-xs mt-1">Add trusted addresses to quickly send tokens.</p>
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <Card key={contact.id} className="bg-muted/20 border-border/50">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold">
                                        {contact.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{contact.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {contact.address.slice(0, 6)}...{contact.address.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        onClick={() => copyAddr(contact.address)}
                                    >
                                        <CopyIcon size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(contact.id)}
                                    >
                                        <TrashIcon size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
