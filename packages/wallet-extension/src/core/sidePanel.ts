type ChromeSidePanel = {
    setOptions: (options: { enabled: boolean; path?: string }, callback?: () => void) => void;
    open?: (options: { windowId?: number }, callback?: () => void) => void;
};

type ChromeWindows = {
    getCurrent: (callback: (window: { id?: number } | undefined) => void) => void;
};

function getChromeApis(): {
    sidePanel?: ChromeSidePanel;
    windows?: ChromeWindows;
} {
    const chromeApi = (globalThis as {
        chrome?: { sidePanel?: ChromeSidePanel; windows?: ChromeWindows };
    }).chrome;
    return {
        sidePanel: chromeApi?.sidePanel,
        windows: chromeApi?.windows,
    };
}

function setSidePanelOptions(sidePanel: ChromeSidePanel, enabled: boolean): Promise<void> {
    const path = enabled ? 'index.html?view=sidepanel' : 'index.html';
    return new Promise((resolve) => {
        try {
            sidePanel.setOptions({ enabled, path }, () => resolve());
        } catch {
            resolve();
        }
    });
}

export async function setSidePanelMode(enabled: boolean, openPanel = false): Promise<void> {
    const { sidePanel, windows } = getChromeApis();
    if (!sidePanel?.setOptions) {
        return;
    }

    await setSidePanelOptions(sidePanel, enabled);

    if (!enabled || !openPanel || !sidePanel.open) {
        return;
    }

    if (windows?.getCurrent) {
        windows.getCurrent((currentWindow) => {
            if (!currentWindow?.id) {
                return;
            }
            try {
                sidePanel.open?.({ windowId: currentWindow.id });
            } catch {
                return;
            }
        });
        return;
    }

    try {
        sidePanel.open({ windowId: undefined });
    } catch {
        return;
    }
}
