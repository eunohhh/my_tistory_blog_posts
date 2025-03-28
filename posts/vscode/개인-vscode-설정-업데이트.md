<pre class="bash" data-ke-language="bash"><code>{
  // ========================
  // Workspace UI Settings
  // ========================
  "workbench.iconTheme": "material-icon-theme",
  "workbench.colorTheme": "Default Dark Modern",
  "workbench.colorCustomizations": {
    "[Default Dark Modern]": {
      "activityBarBadge.background": "#2979FF",
      "activityBar.activeBorder": "#2979FF",
      "list.activeSelectionForeground": "#2979FF",
      "list.inactiveSelectionForeground": "#2979FF",
      "list.highlightForeground": "#2979FF",
      "scrollbarSlider.activeBackground": "#2979FF50",
      "editorSuggestWidget.highlightForeground": "#2979FF",
      "textLink.foreground": "#2979FF",
      "progressBar.background": "#2979FF",
      "pickerGroup.foreground": "#2979FF",
      "tab.activeBorder": "#2979FF",
      "notificationLink.foreground": "#2979FF",
      "editorWidget.resizeBorder": "#2979FF",
      "editorWidget.border": "#2979FF",
      "settings.modifiedItemIndicator": "#2979FF",
      "settings.headerForeground": "#2979FF",
      "panelTitle.activeBorder": "#2979FF",
      "breadcrumb.activeSelectionForeground": "#2979FF",
      "menu.selectionForeground": "#2979FF",
      "menubar.selectionForeground": "#2979FF",
      "editor.findMatchBorder": "#2979FF",
      "selection.background": "#2979FF40",
      "statusBarItem.remoteBackground": "#2979FF",
      "editor.lineHighlightBackground": "#2979FF18",
      "editor.lineHighlightBorder": "#2978ff55"
    }
  },

  // ========================
  // Editor &amp; Formatting Settings
  // ========================
  "editor.formatOnSave": true, // 저장 시 자동 포맷팅
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.linkedEditing": true,
  "editor.mouseWheelZoom": true,
  "editor.renderLineHighlight": "all",

  // ========================
  // ESLint &amp; Prettier
  // ========================
  "eslint.codeActionsOnSave.rules": null,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "always",
    "source.fixAll.eslint": "always"
  },
  "eslint.rules.customizations": [
    {
      "rule": "react/jsx-sort-props",
      "severity": "off"
    },
    {
      "rule": "react/function-component-definition",
      "severity": "off"
    },
    {
      "rule": "@typescript-eslint/consistent-indexed-object-style",
      "severity": "off"
    },
    {
      "rule": "@typescript-eslint/prefer-string-starts-ends-with",
      "severity": "off"
    },
    {
      "rule": "@typescript-eslint/explicit-function-return-type",
      "severity": "off"
    },
    {
      "rule": "unicorn/filename-case",
      "severity": "off"
    }
  ],

  // ========================
  // TypeScript Settings
  // ========================
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.inlayHints.enumMemberValues.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "typescript.inlayHints.parameterTypes.enabled": true,
  "typescript.inlayHints.propertyDeclarationTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.experimental.updateImportsOnPaste": true,

  // ========================
  // JavaScript &amp; JSON Settings
  // ========================
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "javascript.preferences.importModuleSpecifierEnding": "minimal",

  // ========================
  // CSS, SCSS, Tailwind Settings
  // ========================
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.experimental.classRegex": [
    [
      "cva$begin:math:text$([^)]*)\\$end:math:text$",
      "[\"'`]([^\"'`]*).*?[\"'`]"
    ],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],

  // ========================
  // Svelte Settings
  // ========================
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "svelte.enable-ts-plugin": true,

  // ========================
  // Python Settings
  // ========================
  "[python]": {
    "editor.formatOnType": true,
    "editor.defaultFormatter": "ms-python.python"
  },
  "python.analysis.typeCheckingMode": "basic",

  // ========================
  // Terminal Settings
  // ========================
  "terminal.integrated.fontFamily": "MesloLGS NF",
  "terminal.integrated.enableImages": true,
  "terminal.integrated.defaultProfile.linux": "sh",
  "terminal.integrated.env.osx": {},
  "terminal.integrated.env.linux": {},

  // ========================
  // Git Settings
  // ========================
  "git.autofetch": true,
  "git.ignoreRebaseWarning": true,
  "git.openRepositoryInParentFolders": "never",

  // ========================
  // UI &amp; Workspace Settings
  // ========================
  "window.commandCenter": false,
  "workbench.layoutControl.enabled": false,
  "workbench.editor.enablePreview": false,
  "workbench.startupEditor": "none",

  // ========================
  // Miscellaneous Settings
  // ========================
  "security.workspace.trust.untrustedFiles": "open",
  // "files.autoSave": "afterDelay",
  "chatgpt.lang": "ko",
  "compile-hero.disable-compile-files-on-did-save-code": false,
  "redhat.telemetry.enabled": true,
  "liveServer.settings.donotVerifyTags": true,
  "liveServer.settings.donotShowInfoMsg": true,
  "php.validate.executablePath": ""
}</code></pre>