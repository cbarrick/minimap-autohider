const { CompositeDisposable } = require("atom");

const config = require("./config");

module.exports = {
  config,
  active: false,
  isActive() {
    return this.active;
  },
  activate() {
    return this.subscriptions = new CompositeDisposable();
  },
  consumeMinimapServiceV1(minimap1) {
    this.minimap = minimap1;
    return this.minimap.registerPlugin("minimap-autohide-2", this);
  },
  deactivate() {
    this.minimap.unregisterPlugin("minimap-autohide-2");
    return this.minimap = null;
  },
  activatePlugin() {
    if (this.active) {
      return;
    }
    this.active = true;
    return this.minimapsSubscription = this.minimap.observeMinimaps(minimap => {
      let editor, minimapElement;
      minimapElement = atom.views.getView(minimap);
      editor = minimap.getTextEditor();
      return this.subscriptions.add(editor.editorElement.onDidChangeScrollTop(() =>
        this.handleScroll(minimapElement)
      ));
    });
  },
  handleScroll(el) {
    if(el.timer) {
      clearTimeout(el.timer);
    } else {
      el.classList.add("scrolling");
    }
    el.timer = setTimeout(
      () => {
        el.classList.remove("scrolling");
        el.timer = undefined;
      },
      atom.config.get("minimap-autohide-2").TimeToHide
    );
  },
  deactivatePlugin() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.minimapsSubscription.dispose();
    return this.subscriptions.dispose();
  }
};