import { CaidoSDK } from "@/types";
import { EvenBetterAPI } from "@bebiks/evenbetter-api";
import { PageOpenEvent } from "@bebiks/evenbetter-api/src/events/onPageOpen";
import { jwtDecode } from "jwt-decode";
import "./jwt-decoder.css";

interface CodeMirrorEditor {
  state: {
    readOnly: boolean;
    doc: {
      lineAt: (pos: number) => {
        number: number;
        from: number;
        text: string;
      };
    };
    selection: {
      main: {
        from: number;
        to: number;
        head: number;
      };
    };
    sliceDoc: (from: number, to: number) => string;
  };
  contentDOM: HTMLElement;
  dispatch: (changes: any) => void;
}

interface Selection {
  from: number;
  to: number;
  text: string;
}

class JWTDecode {
  private HTMLElement!: HTMLDivElement;
  private textArea!: HTMLTextAreaElement;
  private activeEditor: CodeMirrorEditor | undefined = undefined;
  private selectionInterval: NodeJS.Timeout | undefined;
  private copyIconElement: HTMLElement | undefined;
  private sendToJWTDecoderButton: HTMLElement | undefined;
  private sdk: CaidoSDK;

  constructor(sdk: CaidoSDK) {
    this.sdk = sdk;
    this.initializeHTMLElement();
    this.initializeResizer();
    this.initializeSelectedTextDiv();
    this.initializeTextArea();
    this.initializeCopyIcon();
    this.initializeSendToJWTDecoderButton();
    this.startMonitoringSelection();
  }

  private initializeHTMLElement(): void {
    this.HTMLElement = document.createElement("div");
    this.HTMLElement.classList.add("jwtdecoder-body");
    this.HTMLElement.id = "jwtdecoder-body";
    this.HTMLElement.style.display = "none";
  }

  private initializeResizer(): void {
    const resizer = document.createElement("div");
    resizer.id = "jwtdecoder-resizer";

    let isResizing = false;
    let startY: number;

    const resize = (e: MouseEvent) => {
      if (!isResizing) return;
      const diffY = startY - e.clientY;
      const newHeight = Math.max(10, this.HTMLElement.offsetHeight + diffY);
      this.HTMLElement.style.height = `${newHeight}px`;
      startY = e.clientY;
    };

    const stopResize = () => {
      isResizing = false;
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    };

    resizer.addEventListener("mousedown", (e: MouseEvent) => {
      isResizing = true;
      startY = e.clientY;

      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
    });

    this.HTMLElement.appendChild(resizer);
  }

  private initializeSelectedTextDiv(): void {
    const selectedTextDiv = document.createElement("div");
    selectedTextDiv.classList.add("jwtdecoder-selected-text");

    const selectedTextTopDiv = document.createElement("div");
    selectedTextTopDiv.classList.add("jwtdecoder-selected-text-top");

    selectedTextDiv.appendChild(selectedTextTopDiv);
    this.HTMLElement.appendChild(selectedTextDiv);
  }

  private initializeTextArea(): void {
    this.textArea = document.createElement("textarea");
    this.textArea.classList.add("jwtdecoder-selected-text-box");
    this.textArea.setAttribute("autocomplete", "off");
    this.textArea.setAttribute("autocorrect", "off");
    this.textArea.setAttribute("autocapitalize", "off");
    this.textArea.setAttribute("spellcheck", "false");

    this.textArea.addEventListener("input", this.handleInput.bind(this));

    const selectedTextDiv = this.HTMLElement.querySelector(
      ".jwtdecoder-selected-text"
    );
    if (selectedTextDiv) {
      selectedTextDiv.appendChild(this.textArea);
    }
  }


  private initializeCopyIcon(): void {
    this.copyIconElement = document.createElement("i");
    this.copyIconElement.classList.add("c-icon", "fas", "fa-copy");
    this.copyIconElement.addEventListener(
      "click",
      this.copyToClipboard.bind(this)
    );

    const selectedTextTopDiv = this.HTMLElement.querySelector(
      ".jwtdecoder-selected-text-top"
    );
    if (selectedTextTopDiv) {
      selectedTextTopDiv.appendChild(this.copyIconElement);
    }
  }

  private initializeSendToJWTDecoderButton(): void {
    this.sendToJWTDecoderButton = document.createElement("button");
    this.sendToJWTDecoderButton.textContent = "Send to JWT-ZCoder";
    this.sendToJWTDecoderButton.classList.add("c-button", "send-jwtdecoder");

    this.sendToJWTDecoderButton.addEventListener(
      "click", async ()=>{
        this.sdk.navigation.goTo("/jwtzcoder");
      }
    );

    // Append the button to a specific div in the DOM if it exists
    const selectedTextTopDiv = this.HTMLElement.querySelector(
      ".jwtdecoder-selected-text-top"
    );
    if (selectedTextTopDiv) {
      selectedTextTopDiv.appendChild(this.sendToJWTDecoderButton);
    }
}

  private copyToClipboard(): void {
    const decodedText = this.textArea.value;
    if (decodedText) {
      navigator.clipboard.writeText(decodedText);
    }
  }

  private handleInput(): void {
    let newContent = this.textArea.value;
    if (
      newContent.length <= 0 ||
      !this.activeEditor ||
      this.activeEditor.state.readOnly
    )
      return;
    newContent = jwtDecode(newContent);

    this.activeEditor.dispatch({
      changes: [
        {
          from: this.activeEditor.state.selection.main.from,
          to: this.activeEditor.state.selection.main.to,
          insert: newContent,
        },
      ],
    });
  }


