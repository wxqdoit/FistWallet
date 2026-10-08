import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, TrashIcon, UserIcon, CopyIcon, BookBookmarkIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { getStorage, setStorage } from "@/core/storage";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@store/settings";
import { t } from "@utils/i18n";

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
            toast.error(t(language, 'enterContactNameAndAddress'));
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
        toast.success(t(language, 'contactSavedToast'));
    };

    const handleDelete = async (id: string) => {
        const updated = contacts.filter(c => c.id !== id);
        setContacts(updated);
        await setStorage(CONTACTS_KEY, updated);
        toast.success(t(language, 'contactDeletedToast'));
    };

    const copyAddr = (addr: string) => {
        navigator.clipboard.writeText(addr);
        toast.success(t(language, 'addressCopiedToClipboard'));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col bg-[#070A12] text-white selection:bg-indigo-500/30 font-sans"
        >
            {/* Unified Sticky Header */}
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#070A12]/90 backdrop-blur-md sticky top-0 z-20">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                    <ArrowLeftIcon size={16} weight="bold" />
                </button>
                <div className="flex items-center gap-1.5">
                    <BookBookmarkIcon size={18} className="text-indigo-400" />
                    <h1 className="text-sm font-semibold tracking-tight text-white">{t(language, 'addressBookTitle')}</h1>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        isAdding
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-white/[0.04] border-white/10 hover:border-white/20 text-white/70 hover:text-white'
                    }`}
                >
                    <PlusIcon size={16} weight="bold" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-2xl bg-[#14161E] border border-indigo-500/40 space-y-3 shadow-lg">
                                <h3 className="text-xs font-semibold text-white">{t(language, 'addNewContact')}</h3>
                                <div>
                                    <label className="text-[11px] text-white/50 mb-1 block">{t(language, 'contactNameLabel')}</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t(language, 'contactNamePlaceholder')}
                                        className="w-full h-11 px-3.5 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-white/50 mb-1 block">{t(language, 'walletAddressLabel')}</label>
                                    <input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder={t(language, 'walletAddressPlaceholder')}
                                        className="w-full h-11 px-3.5 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder:text-neutral-500 text-xs font-mono focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 h-10 rounded-full bg-[#1F2330] hover:bg-[#252A3A] border border-white/10 text-white text-xs font-semibold"
                                    >
                                        {t(language, 'cancel')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="flex-1 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                                    >
                                        {t(language, 'saveContact')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {contacts.length === 0 && !isAdding ? (
                    <div className="text-center py-20 text-white/50 space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-[#14161E] border border-white/5 flex items-center justify-center text-white/30">
                            <UserIcon size={32} />
                        </div>
                        <p className="text-sm font-semibold text-white/70">{t(language, 'noContactsYet')}</p>
                        <p className="text-xs text-white/40 max-w-[240px] mx-auto leading-relaxed">
                            {t(language, 'noContactsDesc')}
                        </p>
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <div key={contact.id} className="p-3.5 rounded-2xl bg-[#14161E] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center">
                                    {contact.name[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{contact.name}</p>
                                    <p className="text-xs text-white/40 font-mono mt-0.5">
                                        {contact.address.slice(0, 6)}...{contact.address.slice(-4)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    className="w-8 h-8 rounded-full bg-white/[0.04] text-white/60 hover:text-white flex items-center justify-center transition-colors"
                                    onClick={() => copyAddr(contact.address)}
                                >
                                    <CopyIcon size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors"
                                    onClick={() => handleDelete(contact.id)}
                                >
                                    <TrashIcon size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}

