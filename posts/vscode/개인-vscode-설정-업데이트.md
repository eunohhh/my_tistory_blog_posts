<pre><code class="language-json">{
    // ========================
    // Workspace UI Settings
    // ========================
    &quot;workbench.iconTheme&quot;: &quot;material-icon-theme&quot;,
    &quot;workbench.colorTheme&quot;: &quot;Default Dark Modern&quot;,
    &quot;workbench.colorCustomizations&quot;: {
        &quot;[Default Dark Modern]&quot;: {
            &quot;activityBarBadge.background&quot;: &quot;#2979FF&quot;,
            &quot;activityBar.activeBorder&quot;: &quot;#2979FF&quot;,
            &quot;list.activeSelectionForeground&quot;: &quot;#2979FF&quot;,
            &quot;list.inactiveSelectionForeground&quot;: &quot;#2979FF&quot;,
            &quot;list.highlightForeground&quot;: &quot;#2979FF&quot;,
            &quot;scrollbarSlider.activeBackground&quot;: &quot;#2979FF50&quot;,
            &quot;editorSuggestWidget.highlightForeground&quot;: &quot;#2979FF&quot;,
            &quot;textLink.foreground&quot;: &quot;#2979FF&quot;,
            &quot;progressBar.background&quot;: &quot;#2979FF&quot;,
            &quot;pickerGroup.foreground&quot;: &quot;#2979FF&quot;,
            &quot;tab.activeBorder&quot;: &quot;#2979FF&quot;,
            &quot;notificationLink.foreground&quot;: &quot;#2979FF&quot;,
            &quot;editorWidget.resizeBorder&quot;: &quot;#2979FF&quot;,
            &quot;editorWidget.border&quot;: &quot;#2979FF&quot;,
            &quot;settings.modifiedItemIndicator&quot;: &quot;#2979FF&quot;,
            &quot;settings.headerForeground&quot;: &quot;#2979FF&quot;,
            &quot;panelTitle.activeBorder&quot;: &quot;#2979FF&quot;,
            &quot;breadcrumb.activeSelectionForeground&quot;: &quot;#2979FF&quot;,
            &quot;menu.selectionForeground&quot;: &quot;#2979FF&quot;,
            &quot;menubar.selectionForeground&quot;: &quot;#2979FF&quot;,
            &quot;editor.findMatchBorder&quot;: &quot;#2979FF&quot;,
            &quot;selection.background&quot;: &quot;#2979FF40&quot;,
            &quot;statusBarItem.remoteBackground&quot;: &quot;#2979FF&quot;
        }
    },

    // ========================
    // Editor &amp; Formatting Settings
    // ========================
    &quot;editor.formatOnSave&quot;: true, // 저장 시 자동 포맷팅
    &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;,
    &quot;editor.tabSize&quot;: 2,
    &quot;editor.linkedEditing&quot;: true,
    &quot;editor.mouseWheelZoom&quot;: true,

    // ========================
    // ESLint &amp; Prettier
    // ========================
    &quot;eslint.codeActionsOnSave.rules&quot;: null,
    &quot;editor.codeActionsOnSave&quot;: {
        &quot;source.organizeImports&quot;: &quot;always&quot;,
        &quot;source.fixAll.eslint&quot;: &quot;always&quot;
    },
    &quot;eslint.rules.customizations&quot;: [
        {
            &quot;rule&quot;: &quot;react/jsx-sort-props&quot;,
            &quot;severity&quot;: &quot;off&quot;
        },
        {
            &quot;rule&quot;: &quot;react/function-component-definition&quot;,
            &quot;severity&quot;: &quot;off&quot;
        },
        {
            &quot;rule&quot;: &quot;@typescript-eslint/consistent-indexed-object-style&quot;,
            &quot;severity&quot;: &quot;off&quot;
        },
        {
            &quot;rule&quot;: &quot;@typescript-eslint/prefer-string-starts-ends-with&quot;,
            &quot;severity&quot;: &quot;off&quot;
        },
        {
            &quot;rule&quot;: &quot;@typescript-eslint/explicit-function-return-type&quot;,
            &quot;severity&quot;: &quot;off&quot;
        },
        {
            &quot;rule&quot;: &quot;unicorn/filename-case&quot;,
            &quot;severity&quot;: &quot;off&quot;
        }
    ],

    // ========================
    // TypeScript Settings
    // ========================
    &quot;[typescript]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;[typescriptreact]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;typescript.updateImportsOnFileMove.enabled&quot;: &quot;always&quot;,
    &quot;typescript.inlayHints.enumMemberValues.enabled&quot;: true,
    &quot;typescript.inlayHints.functionLikeReturnTypes.enabled&quot;: true,
    &quot;typescript.inlayHints.parameterTypes.enabled&quot;: true,
    &quot;typescript.inlayHints.propertyDeclarationTypes.enabled&quot;: true,
    &quot;typescript.inlayHints.variableTypes.enabled&quot;: true,
    &quot;typescript.inlayHints.parameterNames.enabled&quot;: &quot;all&quot;,
    &quot;typescript.experimental.updateImportsOnPaste&quot;: true,

    // ========================
    // JavaScript &amp; JSON Settings
    // ========================
    &quot;[javascript]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;[json]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;vscode.json-language-features&quot;
    },
    &quot;[jsonc]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;javascript.updateImportsOnFileMove.enabled&quot;: &quot;always&quot;,
    &quot;javascript.preferences.importModuleSpecifierEnding&quot;: &quot;minimal&quot;,

    // ========================
    // CSS, SCSS, Tailwind Settings
    // ========================
    &quot;[css]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;[scss]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;tailwindCSS.emmetCompletions&quot;: true,
    &quot;tailwindCSS.experimental.classRegex&quot;: [
        [
            &quot;cva$begin:math:text$([^)]*)\\$end:math:text$&quot;,
            &quot;[\&quot;&#39;`]([^\&quot;&#39;`]*).*?[\&quot;&#39;`]&quot;
        ],
        [&quot;cx\\(([^)]*)\\)&quot;, &quot;(?:&#39;|\&quot;|`)([^&#39;]*)(?:&#39;|\&quot;|`)&quot;],
        [&quot;clsx\\(([^)]*)\\)&quot;, &quot;(?:&#39;|\&quot;|`)([^&#39;]*)(?:&#39;|\&quot;|`)&quot;]
    ],

    // ========================
    // Svelte Settings
    // ========================
    &quot;[svelte]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;svelte.svelte-vscode&quot;
    },
    &quot;svelte.enable-ts-plugin&quot;: true,

    // ========================
    // Python Settings
    // ========================
    &quot;[python]&quot;: {
        &quot;editor.formatOnType&quot;: true,
        &quot;editor.defaultFormatter&quot;: &quot;ms-python.python&quot;
    },
    &quot;python.analysis.typeCheckingMode&quot;: &quot;basic&quot;,

    // ========================
    // Terminal Settings
    // ========================
    &quot;terminal.integrated.fontFamily&quot;: &quot;MesloLGS NF&quot;,
    &quot;terminal.integrated.enableImages&quot;: true,
    &quot;terminal.integrated.defaultProfile.linux&quot;: &quot;zsh&quot;,
    &quot;terminal.integrated.env.osx&quot;: {},
    &quot;terminal.integrated.env.linux&quot;: {},

    // ========================
    // Git Settings
    // ========================
    &quot;git.autofetch&quot;: true,
    &quot;git.ignoreRebaseWarning&quot;: true,
    &quot;git.openRepositoryInParentFolders&quot;: &quot;never&quot;,

    // ========================
    // UI &amp; Workspace Settings
    // ========================
    &quot;window.commandCenter&quot;: false,
    &quot;workbench.layoutControl.enabled&quot;: false,
    &quot;workbench.startupEditor&quot;: &quot;none&quot;,

    // ========================
    // Miscellaneous Settings
    // ========================
    &quot;security.workspace.trust.untrustedFiles&quot;: &quot;open&quot;,
    &quot;files.autoSave&quot;: &quot;afterDelay&quot;,
    &quot;chatgpt.lang&quot;: &quot;ko&quot;,
    &quot;compile-hero.disable-compile-files-on-did-save-code&quot;: false
}</code></pre>