  public updateText(text: string): void {
    this.textArea.value = text;
  }

  public show(): void {
    this.HTMLElement.style.display = "flex";
  }

  public hide(): void {
    this.HTMLElement.style.display = "none";
  }

  public getElement(): HTMLDivElement {
    return this.HTMLElement;
  }

  private getActiveEditor(): CodeMirrorEditor | undefined {
    const activeElement = document.activeElement;
    if (!activeElement) return;

    const cmContent = activeElement.closest(".cm-content");
    if (!cmContent) return;

    return (cmContent as any)?.cmView?.view as CodeMirrorEditor;
  }

  private getCurrentSelection(): Selection {
    const activeEditor = this.getActiveEditor();
    if (!activeEditor) {
      return { from: 0, to: 0, text: "" };
    }

    const { from, to } = activeEditor.state.selection.main;
    return {
      from,
      to,
      text: activeEditor.state.sliceDoc(from, to),
    };
  }

  private startMonitoringSelection(): void {
    const INTERVAL_DELAY = 50;
    let lastSelection = this.getCurrentSelection();

    this.selectionInterval = setInterval(() => {
      const newSelection = this.getCurrentSelection();

      if (
        newSelection.from !== lastSelection.from ||
        newSelection.to !== lastSelection.to
      ) {
        lastSelection = newSelection;
        this.onSelectionChange(newSelection);
      }
    }, INTERVAL_DELAY);
  }

  public stopMonitoringSelection(): void {
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
    }
  }

  private isMouseOver(element: HTMLElement): boolean {
    if (!element) return false;
    return Array.from(document.querySelectorAll(":hover")).includes(element);
  }

  private onSelectionChange(selection: Selection): void {
    if (this.isMouseOver(this.HTMLElement)) return;

    const contextMenu = document.querySelector(".p-contextmenu");
    if (contextMenu && this.isMouseOver(contextMenu as HTMLElement)) return;

    if (selection.text === "") {
      this.hide();
      return;
    }

    this.activeEditor = this.getActiveEditor();

    this.setReadOnly(this.activeEditor?.state.readOnly ?? false);
    this.showjwtDecode(selection.text);
  }

  private showjwtDecode(text: string): void {
    try {
      const decoded = jwtDecode(text);
      this.updateText(JSON.stringify(decoded));
      this.show();
    } catch {

    }

  }

  private setReadOnly(readOnly: boolean): void {
    this.textArea.disabled = readOnly;
  }

  public cleanup(): void {
    this.stopMonitoringSelection();
    this.textArea.removeEventListener("input", this.handleInput);
    if (this.copyIconElement) {
      this.copyIconElement.removeEventListener("click", this.copyToClipboard);
    }
    this.HTMLElement.remove();
  }
}

class JWTDecodeManager {
  private evenBetterAPI: EvenBetterAPI;
  private sdk: CaidoSDK;
  private jwtDecode: JWTDecode | null = null;
  private pageOpenListener: ((data: PageOpenEvent) => void) | null = null;
  private projectChangeListener: (() => Promise<void>) | null = null;

  constructor(sdk: CaidoSDK, evenBetterAPI: EvenBetterAPI) {
    this.evenBetterAPI = evenBetterAPI;
    this.sdk = sdk;
  }

  private attachjwtDecode(): void {
    if (document.getElementById("jwtdecoder-body")) return;

    const sessionListBody = document.querySelector(".c-session-list-body");
    if (!sessionListBody) return;

    this.jwtDecode = new JWTDecode(this.sdk);
    sessionListBody.appendChild(this.jwtDecode.getElement());
  }

  public init(): void {
    const MAX_ATTEMPTS = 80;
    const INTERVAL_DELAY = 25;

    const attach = (): void => {
      let attemptCount = 0;
      const interval = setInterval(() => {
        attemptCount++;
        if (attemptCount > MAX_ATTEMPTS) {
          console.error("Could not find editors");
          clearInterval(interval);
          return;
        }

        const editors = document.querySelectorAll(".cm-editor .cm-content");
        if (!editors.length) return;

        clearInterval(interval);
        this.attachjwtDecode();
      }, INTERVAL_DELAY);
    };

    this.pageOpenListener = (data: PageOpenEvent) => {
      if (this.isCleaned) return;

      if (data.newUrl === "#/replay") attach();
    };

    this.projectChangeListener = async () => {
      if (this.isCleaned) return;

      await new Promise((resolve) => setTimeout(resolve, 500));
      if (window.location.hash === "#/replay") attach();
    };

    this.evenBetterAPI.eventManager.on("onPageOpen", this.pageOpenListener);
    this.evenBetterAPI.eventManager.on(
      "onProjectChange",
      this.projectChangeListener
    );
  }

  private isCleaned: boolean = false;

  public cleanup(): void {
    if (this.isCleaned) return;

    if (this.jwtDecode) {
      this.jwtDecode.cleanup();
      this.jwtDecode = null;
    }

    if (this.pageOpenListener) {
      this.pageOpenListener = null;
    }

    if (this.projectChangeListener) {
      this.projectChangeListener = null;
    }

    this.isCleaned = true;
  }
}
let manager: JWTDecodeManager | null = null;

export const initialize = async (
    sdk: CaidoSDK,
    evenBetterAPI: EvenBetterAPI
  ) => {
    if (!manager) {
        manager = new JWTDecodeManager(sdk,evenBetterAPI);
        manager.init();
      }
  };
  