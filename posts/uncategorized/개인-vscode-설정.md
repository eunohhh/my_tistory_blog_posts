<pre><code class="language-json">{
    &quot;workbench.iconTheme&quot;: &quot;material-icon-theme&quot;,
    &quot;workbench.colorTheme&quot;: &quot;Default Dark Modern&quot;,
    &quot;editor.linkedEditing&quot;: true,
    &quot;cSpell.diagnosticLevel&quot;: &quot;Hint&quot;,
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
        },
        // will change the color of three dots to red
        //&quot;#ff0000&quot;
        &quot;editorHint.foreground&quot;: &quot;#f000&quot;,
        // will underline the entire word with dots in your chosen color
        &quot;editorHint.border&quot;: &quot;#00ff66&quot;
    },
    &quot;errorLens.decorations&quot;: {
        &quot;errorRange&quot;: {},
        &quot;warningRange&quot;: {},
        &quot;infoRange&quot;: {},
        &quot;hintRange&quot;: {}
    },
    &quot;materialTheme.accent&quot;: &quot;Blue&quot;,
    &quot;svelte.enable-ts-plugin&quot;: true,
    &quot;[python]&quot;: {
        &quot;editor.formatOnType&quot;: true
    },
    &quot;terminal.integrated.fontFamily&quot;: &quot;MesloLGS NF&quot;,
    &quot;tailwindCSS.emmetCompletions&quot;: true,
    &quot;tailwindCSS.experimental.classRegex&quot;: [
        [&quot;cva\\(([^)]*)\\)&quot;, &quot;[\&quot;&#39;`]([^\&quot;&#39;`]*).*?[\&quot;&#39;`]&quot;],
        [&quot;cx\\(([^)]*)\\)&quot;, &quot;(?:&#39;|\&quot;|`)([^&#39;]*)(?:&#39;|\&quot;|`)&quot;],
        [&quot;clsx\\(([^)]*)\\)&quot;, &quot;(?:&#39;|\&quot;|`)([^&#39;]*)(?:&#39;|\&quot;|`)&quot;]
    ],
    &quot;javascript.updateImportsOnFileMove.enabled&quot;: &quot;always&quot;,
    &quot;typescript.updateImportsOnFileMove.enabled&quot;: &quot;always&quot;,
    &quot;css.lint.unknownAtRules&quot;: &quot;ignore&quot;,
    &quot;emmet.includeLanguages&quot;: {
        &quot;javascript&quot;: &quot;javascriptreact&quot;
    },

    &quot;javascript.preferences.importModuleSpecifierEnding&quot;: &quot;minimal&quot;,
    &quot;terminal.integrated.env.osx&quot;: {},
    &quot;console-ninja.featureSet&quot;: &quot;Community&quot;,
    &quot;editor.mouseWheelZoom&quot;: true,
    &quot;terminal.integrated.env.linux&quot;: {},
    &quot;git.autofetch&quot;: true,
    &quot;[javascript]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;[css]&quot;: {
        &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;
    },
    &quot;terminal.integrated.enableImages&quot;: true,
    &quot;terminal.integrated.defaultProfile.linux&quot;: &quot;zsh&quot;,
    &quot;prettier.printWidth&quot;: 108,
    &quot;git.openRepositoryInParentFolders&quot;: &quot;never&quot;,
    &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;,
    &quot;prettier.resolveGlobalModules&quot;: true,
    &quot;prettier.prettierPath&quot;: &quot;./node_modules/prettier&quot;,
    &quot;typescript.enablePromptUseWorkspaceTsdk&quot;: true,
    &quot;typescript.experimental.updateImportsOnPaste&quot;: true,
    &quot;typescript.tsdk&quot;: &quot;/usr/local/lib/node_modules/typescript/lib&quot;,
    &quot;editor.codeActionsOnSave&quot;: {
        &quot;source.organizeImports&quot;: &quot;always&quot;,
        &quot;source.fixAll.eslint&quot;: &quot;always&quot; // ESLint 자동 수정 적용
    },
    &quot;eslint.codeActionsOnSave.rules&quot;: null,
    &quot;editor.formatOnSave&quot;: true,
    &quot;editor.tabSize&quot;: 2,
    &quot;eslint.tabWidth&quot;: 2,
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
    &quot;workbench.editor.enablePreview&quot;: false
}</code></pre>